namespace SmartOak.Data.Models
{
    public class Game
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Price { get; set; }
        public decimal PriceUSD { get; set;}
        public string ImagePath { get; set; }
        public string ShortDescription { get; set; }
        public int? EthereumId { get; set; }
        public string SteamLink { get; set; }
    }
}
