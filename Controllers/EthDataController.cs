using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using Nethereum.Util;
using Nethereum.Web3;
using SmartOak.Common.Options;
using SmartOak.Common.Utils;
using SmartOak.Data.Models;
using SmartOak.Web.Models;
using SmartOak.Web.Services;
using SmartOak.Web.Utils;
using System;
using System.Linq;
using System.Diagnostics;
using System.Numerics;
using System.Threading.Tasks;
using static Nethereum.Util.UnitConversion;

namespace SmartOak.Web.Controllers
{
    [Route("api/[controller]")]
    public class EthDataController : Controller
    {
        private SmartOakTokenContractService SmartOakToken;
        private EthereumService walletEthereumService;
        private IConfiguration config;
        private readonly IOptions<EthereumOptions> ethereumOptions;
        private NameRegistryContractService nameRegistry;
        private readonly UserManager<ApplicationUser> userManager;

        public EthDataController(IConfiguration _config,
            IOptions<EthereumOptions> _ethereumOptions,
            SmartOakTokenContractService _SmartOakToken,
            UserManager<ApplicationUser> userManager,
            EthereumService _walletEthereumService,
            NameRegistryContractService _nameRegistry)
        {
            this.config = _config;
            this.ethereumOptions = _ethereumOptions;
            this.SmartOakToken = _SmartOakToken;
            this.walletEthereumService = _walletEthereumService;
            this.nameRegistry = _nameRegistry;
            this.userManager = userManager;
        }
        
        [HttpGet("getTransfers/{offset}")]
        public async Task<JsonResult> GetTransfers(uint offset)
        {
            var data = await SmartOakToken.GetLatestTransfers(offset, String.Empty, String.Empty);
            return JsonResultStatus.OK(data);
        }

        [HttpGet("getTransfers")]
        public async Task<JsonResult> GetTransfers()
        {
            var data = await SmartOakToken.GetLatestTransfers(0, String.Empty, String.Empty);
            return JsonResultStatus.OK(data);
        }
        

        [HttpGet("getTransfers/{from}/{to}/{offset}")]
        public async Task<JsonResult> GetTransfers(string from, string to, uint offset)
        {
            var data = await SmartOakToken.GetLatestTransfers(offset, from, to);
            return JsonResultStatus.OK(data);
        }

        [HttpGet("getTransfers/{to}/{offset}")]
        public async Task<JsonResult> GetTransfers(string to, uint offset)
        {
            var data = await SmartOakToken.GetLatestTransfers(offset, String.Empty, to);
            return JsonResultStatus.OK(data);
        }

        [HttpGet("getAddr")]
        public  JsonResult GetAdressess()
        {
            return JsonResultStatus.OK(new
            { 
                SmartOakCompanyAddress = nameRegistry.Addresses[ContractNames.SmartOakCompany],
                SmartOakStoreAddress = nameRegistry.Addresses[ContractNames.GamesStore],
                SmartOakTokenAddress = nameRegistry.Addresses[ContractNames.SmartOakToken],
                ethereumOptions.Value.EthereumNetwork
            });
        }

        public IActionResult Error()
        {
            ViewData["RequestId"] = Activity.Current?.Id ?? HttpContext.TraceIdentifier;
            return View();
        }
    }
}
