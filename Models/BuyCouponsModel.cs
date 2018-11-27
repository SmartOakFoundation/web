using Nethereum.ABI.FunctionEncoding.Attributes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Numerics;
using System.Threading.Tasks;

namespace SmartOak.Web.Models
{
    //  event TokenPurchase(address indexed beneficiary, uint256 tokens, uint256 weiAmount);
    public class BuyCouponsModel
    {
        public ulong blockNumber;

        public string txHash;

        [Parameter("address", "buyer", 1, true)]
        public string buyer { get; set; }

        [Parameter("uint32", "gameId", 2, true)]
        public BigInteger gameId { get; set; }
        
        [Parameter("uint32", "gameLicenseId", 3, true)]
        public BigInteger gameLicenseId { get; set; }
    }
    
}
