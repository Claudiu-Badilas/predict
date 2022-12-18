using Dapper;
using static DataAnalysis.Common.Configuration.ConfigurationUtils;
using DataAnalysis.Repository.Repositories.Interfaces;
using Npgsql;
using DataAnalysis.Repository.Models;

namespace DataAnalysis.Repository.Repositories {
    public class TransactionRepo : ITransactionRepo {
        public async Task<IEnumerable<string>> GetTransactionIds(int userId) {
            using (var connection = new NpgsqlConnection(NpsqlConnectionString)) {
                connection.Open();
                var sql = @"
                    SELECT Id 
                    FROM platform.transactions
                    WHERE user_id = @UserId;";

                return await connection.QueryAsync<string>(sql, new { UserId = userId });
            };
        }

        public async Task<int> StoreTransactions(IEnumerable<Transaction> transactions) {
            using (var connection = new NpgsqlConnection(NpsqlConnectionString)) {
                connection.Open();
                var sql = @"
                    INSERT INTO platform.transactions (
                        id, registration_date, completition_date, amount, fee, description, 
                        reference_id, provider_id, currency_id, status_id, transaction_type_id, 
                        user_id )
                    VALUES (
                        @Id, @RegistrationDate, @CompletionDate, @Amount, @Fee, @Description, 
                        @ReferenceId, @ProviderId, @CurrencyId, @StatusId, @TransactionTypeId,
                        @UserId );";

                return await connection.ExecuteAsync(sql, transactions.Select(t => new {
                    Id = t.Id,
                    RegistrationDate = t.RegistrationDate.ToString(),
                    CompletionDate = t.CompletionDate.ToString(),
                    Amount = t.Amount,
                    Fee = t.Fee,
                    Description = t.Description,
                    ReferenceId = t.ReferenceId,
                    ProviderId = t.ProviderId,
                    CurrencyId = t.CurrencyId,
                    StatusId = t.StatusId,
                    TransactionTypeId = t.TransactionTypeId,
                    UserId = t.UserId
                }));
            };
        }
    }
}
