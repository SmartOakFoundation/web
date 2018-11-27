using Nethereum.ABI.FunctionEncoding.Attributes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Numerics;
using System.Threading.Tasks;

namespace SmartOak.Web.Models
{
    public class TransferModel
    {
        public ulong blockNumber;

        [Parameter("address", "from", 1, true)]
        public string from { get; set; }
        [Parameter("address", "to", 2, true)]
        public string to { get; set; }
        [Parameter("uint256", "tokens", 3, false)]
        public BigInteger value { get; set; }
    }
    
}
