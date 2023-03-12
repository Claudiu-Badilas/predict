using DataAnalysis.Repository.Models;
using DataAnalysis.Repository.Repositories.Interfaces;
using Npgsql;
using static DataAnalysis.Common.Configuration.ConfigurationUtils;
using Dapper;

namespace DataAnalysis.Repository.Repositories {
    public class ReceiptRepo : IReceiptRepo {
        public async Task<IEnumerable<Receipt>> GetReceiptByUserId(int dataOwnerId) {
            using (var connection = new NpgsqlConnection(NpsqlConnectionString)) {
                connection.Open();
                var sql = @"
                    SELECT 
                        id as Id,
                        identifier as Identifier
                    FROM public.receipt
                    WHERE data_owner_id = @dataOwnerId;";

                return await connection.QueryAsync<Receipt>(sql, new { dataOwnerId });
            };
        }

        public async Task<int> StoreReceipts(IEnumerable<Receipt> receipts) {
            await using (var connection = new NpgsqlConnection(NpsqlConnectionString)) {
                var sql = @"
                INSERT INTO public.receipt
                    (identifier, ""date"", total_price, total_discount, provider_id, currency_id, data_owner_id)
                VALUES (
                    unnest(@identifiers),
                    unnest(@dates),
                    unnest(@total_prices),
                    unnest(@total_discounts),
                    unnest(@provider_ids),
                    unnest(@currency_ids),
                    unnest(@data_owner_ids)
                )";

                return await connection.ExecuteScalarAsync<int>(sql, new {
                    identifiers = receipts.Select(x => x.Identifier).ToList(),
                    dates = receipts.Select(x => x.Date).ToList(),
                    total_prices = receipts.Select(x => x.TotalPrice).ToList(),
                    total_discounts = receipts.Select(x => x.TotalDiscount).ToList(),
                    provider_ids = receipts.Select(x => x.ProviderId).ToList(),
                    currency_ids = receipts.Select(x => x.CurrencyId).ToList(),
                    data_owner_ids = receipts.Select(x => x.DataOwnerId).ToList()
                });
            }
        }
        
        public async Task<int> StorePurchasedProducts(IEnumerable<PurchasedProduct> purchasedProducts) {
            await using (var connection = new NpgsqlConnection(NpsqlConnectionString)) {
                var sql = @"
                INSERT INTO public.purchased_product
                (""name"", price, quantity, vat, quantity_type_id, receipt_id)
                VALUES (
                    unnest(@names),
                    unnest(@prices),
                    unnest(@quantitys),
                    unnest(@vats),
                    unnest(@quantity_type_ids),
                    unnest(@receipt_ids)
                )";

                return await connection.ExecuteScalarAsync<int>(sql, new {
                    names = purchasedProducts.Select(x => x.Name).ToList(),
                    prices = purchasedProducts.Select(x => x.Price).ToList(),
                    quantitys = purchasedProducts.Select(x => x.Quantity).ToList(),
                    vats = purchasedProducts.Select(x => x.VAT).ToList(),
                    quantity_type_ids = purchasedProducts.Select(x => x.QuantityTypeId).ToList(),
                    receipt_ids = purchasedProducts.Select(x => x.ReceiptId).ToList()
                });
            }
        }
    }
}
