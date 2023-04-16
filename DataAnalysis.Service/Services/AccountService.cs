using DataAnalysis.Repository.UserRepo;
using DataAnalysis.Repository.UserRepo.Models;
using DataAnalysis.Services.Interfaces;
using System.Security.Cryptography;
using System.Text;

namespace DataAnalysis.Services
{
    public class AccountService : IAccountService {
        private readonly IUserRepository _userRepo;

        public AccountService(IUserRepository userRepo) {
            _userRepo = userRepo;
        }

        public async Task RegisterUser(UserRequest userRequest) {
            using var hmac = new HMACSHA512();

            await _userRepo.AddUser(new AppUser {
                PasswordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(userRequest.Password)),
                PasswordSalt = hmac.Key,
                Email = userRequest.Email,
                JoinDate = DateTime.UtcNow,
                LastLogin = DateTime.UtcNow,
                IsActive = true,
                IsAdmin = false
            });
        }

        public async Task<UserResponse> LoginUser(UserRequest userRequest) {
            var isExistingUser = await _userRepo.IsExistingUser(userRequest.Email);
            if (!isExistingUser) return null;

            var user = await _userRepo.GetUserByEmail(userRequest.Email);
            if (!(IsPasswordValid(userRequest, user))) return null;

            return new UserResponse {
                Id = user.Id,
                Email = user.Email,
                JoinDate = user.JoinDate,
                LastLogin = user.LastLogin,
                IsActive = user.IsActive,
                IsAdmin = user.IsAdmin
            };
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
