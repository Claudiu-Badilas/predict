using Microsoft.AspNetCore.Mvc;
using DataAnalysis.Controllers.Models;
using DataAnalysis.Repositories.Interfaces;
using DataAnalysis.Services.Interfaces;
using DataAnalysis.Repository.Repositories.Interfaces;

namespace DataAnalysis.Controllers {
    [Route("api/v1")]
    public class TransactionController : BaseController {

        private readonly ITransactionRepo _transactionRepo;

        public TransactionController(ITransactionRepo transactionRepo) {
            _transactionRepo = transactionRepo;
        }

        [HttpGet("transactions/{dataOwnerId}")]
        public async Task<ActionResult> Login([FromRoute] int dataOwnerId) {
            var transactions = await _transactionRepo.GetTransactionByUserId(dataOwnerId);

            return Ok(transactions);
        }
    }
}
