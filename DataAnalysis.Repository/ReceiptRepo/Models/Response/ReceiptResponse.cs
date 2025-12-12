using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAnalysis.Repository.ReceiptRepo.Models.Response;

public class ReceiptResponse {
    public int Id { get; set; }
    public DateTime? Date { get; set; }
    public double? TotalPrice { get; set; }
    public double? TotalDiscount { get; set; }
    public List<PurchasedProductResponse> Products { get; set; }
    public string Currency { get; set; }
    public string Provider { get; set; }
}

public class PurchasedProductResponse {
    public int Id { get; set; }
    public string Name { get; set; }
    public double? Price { get; set; }
    public double? VAT { get; set; }
    public double? Quantity { get; set; }
    public string QuantityType { get; set; }
    public int ReceiptId { get; set; }
}
