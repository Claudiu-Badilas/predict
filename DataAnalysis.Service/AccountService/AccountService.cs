using DataAnalysis.Repository.UserRepo;
using DataAnalysis.Repository.UserRepo.Models;
using System.Security.Cryptography;
using System.Text;

namespace DataAnalysis.Service.AccountService {
    public class AccountService : IAccountService {
        private readonly IUserRepository _userRepo;

        public AccountService(IUserRepository userRepo) {
            _userRepo = userRepo;
        }

        public async Task RegisterUser(UserRequest userRequest) {
            using var hmac = new HMACSHA512();

            var id = await _userRepo.StoreUser(new AppUser {
                PasswordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(userRequest.Password)),
                PasswordSalt = hmac.Key,
                Email = userRequest.Email,
                JoinDate = DateTime.UtcNow,
                LastLogin = DateTime.UtcNow,
                IsActive = true,
                IsAdmin = false
            });

            await _userRepo.StoreDataOwner(new DataOwner {
                Name = userRequest.Email,
                CreationDate = DateTime.UtcNow,
                UserId = id,
            });
        }

        public async Task<string> LoginUser(UserRequest userRequest) {
            var isExistingUser = await _userRepo.IsExistingUser(userRequest.Email);
            if (!isExistingUser) return null;

            var appUser = await _userRepo.GetAppUserByEmail(userRequest.Email);
            if (!IsPasswordValid(userRequest, appUser)) return null;

            return appUser.Email;
        }

        private bool IsPasswordValid(UserRequest userRequest, AppUser appUser) {
            using var hmac = new HMACSHA512(appUser.PasswordSalt);
            var computedHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(userRequest.Password));

            for (int i = 0; i < computedHash.Length; i++) {
                if (computedHash[i] != appUser.PasswordHash[i]) {
                    return false;
                }
            }
            return true;
        }
    }
}
