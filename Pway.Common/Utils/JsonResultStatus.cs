using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;

namespace Pway.Web.Utils
{

    public enum ErrorCodes
    {
        InternalError = 1,
        InvalidModel = 2,
        PageSizeInvalid = 3,
        ConversationNotVerified = 4,
        UserIsMessageCreator = 5,
        UserAccountIsNotVerified = 6,
        SameAddresses = 7
    }

    public class JsonResultStatus
    {
        public const int OKStatus = 0;
        public const int ErrorStatus = 1;

        public static JsonResult Error(ErrorCodes errorCode)
        {
            return new JsonResult(new { status = JsonResultStatus.ErrorStatus, code = errorCode, messages = "" });
        }

        public static JsonResult Error(ErrorCodes errorCode, object data)
        {
            return new JsonResult(new { status = JsonResultStatus.ErrorStatus, code = errorCode, messages = JsonConvert.SerializeObject(data) });
        }

        public static JsonResult OK()
        {
            return new JsonResult(new { status = JsonResultStatus.OKStatus, code = 0 });
        }

        public static JsonResult OK(object data)
        {
            return new JsonResult(new { status = JsonResultStatus.OKStatus, code = 0, data = JsonConvert.SerializeObject(data) });
        }

    }
}
