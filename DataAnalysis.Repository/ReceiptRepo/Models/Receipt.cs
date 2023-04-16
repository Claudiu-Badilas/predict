using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAnalysis.Repository.ReceiptRepo.Models {
    public class Receipt {
        public int? Id { get; set; }
        public string Identifier { get; set; }
        public DateTime? Date { get; set; }
        public double? TotalPrice { get; set; }
        public double? TotalDiscount { get; set; }
        public IEnumerable<PurchasedProduct> Products { get; set; }
        public int? CurrencyId { get; set; }
        public int? ProviderId { get; set; }
        public int DataOwnerId { get; set; }
    }

    public class PurchasedProduct {
        public string Name { get; set; }
        public double? Price { get; set; }
        public double? Quantity { get; set; }
        public double? VAT { get; set; }
        public int? QuantityTypeId { get; set; }
        public int? ReceiptId { get; set; }
    }
}
