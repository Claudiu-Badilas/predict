using DataAnalysis.Controllers.Models;
using DataAnalysis.Models;

namespace DataAnalysis.Services.Interfaces {
    public interface ITokenService {
        string CreateToken(UserResponse user);
    }
}
