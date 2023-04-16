using System.ComponentModel.DataAnnotations;

namespace DataAnalysis.Repository.UserRepo.Models
{
    public class UserRequest
    {
        [Required]
        public string Email { get; set; }
        [Required]
        public string Password { get; set; }
    }
}

