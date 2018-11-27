using Microsoft.AspNetCore.Mvc.ModelBinding;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace SmartOak.Common.Helpers
{
    public class ModelErrorHelper
    {
        public static string GetErrors(ModelStateDictionary modelState)
        {
            return  modelState.Values
                .Select(v => v.Errors
                    .Select(b => b.ErrorMessage)
                    .Aggregate((current, next) => current + ", " + next))
                .Aggregate((current, next) => current + ", " + next); ;
        }
    }
}
