using Microsoft.AspNetCore.Mvc;
using Predict.Service;
using System.ComponentModel.DataAnnotations;

namespace Predict.Controllers;

[Route("api/v1/invoices")]
public class InvoicesController(IInvoiceService _invoiceService) : BaseController
{
    [HttpGet("")]
    public async Task<ActionResult> GetReceipts(
        [FromHeader] string Authorization,
        [FromQuery, Required] string startDate,
        [FromQuery, Required] string endDate
    ) => Ok(_invoiceService.GetInvoices(DateTime.Parse(startDate), DateTime.Parse(endDate)));
}
