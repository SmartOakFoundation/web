using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Pway.Web.Controllers
{
    public class NotifyHub : Hub<INotifyClient>
    {
    }
}
