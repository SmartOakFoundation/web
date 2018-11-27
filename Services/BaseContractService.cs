using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Options;
using Nethereum.Contracts;
using Nethereum.RPC.Eth.DTOs;
using Nethereum.Web3;
using Newtonsoft.Json;
using SmartOak.Common.Options;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;

namespace SmartOak.Web.Services
{
    public abstract class BaseContractService
    {
        public class AbiEntity
        {
            public class AbiFunctionInput {
                public string name;
                public string type;
            }
            public string constant;
            public string type;
            public string name;
            public string stateMutability;
            public AbiFunctionInput[] inputs;
        }

        protected IMemoryCache cache;
        protected NameRegistryContractService nameRegistry;
        protected Web3 web3;
        protected Contract contract;
        protected EthereumOptions options;


        public string Address
        {
            get
            {
                return contract.Address;
            }
        }

        public BaseContractService(
            IMemoryCache _cache, 
            IHostingEnvironment environment,
            IOptions<EthereumOptions> optionsAccessor,
            NameRegistryContractService _nameRegistry)
        {
            this.cache = _cache;
            this.nameRegistry = _nameRegistry;
            options = optionsAccessor.Value;

            web3 = new Web3("https://" + options.EthereumNetwork + ".infura.io/" + options.InfuraToken);
         //   web3 = new Web3("http://localhost:8545");

            LoadAbi(null);
            WatchContractFile(environment);

        }

        protected Task<BlockParameter> GetOldBlock(ulong offset)
        {
            return web3.Eth.Blocks.GetBlockNumber.SendRequestAsync().ContinueWith((res) =>
            {
                return new BlockParameter(((ulong)res.Result.Value)-offset);
            });
        }

        protected Task<T> Call<T>(string funcName, params object[] arguments)
        {
            return this.contract.GetFunction(funcName).CallAsync<T>(arguments);
        }

        protected async Task<List<EventLog<T>>> GetEvent<T>(string eventName,uint offset,uint skip) where T : new()
        {
           
            var blockNumber = await web3.Eth.Blocks.GetBlockNumber.SendRequestAsync() ;
            if(offset == 0)
            {//if not specified search from latest
                offset =(uint)( blockNumber.Value - 1);
            }
            var ev = this.contract.GetEvent(eventName);
            var toBlock = new BlockParameter((ulong)blockNumber.Value - skip);
            if (skip == 0)
            {
                toBlock = BlockParameter.CreateLatest();
            }
            var filterInput = ev.CreateFilterInput(new BlockParameter(((ulong)blockNumber.Value)-offset), toBlock);
            var data = await ev.GetAllChanges<T>(filterInput);
            return data;
        }

        protected async Task<T> Call<T>(uint blockOffset,string funcName, params object[] arguments)
        {
            var block = await GetOldBlock(blockOffset);
            BlockParameter p = new BlockParameter((uint)(block.BlockNumber.Value));
            var res = await this.contract.GetFunction(funcName).CallAsync<T>(p, arguments);
            return res;
        }


        private void WatchContractFile(IHostingEnvironment environment)
        {
            var path = Path.Combine(environment.WebRootPath, "../abi");

            PhysicalFileProvider fileProvider = new PhysicalFileProvider(path);
            var token = fileProvider.Watch("*.json");
            token.RegisterChangeCallback(LoadAbi, new object());
        }

        protected AbiEntity[] GetAbi()
        {
            return JsonConvert.DeserializeObject<AbiEntity[]>(abi);
        }

        protected string abi;
        protected abstract void LoadAbi(object data);



    }
}
