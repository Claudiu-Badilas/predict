using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Predict.Common.Configuration;
using System.Text;

namespace Predict.Extensions {
    public static class IdentityServiceExtensions {
        public static IServiceCollection AddIdentityServices(
            this IServiceCollection services,
            IConfiguration config,
            EnvironmentConfiguration envConfig
            ) {
            services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddJwtBearer(options => {
                    options.TokenValidationParameters = new TokenValidationParameters {
                        ValidateIssuerSigningKey = true,
                        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(envConfig.GetJWTKey())),
                        ValidateIssuer = false,
                        ValidateAudience = false,
                    };
                });

            return services;
        }
    }
}