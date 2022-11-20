using Server.Controllers.Models;
using Server.Models;
using Server.Repositories.Interfaces;
using Server.Services.Interfaces;
using System.Data;
using System.Security.Cryptography;
using System.Text;

namespace Server.Services {
    public class AccountService : IAccountService {
        private readonly IUserRepository _userRepo;

        public AccountService(IUserRepository userRepo) {
            _userRepo = userRepo;
        }

        public async Task RegisterUser(UserRequest registerDto) {
            using var hmac = new HMACSHA512();

            await _userRepo.AddUser(new AppUser {
                PasswordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(registerDto.Password)),
                PasswordSalt = hmac.Key,
                Email = registerDto.Email,
                JoinDate = DateTime.UtcNow,
                LastLogin = DateTime.UtcNow,
                IsActive = true,
                RoleId = (int)Role.USER
            });
        }

        public async Task<UserResponse> LoginUser(UserRequest loginDto) {
            var isExistingUser = await _userRepo.IsExistingUser(loginDto.Email);
            if (!isExistingUser) return null;

            var user = await _userRepo.GetUserByEmail(loginDto.Email);
            var isPasswordValid = IsPasswordValid(loginDto, user);
            if (!isPasswordValid) return null;

            return new UserResponse {
                Id = user.Id,
                Email = user.Email,
                JoinDate = user.JoinDate,
                LastLogin = user.LastLogin,
                IsActive = user.IsActive,
                RoleId = user.RoleId,
                RoleName = user.RoleName,
            };
        }

        private bool IsPasswordValid(UserRequest loginDto, AppUser appUser) {
            using var hmac = new HMACSHA512(appUser.PasswordSalt);
            var computedHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(loginDto.Password));

            for (int i = 0; i < computedHash.Length; i++) {
                if (computedHash[i] != appUser.PasswordHash[i]) {
                    return false;
                }
            }
            return true;
        }
    }
}
