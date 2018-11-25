using System;
using System.Collections.Generic;
using System.Text;

namespace Pway.Data.Models
{
    public class Auditable
    {
        public DateTime CratedDate { get; set; }
        public DateTime ModifiedDate { get; set; }
    }
}
