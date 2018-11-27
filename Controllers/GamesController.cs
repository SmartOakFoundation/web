using Microsoft.AspNetCore.Mvc;
using SmartOak.Data;
using SmartOak.Web.Utils;
using System.Linq;
using System.Threading.Tasks;
using System;
using System.Collections.Generic;
using SmartOak.Web.Services;
using SmartOak.Web.Models;
using Microsoft.Extensions.Logging;

namespace SmartOak.Web.Controllers
{
    [Route("api/[controller]")]
    public class GamesController : Controller
    {
        private readonly ApplicationDbContext dbContext;
        private readonly SmartOakStoreContractService SmartOakStore;
        private readonly ILogger<GamesController> logger;

        public GamesController(ApplicationDbContext dbContext,
            SmartOakStoreContractService SmartOakStoreContractService,
            ILogger<GamesController> logger)
        {
            this.dbContext = dbContext;
            this.SmartOakStore = SmartOakStoreContractService;
            this.logger = logger;
        }

        [HttpGet()]
        public JsonResult GetGameList()
        {
            var games = dbContext.Games.Select(x => new
            {
                x.Id,
                x.ImagePath,
                x.Name,
                x.Price,
                x.PriceUSD,
                x.ShortDescription,
                x.EthereumId,
                HasAnyLicence = dbContext.GameKeys.Where(z => z.Game.Id == x.Id && !z.IsPurchased).Count() > 0,
                x.SteamLink
            }).ToList();

            return JsonResultStatus.OK(games);
        }

        [HttpGet("gamekeys/{id}")]
        public async Task<JsonResult> GetSecretGameKeys(int id)
        {
            List<GameKeyViewModel> keys = new List<GameKeyViewModel>();
            List<int> notSetupKeysIds = new List<int>();

            if (isUserValid())
            {
                var address = TempData["_validatedUserAddress"].ToString();

                List<Tuple<int, int>> licences = new List<Tuple<int, int>>();
                int page = 0;
                List<Tuple<int, int>> tmp;
                do
                {
                    tmp = await SmartOakStore.GetAccountGameLicenses(5,address, page);
                    licences.AddRange(tmp.ToList());
                    page++;

                } while (tmp.Count > 0);


                var groups = licences.GroupBy(x => x.Item1, y => y.Item2).Select(x => new { GameId = x.Key, Licences = x.ToList() }).ToList();
                groups = groups.Where(x => x.GameId == id).ToList();

                foreach (var game in groups)
                {
                    var groupKeys = dbContext.GameKeys
                        .Where(x => x.Game.EthereumId == game.GameId && game.Licences.Contains(x.EthereumLicenceId));
                        
                    keys.AddRange(groupKeys.Select(x => new GameKeyViewModel { Name = x.Game.Name, Key = x.Key }).ToList());
                    notSetupKeysIds.AddRange(groupKeys.Where(x => !x.IsPurchased).Select(x => x.Id));
                }

                //updates IsPurchased = true 
                var licenecesToUpdate = dbContext.GameKeys.Where(x => notSetupKeysIds.Contains(x.Id)).ToList();
                licenecesToUpdate.ForEach(x => x.IsPurchased = true);
                dbContext.SaveChanges();
            }

            return JsonResultStatus.OK(keys);
        }


        [HttpGet("usersgames")]
        public async Task<JsonResult> GetUsersGames()
        {
            var games = dbContext.Games.Select(x => new
            {
                x.Id,
                x.ImagePath,
                x.Name,
                x.Price,
                x.PriceUSD,
                x.ShortDescription,
                x.EthereumId,
                x.SteamLink
            }).ToList();

            if (isUserValid())
            {
                var address = TempData["_validatedUserAddress"].ToString();
                List<Tuple<int, int>> licences = new List<Tuple<int, int>>();
                int page = 0;
                List<Tuple<int, int>> tmp;
                do
                {
                    tmp = await SmartOakStore.GetAccountGameLicenses(5,address, page);
                    licences.AddRange(tmp.ToList());
                    page++;

                } while (tmp.Count > 0);

                games = games.Where(x => licences.Select(y=>y.Item1).Contains(x.EthereumId.Value)).ToList();
            }
            else
            {
                games.Clear();
            }

            return JsonResultStatus.OK(games);

        }

        [HttpGet("{id}")]
        public JsonResult GetGame(int id)
        {
            return JsonResultStatus.OK(dbContext.Games.Single(x => x.Id == id));
        }

        private bool isUserValid()
        {
            bool val = false;
            if (!bool.TryParse(Convert.ToString(TempData["_isUserValid"]), out val))
            {
                val = false;
            };
            TempData.Keep();
            return val;
        }

    }
}
