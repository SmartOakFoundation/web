using System;
using System.Collections.Generic;
using System.Text;

namespace SmartOak.Common.Options
{
    public class EthereumOptions
    {
        public string OperatorAddress { get; set; }
        public string OperatorPrivateKey { get; set; }
        public string GasPrice { get; set; }
        public string InfuraToken { get; set; }
        public string Wordlist { get; set; }
        public string NameRegistryAddress { get; set; }
        public string SignatureVerifier { get; set; }
        public string ContratNames { get; set; }
        public string EthereumNetwork { get; set; }
        public string RangeUpdateTimeMinutes { get; set; }
        public string GasLimit { get; set; }
        public string GasLimitBig { get; set; }
    }
}
