using DataAnalysis.Repositories.Interfaces;
using DataAnalysis.Repositories;
using DataAnalysis.Services.Interfaces;
using DataAnalysis.Services;
using DataAnalysis.Extensions;
using DataAnalysis.Middleware;
using DataAnalysis.Repository.Repositories;
using DataAnalysis.Repository.Repositories.Interfaces;

namespace DataAnalysis {
    public class Startup {
        private readonly IConfiguration _config;

        public Startup(IConfiguration config) {
            _config = config;
        }

        public IConfiguration Configuration { get; }

        public void ConfigureServices(IServiceCollection services) {
            services.AddControllers();
            services.AddCors();

            services.AddSingleton<IUserRepository, UserRepository>();
            services.AddSingleton<ITransactionRepo, TransactionRepo>();
            services.AddSingleton<IReceiptRepo, ReceiptRepo>();

            services.AddScoped<ITokenService, TokenService>();
            services.AddScoped<IAccountService, AccountService>();

            services.AddIdentityServices(_config);
        }

        public void Configure(IApplicationBuilder app, IWebHostEnvironment env) {
            if (env.IsDevelopment()) {
                app.UseDeveloperExceptionPage();
            }
            app.UseMiddleware<ExceptionMiddleware>();

            app.UseRouting();

            app.UseCors(builder =>
               builder.AllowAnyOrigin()
                   .AllowAnyHeader()
                   .AllowAnyMethod()
                   .WithOrigins("http://localhost:4200/")
                   );

            app.UseAuthentication();

            app.UseAuthorization();

            app.UseEndpoints(endpoints => {
                endpoints.MapControllers();
            });
        }
    }
}
