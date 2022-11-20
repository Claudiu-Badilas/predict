using Server.Controllers.Models;
using Server.Models;

namespace Server.Services.Interfaces {
    public interface ITokenService {
        string CreateToken(UserResponse user);
    }
}
