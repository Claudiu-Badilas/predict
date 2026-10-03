using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Predict.Reader.MortgageLoan.BCR;
using Predict.Readers.AccountStatement;
using Predict.Repository.TransactionRepo;
using Predict.Service.AuthorizationService;
using Predict.Service.CacheServicel;
using System.ComponentModel.DataAnnotations;

namespace Predict.Controllers;

[Route("api/v1")]
public class TransactionController(ITransactionRepo transactionRepo, IAuthService authService, ICacheService cache) : BaseController
{    

    [HttpGet("transactions")]
    public async Task<ActionResult> GetTransactions([FromHeader] string Authorization)
    {
        var transactions = cache.GetOrSet(
            "GetTransactions",
            () => RaiffeisenExcelAccountStatement.transactions(),
            TimeSpan.FromDays(1)
        );

        var economii = cache.GetOrSet(
           "GetEconomii",
           () => RaiffeisenExcelAccountStatement.economii(),
           TimeSpan.FromDays(1)
       );

        return Ok(new { Transactions = transactions, Economii = economii });
    }    
}
