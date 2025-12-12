using DataAnalysis.Service.AuthorizationService;
using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;

namespace DataAnalysis.Controllers;

[Route("api/v1/receipts")]
public class ReceiptsController : BaseController {

    private readonly IReceiptsService _receiptService;
    private readonly IAuthService _authService;

    public ReceiptsController(IReceiptsService receiptService, IAuthService authService) {
        _receiptService = receiptService;
        _authService = authService;
    }

    [HttpGet("")]
    public async Task<ActionResult> GetReceipts(
        [FromHeader] string Authorization,
        [FromQuery, Required] string startDate,
        [FromQuery, Required] string endDate
    ) {
        return Ok(await _receiptService.GetReceips(DateTime.Parse(startDate), DateTime.Parse(endDate)));
    }

}
