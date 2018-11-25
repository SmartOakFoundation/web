using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using Pway.Common.Helpers;
using Pway.Common.Options;
using System;
using System.Globalization;
using System.Linq;
using System.Collections.Generic;
using System.Numerics;
using System.Threading.Tasks;
using Pway.Web.Models;

namespace Pway.Web.Services
{
    public class PwayGamesStoreContractService : BaseContractService
    {
        public uint MULTI_KEY_MARK = ((uint)Math.Pow(2, 32)) - 1;
        public PwayGamesStoreContractService(
            IMemoryCache _cache,
            IHostingEnvironment environment,
            IOptions<EthereumOptions> optionsAccessor,
            NameRegistryContractService _nameRegistry) :

         base(_cache, environment, optionsAccessor, _nameRegistry)
        {

        }

        public async Task<BigInteger> GetPrice(uint gameId)
        {
            var pricesTask = Call<BigInteger>("getPrice", gameId);
            var price = await pricesTask;
            return price;
        }

        public async Task<BigInteger> getPriceInUSD(uint gameId)
        {
            var pricesTask = Call<BigInteger>("getPriceInUSD", gameId);
            var price = await pricesTask;
            return price;
        }

        public async Task<List<BuyGamesModel>> GetRecentlyBoughtGames(uint _offset, uint _skip)
        {
            var games = await GetEvent<BuyGamesModel>("GamePurchased", _offset, _skip);
            return games.Select(x => new BuyGamesModel()
            {
                buyer = x.Event.buyer,
                blockNumber = (ulong)x.Log.BlockNumber.Value,
                txHash = x.Log.TransactionHash,
                gameId = x.Event.gameId,
                gameLicenseId = x.Event.gameLicenseId
            }).ToList();
        }

        public async Task<List<Tuple<int, int>>> GetAccountGameLicenses(uint blockOffset, string address, int page)
        {
            BigInteger divider = BigInteger.Pow(new BigInteger(2), 32);
            var licences = await Call<List<BigInteger>>(blockOffset, "getAccountLicences", address, page);

            var list = new List<Tuple<int, int>>();

            foreach (var bi in licences)
            {
                var gameId = (int)(bi / divider);
                var licenceId = (int)(bi & (divider - 1));

                if (gameId != 0)
                {
                    list.Add(new Tuple<int, int>(gameId, licenceId));
                }
            }

            return list;
        }

        protected override void LoadAbi(object data)
        {
            abi = AbiReader.Read("PwayGamesStore.json");
            contract = web3.Eth.GetContract(abi, nameRegistry.Addresses["GamesStore"]);
        }
    }

}
