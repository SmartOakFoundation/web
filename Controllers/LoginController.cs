using Microsoft.AspNetCore.Mvc;
using SmartOak.Data;
using SmartOak.Web.Utils;
using System.Linq;
using System.Threading.Tasks;
using System;
using Microsoft.AspNetCore.Http;
using SmartOak.Web.Services;

namespace SmartOak.Web.Controllers
{
    [Route("api/[controller]")]
    public class LoginController : Controller
    {
        private readonly ApplicationDbContext dbContext;
        private readonly SignatureVerifierService verifier;

        public LoginController(ApplicationDbContext dbContext,
            SignatureVerifierService _verifierService)
        {
            this.dbContext = dbContext;
            this.verifier = _verifierService;
        }

        private string GenerateMessageToSignInternal()
        {
            string currentMessage = (string)TempData["_messageToSign"];
            if (currentMessage == null)
            {
                currentMessage = "Prove Your identity by signing this message " + Guid.NewGuid().ToString();
                TempData.Add("_messageToSign", currentMessage);
            }
            TempData.Keep();
            return currentMessage;
        }

        [HttpGet("getmessagetosign")]
        public async Task<JsonResult> GetMessageToSign()
        {
            var currentMessage = GenerateMessageToSignInternal();
            return JsonResultStatus.OK(currentMessage);
        }

        [HttpGet("validate/{address}/{signature}")]
        public async Task<JsonResult> ValidateUser(string address, string signature)
        {
            string message = GenerateMessageToSignInternal();
            bool isValidUser = await verifier.ValidateSignature(address, message, signature);
            if (TempData.ContainsKey("_isUserValid"))
            {
                TempData.Remove("_isUserValid");
            }
            TempData.Add("_isUserValid", isValidUser);
            if (TempData.ContainsKey("_validatedUserAddress"))
            {
                TempData.Remove("_validatedUserAddress");
            }
            TempData.Add("_validatedUserAddress", address);
            return JsonResultStatus.OK(isValidUser);

        }

        [HttpGet("isuserauthenticated/{address}")]
        public async Task<JsonResult> IsUserAuthenticated(string address)
        {
            bool status = isUserValid(address);
            return JsonResultStatus.OK(status);
        }


        private bool isUserValid(string address)
        {
            bool val = false;
            string validatedAddress = Convert.ToString(TempData["_validatedUserAddress"]);
            if (validatedAddress.Equals(address, StringComparison.InvariantCultureIgnoreCase) == false)
            {
                return false;
            }
            if (!bool.TryParse(Convert.ToString(TempData["_isUserValid"]), out val))
            {
                val = false;
            };
            TempData.Keep();
            return val;
        }


    }
}
