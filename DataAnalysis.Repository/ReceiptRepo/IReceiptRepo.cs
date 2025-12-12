using DataAnalysis.Repository.ReceiptRepo.Models;
using DataAnalysis.Repository.ReceiptRepo.Models.Response;

namespace DataAnalysis.Repository.ReceiptRepo;
public interface IReceiptRepo {
    // Controller
    Task<List<ReceiptResponse>> GetReceipts(DateTime startDate, DateTime endDate);
    Task<IEnumerable<PurchasedProductResponse>> GetPurchedProductsByReceiptsIds(List<int> receiptIds);

    //Storer
    Task<IEnumerable<Receipt>> GetReceiptByUserId(int userId);
    public Task<int> StoreReceipts(IEnumerable<Receipt> receipts);
    public Task<int> StorePurchasedProducts(IEnumerable<PurchasedProduct> purchasedProducts);
}