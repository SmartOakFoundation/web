using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using NLog;
using Pway.Web.Utils;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;

namespace Pway.Web.Services
{
    public class ErrorWrappingMiddleware
    {
        private readonly RequestDelegate next;
        private readonly ILogger<ErrorWrappingMiddleware> logger;

        public ErrorWrappingMiddleware(RequestDelegate next,
            ILogger<ErrorWrappingMiddleware> logger)
        {
            this.next = next;
            this.logger = logger;
        }

        public async Task Invoke(HttpContext context /* other dependencies */)
        {
            try
            {
                await next(context);
            }
            catch (Exception ex)
            {
                await HandleExceptionAsync(context, ex);
            }
        }

        private  Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            logger.LogError(exception, "Uncatch exception");
            var result = JsonConvert.SerializeObject(new { status =1, code = ErrorCodes.InternalError});
            context.Response.ContentType = "application/json";
            context.Response.StatusCode = 200;
            return context.Response.WriteAsync(result);
        }
    }
}
