using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SmartOak.Data.Models
{
    public class GameKey
    {
        public int Id { get; set; }
        [Required]
        public Game Game { get; set; }
        [Required]
        public string Key { get; set; }
        public bool IsPurchased { get; set; }
        public int EthereumLicenceId { get; set; }
    }
}
