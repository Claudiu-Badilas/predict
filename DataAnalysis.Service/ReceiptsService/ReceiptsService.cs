using DataAnalysis.Repository.ReceiptRepo;
using DataAnalysis.Repository.ReceiptRepo.Models.Response;

namespace DataAnalysis.Service.AuthorizationService;

public class ReceiptsService : IReceiptsService {

    private readonly IReceiptRepo _receiptRepo;

    public ReceiptsService(IReceiptRepo receiptRepo) {
        _receiptRepo = receiptRepo;
    }

    public async Task<List<ReceiptResponse>> GetReceips(DateTime startDate, DateTime endDate) {
        var receipts = await _receiptRepo.GetReceipts(startDate, endDate);
        var products = await _receiptRepo.GetPurchedProductsByReceiptsIds(receipts.Select(r => r.Id).ToList());

        foreach (var receipt in receipts) {
            receipt.Products = products.Where(p => p.ReceiptId == receipt.Id).ToList();
        }

        return receipts;
    }
}
