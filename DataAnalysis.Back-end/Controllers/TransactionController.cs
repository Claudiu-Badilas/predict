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
        [Authorize]
        public async Task<ActionResult> GetTransactions(
            [FromHeader] string Authorization,
            [FromRoute] int dataOwnerId
            ) {

            var user = await _authService.GetUser(Authorization);
            if (!user.HasAccessToDataOwner(dataOwnerId)) {
                return BadRequest("You do not have access to the current Data Owner!");
            }

            return Ok(await _transactionRepo.GetTransactionByUserIdAndOwnerId(user.Id.Value, dataOwnerId));
        }
    }
}
