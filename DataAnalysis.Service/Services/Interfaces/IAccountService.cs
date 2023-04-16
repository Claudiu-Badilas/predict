using DataAnalysis.Repository.UserRepo.Models;

namespace DataAnalysis.Services.Interfaces {
    public interface IAccountService {
        public Task RegisterUser(UserRequest userRequest);
        public Task<UserResponse> LoginUser(UserRequest userRequest);
    }
}
