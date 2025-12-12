using DataAnalysis.Repository.ReceiptRepo.Models.Response;

namespace DataAnalysis.Service.AuthorizationService;

public interface IReceiptsService {
    Task<List<ReceiptResponse>> GetReceips(DateTime startDate, DateTime endDate);
}
