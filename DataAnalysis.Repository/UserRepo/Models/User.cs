namespace DataAnalysis.Repository.UserRepo.Models {
    public class User {
        public int? Id { get; set; }
        public string Email { get; set; }
        public DateTime? JoinDate { get; set; }
        public DateTime? LastLogin { get; set; }
        public bool? IsActive { get; set; }
        public bool IsAdmin { get; set; }
        public IEnumerable<DataOwner> DataOwners { get; set; }

        public bool HasAccessToDataOwner(int dataOwnerId) {
            return DataOwners.ToList().Exists(owner => owner.Id == dataOwnerId);
        }
    }

    public class DataOwner {
        public int? Id { get; set; }
        public string Name { get; set; }
        public DateTime? CreationDate { get; set; }
        public int? UserId { get; set; }
    }
}
