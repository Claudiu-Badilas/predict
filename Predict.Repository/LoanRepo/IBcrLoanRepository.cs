using static Predict.Reader.MortgageLoan.BCR.Types.BCRLoanTypes;

namespace Predict.Repository.LoanRepo;

public interface IBcrLoanRepository
{
    Task<IReadOnlyList<string>> GetFileNamesAsync();
    Task StoreAsync(IEnumerable<GraficRambursare> loans);
    Task<List<GraficRambursare>> GetAllAsync();
}
