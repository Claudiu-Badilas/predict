using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Server.Configuration;
using Server.Repositories.Interfaces;
using Server.Repositories;
using Server.Services.Interfaces;
using Server.Services;
using System.Text;
using Server.Extensions;
using Server.Middleware;

namespace Server {
    public class Startup {
        private readonly IConfiguration _config;

        public Startup(IConfiguration config) {
            _config = config;
        }

        public IConfiguration Configuration { get; }

        public void ConfigureServices(IServiceCollection services) {
            services.AddControllers();
            services.AddCors();

            services.AddSingleton(new NpgsqlDbConnection(_config.GetConnectionString("PostgreSQLConnection")));

            services.AddSingleton<IUserRepository, UserRepository>();

            services.AddScoped<ITokenService, TokenService>();
            services.AddScoped<IAccountService, AccountService>();

            services.AddIdentityServices(_config);

        }

        public void Configure(IApplicationBuilder app, IWebHostEnvironment env) {
            if (env.IsDevelopment()) {
                app.UseDeveloperExceptionPage();
            }
            app.UseMiddleware<ExceptionMiddleware>();

            app.UseHttpsRedirection();

            app.UseRouting();

            app.UseCors(builder =>
               builder.AllowAnyOrigin()
                   .AllowAnyHeader()
                   .AllowAnyMethod()
                   //.WithOrigins("http://localhost:4200/")
                   );

            app.UseAuthentication();

            app.UseAuthorization();

            app.UseEndpoints(endpoints => {
                endpoints.MapControllers();
            });
        }
    }
}
