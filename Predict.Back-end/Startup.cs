using FluentMigrator.Runner;
using Predict.Common.Configuration;
using Predict.Configuration.Context;
using Predict.Configuration.Migrations;
using Predict.Extensions;
using Predict.Middleware;
using Predict.Repository.HealthRepo;
using Predict.Repository.ReceiptRepo;
using Predict.Repository.TransactionRepo;
using Predict.Repository.UserRepo;
using Predict.Service.AccountService;
using Predict.Service.AuthorizationService;
using Predict.Service.TokenService;
using System.Reflection;

namespace Predict {
    public class Startup {
        private readonly IConfiguration _config;

        public Startup(IConfiguration config) {
            _config = config;
        }

        public IConfiguration Configuration { get; }

        public void ConfigureServices(IServiceCollection services) {
            services.AddSingleton<IDapperContext, DapperContext>();
            services.AddSingleton<Database>();

            services.AddLogging(c => c.AddFluentMigratorConsole())
                .AddFluentMigratorCore()
                .ConfigureRunner(c => c.AddPostgres()
                    .WithGlobalConnectionString(new EnvironmentConfiguration().GetNpsqlConnectionString())
                    .ScanIn(Assembly.GetExecutingAssembly()).For.Migrations());

            services.AddControllers();
            services.AddCors();

            services.AddSingleton<IUserRepository, UserRepository>();
            services.AddSingleton<ITransactionRepo, TransactionRepo>();
            services.AddSingleton<IReceiptRepo, ReceiptRepo>();
            services.AddSingleton<IHealthRepo, HealthRepo>();

            services.AddSingleton<ITokenService, TokenService>();
            services.AddSingleton<IAccountService, AccountService>();
            services.AddSingleton<IAuthService, AuthService>();
            services.AddSingleton<IReceiptsService, ReceiptsService>();

            services.AddSingleton<IEnvironmentConfiguration, EnvironmentConfiguration>();

            services.AddIdentityServices(_config, new EnvironmentConfiguration());
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
