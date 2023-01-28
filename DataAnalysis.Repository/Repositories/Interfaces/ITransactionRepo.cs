using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DataAnalysis.Repository.Models;

namespace DataAnalysis.Repository.Repositories.Interfaces {
    public interface ITransactionRepo {
        Task<IEnumerable<Transaction>> GetTransactionByUserId(int userId);
        public Task<IEnumerable<string>> GetTransactionIds(int userId);
        public Task<int> StoreTransactions(IEnumerable<Transaction> transactions);
    }
}
