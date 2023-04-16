using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAnalysis.Repository.TransactionRepo.Models {
    public class Transaction {
        public int? Id { get; set; }
        public string Identifier { get; set; }
        public DateTime? RegistrationDate { get; set; }
        public DateTime? CompletionDate { get; set; }
        public double? Amount { get; set; }
        public double? Fee { get; set; }
        public int? CurrencyId { get; set; }
        public string Description { get; set; }
        public int? TransactionTypeId { get; set; }
        public int? ProviderId { get; set; }
        public int? ReferenceId { get; set; }
        public int DataOwnerId { get; set; }
    }

    public class TransactionResponse {
        public int? Id { get; set; }
        public DateTime? RegistrationDate { get; set; }
        public DateTime? CompletionDate { get; set; }
        public double? Amount { get; set; }
        public double? Fee { get; set; }
        public string Currency { get; set; }
        public string Description { get; set; }
        public string TransactionType { get; set; }
        public string Provider { get; set; }
        public int? ReferenceId { get; set; }
        public int DataOwnerId { get; set; }
    }
}
