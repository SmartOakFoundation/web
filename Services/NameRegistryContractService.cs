using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Options;
using SmartOak.Common.Helpers;
using SmartOak.Common.Options;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SmartOak.Web.Services
{
    public class NameRegistryContractService : BaseContractService
    {
        private Dictionary<string, string> addresses = new Dictionary<string, string>();
        public Dictionary<string, string> Addresses
        {
            get
            {
                lock (addresses)
                {
                    return addresses;
                }
            }
        }

        public NameRegistryContractService(
            IMemoryCache _cache, 
            IHostingEnvironment environment,
            IOptions<EthereumOptions> optionsAccessor) :
            base(_cache,  environment, optionsAccessor, null)
        {
            //LoadAddresses();
        }

        protected override void LoadAbi(object data)
        {
            abi = AbiReader.Read("NameRegistry.json");
            contract = web3.Eth.GetContract(abi, options.NameRegistryAddress);
            Reset();
        }

        public void Reset()
        {
            LoadAddresses();
        }

        private void LoadAddresses()
        {
            var tasks = new List<Task<string>>();
            var names = options.ContratNames.Split(",");

            foreach (var name in names)
                tasks.Add(GetAddressAsync(name.Trim()));

            Task.WaitAll(tasks.ToArray());

            lock (addresses)
            {
                addresses.Clear();
                for (var i = 0; i < names.Length; i++)
                    addresses.Add(names[i].Trim(), tasks[i].Result);

            }
        }

        private async Task<string> GetAddressAsync(string contractName)
        {
            return await Call<string>("getAddress", contractName);
        }

    }
}


