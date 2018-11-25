using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Pway.Web.Controllers;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Pway.Web.Services
{
    public class GamesPurchaseeUpdater : IHostedService, IDisposable
    {
        private readonly ILogger<GamesPurchaseeUpdater> logger;
        private readonly IHubContext<NotifyHub, INotifyClient> hub;
        private PwayGamesStoreContractService _store;
        private HashSet<string> processedTx;
        private Timer _timer;

        public GamesPurchaseeUpdater(
            ILogger<GamesPurchaseeUpdater> logger,
            IHubContext<NotifyHub, INotifyClient> hub)
        {
            _store = (PwayGamesStoreContractService)Startup.ServiceProvider.GetService(typeof(PwayGamesStoreContractService));

            this.logger = logger;
            processedTx = new HashSet<string>();
            this.hub = hub;
        }

        public Task StartAsync(CancellationToken cancellationToken)
        {
            logger.LogInformation("Timed Background Service is starting.");

            _timer = new Timer(DoWork, null, TimeSpan.Zero,
                TimeSpan.FromSeconds(20));

            return Task.CompletedTask;
        }

        private async void DoWork(object state)
        {
            try
            {
                var games = await _store.GetRecentlyBoughtGames(100, 7);
                List<Task> allTasks = new List<Task>();
                games.Where(x => processedTx.Contains(x.txHash) == false).Select(x => x.buyer).ToList().ForEach(x =>
                {
                    allTasks.Add(hub.Clients.All.BroadcastNewGameBought(x));
                });
                games.Where(x => processedTx.Contains(x.txHash) == false).ToList().ForEach(x =>
                {
                    processedTx.Add(x.txHash);
                });
                Task.WaitAll(allTasks.ToArray());
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Hub crashed.");
            }
        }

        public Task StopAsync(CancellationToken cancellationToken)
        {
            logger.LogInformation("Timed Background Service is stopping.");

            _timer?.Change(Timeout.Infinite, 0);

            return Task.CompletedTask;
        }

        public void Dispose()
        {
            _timer?.Dispose();
        }
    }
}
