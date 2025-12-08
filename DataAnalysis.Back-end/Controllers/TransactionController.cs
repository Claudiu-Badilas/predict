using Microsoft.AspNetCore.Mvc;
using DataAnalysis.Repository.TransactionRepo;
using System.IdentityModel.Tokens.Jwt;
using DataAnalysis.Service.AuthorizationService;
using Microsoft.AspNetCore.Authorization;

namespace DataAnalysis.Controllers {
    [Route("api/v1")]
    public class TransactionController : BaseController {

        private readonly ITransactionRepo _transactionRepo;
        private readonly IAuthService _authService;

        public TransactionController(ITransactionRepo transactionRepo, IAuthService authService) {
            _transactionRepo = transactionRepo;
            _authService = authService;
        }

        [HttpGet("transactions/{dataOwnerId}")]
        public async Task<ActionResult> GetTransactions(
            [FromHeader] string Authorization,
            [FromRoute] int dataOwnerId
            ) {



            return Ok(await _transactionRepo.GetTransactionByUserIdAndOwnerId(2, dataOwnerId));
        }
    }
}
