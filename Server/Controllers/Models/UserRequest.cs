using System.ComponentModel.DataAnnotations;

namespace Server.Controllers.Models {
    public class UserRequest {
        [Required]
        public string Email { get; set; }
        [Required]
        public string Password { get; set; }
    }
}

