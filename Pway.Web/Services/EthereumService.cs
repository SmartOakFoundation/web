using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using Nethereum.Web3;
using Pway.Common.Options;
using System.Threading.Tasks;
using static Nethereum.Util.UnitConversion;

namespace Pway.Web.Services
{
    public class EthereumService
    {
        private IConfiguration config;
        private IMemoryCache cache;
        public Web3 web3;

        public EthereumService(
            IMemoryCache _cache, 
            IConfiguration _config, 
            IHostingEnvironment environment,
            IOptions<EthereumOptions> optionsAccessor)
        {
            this.config = _config;
            this.cache = _cache;


            web3 = new Web3("https://" + optionsAccessor.Value.EthereumNetwork + ".infura.io/" + optionsAccessor.Value.InfuraToken);

         //   web3 = new Web3("http://localhost:8545");
            //var account = new Wallet(config["Wordlist"], null).GetAccount(config["HdWalletAddress"]);
        }
        

        public async Task<decimal> BalanceOf(string address)
        {

            var balance = await web3.Eth.GetBalance.SendRequestAsync(address);
            return Web3.Convert.FromWei(balance, EthUnit.Ether);
        }

       

    }
}
