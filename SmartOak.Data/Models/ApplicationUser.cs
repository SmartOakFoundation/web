using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;

namespace SmartOak.Data.Models
{
    public class ApplicationUser : IdentityUser
    {
        // Extended Properties
        [Required]
        public string EthereumAccount { get; set; }
    }
}