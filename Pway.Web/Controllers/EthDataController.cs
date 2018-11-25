using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using Nethereum.Util;
using Nethereum.Web3;
using Pway.Common.Options;
using Pway.Common.Utils;
using Pway.Data.Models;
using Pway.Web.Models;
using Pway.Web.Services;
using Pway.Web.Utils;
using System;
using System.Linq;
using System.Diagnostics;
using System.Numerics;
using System.Threading.Tasks;
using static Nethereum.Util.UnitConversion;

namespace Pway.Web.Controllers
{
    [Route("api/[controller]")]
    public class EthDataController : Controller
    {
        private PwayTokenContractService pwayToken;
        private EthereumService walletEthereumService;
        private IConfiguration config;
        private readonly IOptions<EthereumOptions> ethereumOptions;
        private NameRegistryContractService nameRegistry;
        private readonly UserManager<ApplicationUser> userManager;

        public EthDataController(IConfiguration _config,
            IOptions<EthereumOptions> _ethereumOptions,
            PwayTokenContractService _pwayToken,
            UserManager<ApplicationUser> userManager,
            EthereumService _walletEthereumService,
            NameRegistryContractService _nameRegistry)
        {
            this.config = _config;
            this.ethereumOptions = _ethereumOptions;
            this.pwayToken = _pwayToken;
            this.walletEthereumService = _walletEthereumService;
            this.nameRegistry = _nameRegistry;
            this.userManager = userManager;
        }
        
        [HttpGet("getTransfers/{offset}")]
        public async Task<JsonResult> GetTransfers(uint offset)
        {
            var data = await pwayToken.GetLatestTransfers(offset, String.Empty, String.Empty);
            return JsonResultStatus.OK(data);
        }

        [HttpGet("getTransfers")]
        public async Task<JsonResult> GetTransfers()
        {
            var data = await pwayToken.GetLatestTransfers(0, String.Empty, String.Empty);
            return JsonResultStatus.OK(data);
        }
        

        [HttpGet("getTransfers/{from}/{to}/{offset}")]
        public async Task<JsonResult> GetTransfers(string from, string to, uint offset)
        {
            var data = await pwayToken.GetLatestTransfers(offset, from, to);
            return JsonResultStatus.OK(data);
        }

        [HttpGet("getTransfers/{to}/{offset}")]
        public async Task<JsonResult> GetTransfers(string to, uint offset)
        {
            var data = await pwayToken.GetLatestTransfers(offset, String.Empty, to);
            return JsonResultStatus.OK(data);
        }

        [HttpGet("getAddr")]
        public  JsonResult GetAdressess()
        {
            return JsonResultStatus.OK(new
            { 
                PwayCompanyAddress = nameRegistry.Addresses[ContractNames.PwayCompany],
                PwayStoreAddress = nameRegistry.Addresses[ContractNames.GamesStore],
                PwayTokenAddress = nameRegistry.Addresses[ContractNames.PwayToken],
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
