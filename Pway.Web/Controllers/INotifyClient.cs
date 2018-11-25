using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Pway.Web.Controllers
{
    public interface INotifyClient
    {
        Task BroadcastNewGameBought(string buyer);
    }
}
