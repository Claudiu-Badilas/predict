using DataAnalysis.Repository.UserRepo.Models;

namespace DataAnalysis.Repository.UserRepo {
    public interface IUserRepository {
        Task<bool> IsExistingUser(string email);
        Task<AppUser> GetAppUserByEmail(string email);
        Task<int> StoreUser(AppUser user);
        Task<User> GetUserByEmail(string email);
        Task<IEnumerable<DataOwner>> GetDataOwnersByUserId(int userId);
        Task<int> StoreDataOwner(DataOwner owner);
    }
}
