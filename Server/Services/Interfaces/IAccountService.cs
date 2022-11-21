using Server.Controllers.Models;
using Server.Models;

namespace Server.Services.Interfaces {
    public interface IAccountService {
        public Task RegisterUser(UserRequest userRequest);
        public Task<UserResponse> LoginUser(UserRequest userRequest);
    }
}
