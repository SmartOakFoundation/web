using Newtonsoft.Json.Linq;
using System.IO;

namespace SmartOak.Common.Helpers
{
    public class AbiReader
    {
        public static string Read(string fileName)
        {
            using (StreamReader reader = new StreamReader(@".\abi\" + fileName))
            {
                var json = reader.ReadToEnd();

              
                return json;
            }

        }
    }
}
