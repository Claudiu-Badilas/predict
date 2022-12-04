using DataAnalysis.Models;

namespace DataAnalysis.Repositories.Interfaces {
    public interface IUserRepository {
        Task<bool> IsExistingUser(string email);
        Task<AppUser> GetUserByEmail(string email);
        Task AddUser(AppUser user);
    }
}
