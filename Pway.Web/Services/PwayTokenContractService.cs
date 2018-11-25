using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using Pway.Common.Helpers;
using Pway.Common.Options;
using Pway.Web.Models;
using System;
using System.Linq;
using System.Collections.Generic;
using System.Numerics;
using System.Threading.Tasks;

namespace Pway.Web.Services
{
    public class PwayTokenContractService : BaseContractService
    {

        public PwayTokenContractService(
            IMemoryCache _cache,
            IHostingEnvironment environment,
            IOptions<EthereumOptions> optionsAccessor,
            NameRegistryContractService _nameRegistry) :
         base(_cache, environment, optionsAccessor, _nameRegistry){ }

        public async Task<BigInteger> TotalSupply()
        {
            var totalSupply = cache.Get<BigInteger?>("totalSupply");
            if (totalSupply == null)
            {
                totalSupply = await Call<BigInteger>("totalSupply");
                cache.Set("totalSupply", totalSupply, TimeSpan.FromDays(1));
            }

            return totalSupply.Value;
        }

        public async Task<BigInteger> BalanceOf(string address)
        {
            return await Call<BigInteger>("balanceOf", address);
        }


        public async Task<List<TransferModel>> GetLatestTransfers(uint _offset, uint _skip, string desiredFrom, string desiredTo)
        {
            var data = await GetEvent<TransferModel>("Transfer", _offset, _skip);
            var result = data.Select(x => new TransferModel()
            {
                blockNumber = (uint)x.Log.BlockNumber.Value,
                from = x.Event.from,
                to = x.Event.to,
                value = x.Event.value
            }).Where(x =>
                 (string.IsNullOrEmpty(desiredFrom) || x.from.ToLower() == desiredFrom.ToLower())
                 &&
                 (string.IsNullOrEmpty(desiredTo)) || x.to.ToLower() == desiredTo.ToLower())
                 .ToList();

            return result;
        }

        public async Task<List<TransferModel>> GetLatestTransfers(uint _offset, string desiredFrom, string desiredTo)
        {
            return await GetLatestTransfers(_offset, 0, desiredFrom, desiredTo);
        }

        protected override void LoadAbi(object data)
        {
            abi = AbiReader.Read("PwayToken.json");
            contract = web3.Eth.GetContract(abi, nameRegistry.Addresses["PwayToken"]);
        }
    }

}
