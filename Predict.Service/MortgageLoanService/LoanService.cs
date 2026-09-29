using Predict.Reader.MortgageLoan.BCR;
using Predict.Repository.LoanRepo;
using static Predict.Reader.MortgageLoan.BCR.Types.BCRLoanTypes;

namespace Predict.Service;

public class LoanService(IBcrLoanRepository repository) : ILoanService
{
    public async Task<List<GraficRambursare>> GetBcrMortgageLoansAsync()
    {
        var existingFileNames = await repository.GetFileNamesAsync();
        var newLoans = BCRLoanReader.getBcrLoanDetailsForFiles(existingFileNames.ToArray());
        await repository.StoreAsync(newLoans);
        return await repository.GetAllAsync();
    }
}
