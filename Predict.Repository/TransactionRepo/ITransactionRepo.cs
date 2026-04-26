using Predict.Repository.TransactionRepo.Models;

namespace Predict.Repository.TransactionRepo;

public interface ITransactionRepo {
    Task<IEnumerable<TransactionResponse>> GetTransactionByUserIdAndOwnerId(int userId, int dataOwnerId, DateTime startDate, DateTime endDate);
    Task<IEnumerable<TransactionResponse>> GetAllTransactions();
    public Task<IEnumerable<string>> GetTransactionIds(int ownderDataId, int providerId);
    public Task<int> StoreTransactions(IEnumerable<Transaction> transactions);
}