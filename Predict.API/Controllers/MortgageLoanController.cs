using Microsoft.AspNetCore.Mvc;
using Predict.Service;

namespace Predict.Controllers;

[Route("api/v1")]
public class MortgageLoanController(IMortgageLoanService mortgageLoanService) : BaseController
{

    [HttpGet("mortgage-loan/bcr")]
    public async Task<ActionResult> GetMortgageLoanDetails() 
        => Ok(mortgageLoanService.GetBcrMortgageLoans());
}