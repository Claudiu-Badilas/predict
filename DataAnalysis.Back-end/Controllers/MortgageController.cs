using Microsoft.AspNetCore.Mvc;

namespace DataAnalysis.Controllers;

[Route("api/v1")]
public class MorgageController : BaseController {



    [HttpGet("mortgage/bcr")]
    public async Task<ActionResult> GetMortgageDetails() {



        return Ok(new { Id = 1 });
    }

}
