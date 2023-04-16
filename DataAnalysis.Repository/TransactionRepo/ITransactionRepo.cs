using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DataAnalysis.Repository.TransactionRepo.Models;

namespace DataAnalysis.Repository.TransactionRepo {
    public interface ITransactionRepo {
        Task<IEnumerable<TransactionResponse>> GetTransactionByUserId(int userId);
        public Task<IEnumerable<string>> GetTransactionIds(int ownderDataId, int providerId);
        public Task<int> StoreTransactions(IEnumerable<Transaction> transactions);
    }
}
