using Nethereum.ABI.FunctionEncoding.Attributes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Numerics;
using System.Threading.Tasks;

namespace SmartOak.Web.Models
{
    //  event TokenPurchase(address indexed beneficiary, uint256 tokens, uint256 weiAmount);
    public class BuyTokensModel
    {
        public ulong blockNumber;

        [Parameter("address", "beneficiary", 1, true)]
        public string beneficiary { get; set; }

        [Parameter("uint256", "tokens", 2, false)]
        public BigInteger tokens { get; set; }
        
        [Parameter("uint256", "weiAmount", 3, false)]
        public BigInteger ethPaid { get; set; }
    }
    
}
