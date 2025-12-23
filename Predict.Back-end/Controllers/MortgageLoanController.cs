using Microsoft.AspNetCore.Mvc;
using Predict.Reader.Mortgage;

namespace Predict.Controllers;

[Route("api/v1")]
public class MorgageController : BaseController {

    [HttpGet("mortgage-loan/bcr")]
    public async Task<ActionResult> GetMortgageLoanDetails() => Ok(BCRMortgageMapper.getBcrMorgages());

}
