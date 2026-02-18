using Predict.Common.Configuration;
using Predict.Configuration.Context;
using Predict.Extensions;
using Predict.Middleware;
using Predict.Repository.ReceiptRepo;
using Predict.Repository.TransactionRepo;
using Predict.Repository.UserRepo;
using Predict.Service;
using Predict.Service.AccountService;
using Predict.Service.AuthorizationService;
using Predict.Service.CacheService;
using Predict.Service.CacheServicel;
using Predict.Service.TokenService;

namespace Predict;

public class Startup(IConfiguration config)
{

    public IConfiguration Configuration { get; }

    public void ConfigureServices(IServiceCollection services)
    {
        services.AddSingleton<IDapperContext, DapperContext>();

        services.AddControllers();
        services.AddCors();

        services.AddMemoryCache();
        services.AddSingleton<ICacheService, MemoryCacheService>();

        services.AddSingleton<IUserRepository, UserRepository>();
        services.AddSingleton<ITransactionRepo, TransactionRepo>();
        services.AddSingleton<IReceiptRepo, ReceiptRepo>();

        services.AddSingleton<ITokenService, TokenService>();
        services.AddSingleton<IAccountService, AccountService>();
        services.AddSingleton<IAuthService, AuthService>();
        services.AddSingleton<IReceiptsService, ReceiptsService>();
        services.AddSingleton<IMortgageLoanService, MortgageLoanService>();
        services.AddSingleton<IInvoiceService, InvoiceService>();

        services.AddSingleton<IEnvironmentConfiguration, EnvironmentConfiguration>();

        services.AddIdentityServices(config, new EnvironmentConfiguration());
    }

    public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
    {
        if (env.IsDevelopment())
        {
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

        app.UseEndpoints(endpoints =>
        {
            endpoints.MapControllers();
        });
    }
}
