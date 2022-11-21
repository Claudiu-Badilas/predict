namespace Server.Controllers.Models {
    public class UserResponse {
        public int? Id { get; set; }
        public string Email { get; set; }
        public DateTime? JoinDate { get; set; }
        public DateTime? LastLogin { get; set; }
        public bool? IsActive { get; set; }
        public int? RoleId { get; set; }
        public string RoleName { get; set; }
    }
}
