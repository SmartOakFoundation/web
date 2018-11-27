using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using Nethereum.Hex.HexConvertors.Extensions;
using Nethereum.Signer;
using Nethereum.Web3;
using SmartOak.Common.Helpers;
using SmartOak.Common.Options;
using System;
using System.Numerics;
using System.Text;
using System.Threading.Tasks;

namespace SmartOak.Web.Services
{
    /*
     * 
      function pad(num, size) {
            var s = num+"";
            while (s.length < size) s = "0" + s;
            return s;
        }
        function toHex(str) {
	        var hex = '';
	        for(var i=0;i<str.length;i++) {
		        hex += pad(str.charCodeAt(i).toString(16),2);
	        }
	        return hex;
        }
        web3.personal.sign("0x"+toHex(plainMessage),adr,function(err,data){
        console.log(data);
        })
        */
    public class SignatureVerifierService : BaseContractService
    {

        public SignatureVerifierService(
            IMemoryCache _cache, 
            IHostingEnvironment environment,
             IOptions<EthereumOptions> optionsAccessor,
            NameRegistryContractService _nameRegistry) :
          base(_cache, environment, optionsAccessor, _nameRegistry)
        {

        }
        
        private string toHex(string message)
        {
            byte[] ba = Encoding.Default.GetBytes(message);
            var hexString =  BitConverter.ToString(ba).Replace("-", "");
            return hexString;
        }

        public async Task<bool> ValidateSignature(string address,string message,string signature)
        {
            string text = toHex(message);
            var signer = new EthereumMessageSigner();
            var account = signer.EcRecover(text.HexToByteArray(), signature);
            return account.Equals(address, StringComparison.InvariantCultureIgnoreCase);
        }

        protected override void LoadAbi(object data)
        {
            /*
                Not used for now
            */
            abi = AbiReader.Read("SignatureVerifier.json");
            contract = web3.Eth.GetContract(abi, options.SignatureVerifier);
        }
        
    }
}
