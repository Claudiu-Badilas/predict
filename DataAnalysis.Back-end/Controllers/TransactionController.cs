using Microsoft.AspNetCore.Mvc;
using DataAnalysis.Repository.TransactionRepo;

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
