using Microsoft.AspNetCore.Mvc;
using Predict.Repository.TransactionRepo;
using System.IdentityModel.Tokens.Jwt;
using Predict.Service.AuthorizationService;
using Microsoft.AspNetCore.Authorization;
using System.ComponentModel.DataAnnotations;

namespace Predict.Controllers {
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

            return Ok(await _transactionRepo.GetTransactionByUserIdAndOwnerId(user.Id.Value, dataOwnerId, DateTime.UtcNow, DateTime.UtcNow));
        }

        [HttpGet("free-transactions/{dataOwnerId}")]
        public async Task<ActionResult> GetFreeTransactions(
            [FromHeader] string Authorization,
            [FromRoute] int dataOwnerId,
            [FromQuery, Required] string startDate,
            [FromQuery, Required] string endDate
        ) {

            return Ok(await _transactionRepo.GetTransactionByUserIdAndOwnerId(2, dataOwnerId, DateTime.Parse(startDate), DateTime.Parse(endDate)));
        }
    }
}
