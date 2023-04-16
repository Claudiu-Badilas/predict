using DataAnalysis.Repositories.Interfaces;
using DataAnalysis.Repositories;
using DataAnalysis.Services.Interfaces;
using DataAnalysis.Services;
using DataAnalysis.Extensions;
using DataAnalysis.Middleware;
using DataAnalysis.Repository.Repositories;
using DataAnalysis.Repository.Repositories.Interfaces;
using DataAnalysis.Common.Configuration;
using DataAnalysis.Configuration.Context;
using DataAnalysis.Configuration.Migrations;
using FluentMigrator.Runner;
using System.Reflection;

namespace DataAnalysis {
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

            services.AddScoped<ITokenService, TokenService>();
            services.AddScoped<IAccountService, AccountService>();

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
