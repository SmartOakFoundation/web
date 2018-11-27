using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SmartOak.Web.Controllers
{
    public class NotifyHub : Hub<INotifyClient>
    {
    }
}
