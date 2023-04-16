namespace DataAnalysis.Repository.UserRepo.Models
{
    public class UserResponse
    {
        public int? Id { get; set; }
        public string Email { get; set; }
        public DateTime? JoinDate { get; set; }
        public DateTime? LastLogin { get; set; }
        public bool? IsActive { get; set; }
        public bool IsAdmin { get; set; }
    }
}
