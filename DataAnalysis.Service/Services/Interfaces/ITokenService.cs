using DataAnalysis.Repository.UserRepo.Models;

namespace DataAnalysis.Services.Interfaces {
    public interface ITokenService {
        string CreateToken(UserResponse user);
    }
}
