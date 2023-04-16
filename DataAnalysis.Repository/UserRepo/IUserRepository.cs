using DataAnalysis.Repository.UserRepo.Models;

namespace DataAnalysis.Repository.UserRepo {
    public interface IUserRepository {
        Task<bool> IsExistingUser(string email);
        Task<AppUser> GetUserByEmail(string email);
        Task AddUser(AppUser user);
    }
}
