using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using DataAnalysis.Services.Interfaces;
using DataAnalysis.Controllers.Models;
using DataAnalysis.Common.Configuration;

namespace DataAnalysis.Services {
    public class TokenService : ITokenService {
        private readonly SymmetricSecurityKey _key;

        public TokenService(IEnvironmentConfiguration envConfig) {
            _key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(envConfig.GetJWTKey()));
        }

        public string CreateToken(UserResponse user) {
            var claims = new List<Claim> {
                new Claim(JwtRegisteredClaimNames.NameId, user.Email)
            };
            var creds = new SigningCredentials(_key, SecurityAlgorithms.HmacSha512Signature);
            var tokenDescriptor = new SecurityTokenDescriptor {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.Now.AddDays(7),
                SigningCredentials = creds
            };
            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }
    }
}