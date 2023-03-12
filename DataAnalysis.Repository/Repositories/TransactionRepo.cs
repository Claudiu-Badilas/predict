using Dapper;
using static DataAnalysis.Common.Configuration.ConfigurationUtils;
using DataAnalysis.Repository.Repositories.Interfaces;
using Npgsql;
using DataAnalysis.Repository.Models;

namespace DataAnalysis.Repository.Repositories {
    public class TransactionRepo : ITransactionRepo {
        public async Task<IEnumerable<Transaction>> GetTransactionByUserId(int dataOwnerId) {
            using (var connection = new NpgsqlConnection(NpsqlConnectionString)) {
                connection.Open();
                var sql = @"
                    SELECT 
                        id as Identifier, 
                        registration_date::timestamp as RegistrationDate, 
                        completition_date::timestamp as CompletitionDate, 
                        amount as Amount, 
                        fee as Fee, 
                        description as Description, 
                        reference_id as ReferenceId, 
                        provider_id as ProviderId, 
                        currency_id as CurrencyId, 
                        transaction_type_id as TransactionTypeId, 
                        data_owner_id as DataOwnerId
                    FROM public.""transaction""
                    WHERE data_owner_id = @dataOwnerId;";

                return await connection.QueryAsync<Transaction>(sql, new { dataOwnerId });
            };
        }

        public async Task<IEnumerable<string>> GetTransactionIds(int dataOwnerId) {
            using (var connection = new NpgsqlConnection(NpsqlConnectionString)) {
                connection.Open();
                var sql = @"
                    SELECT identifier 
                    FROM public.""transaction""
                    WHERE data_owner_id = @dataOwnerId;";

                return await connection.QueryAsync<string>(sql, new { dataOwnerId });
            };
        }

        public async Task<int> StoreTransactions(IEnumerable<Transaction> transactions) {
            using (var connection = new NpgsqlConnection(NpsqlConnectionString)) {
                connection.Open();
                var sql = @"
                    INSERT INTO public.""transaction"" (
                        identifier, registration_date, completition_date, amount, fee, description, 
                        reference_id, provider_id, currency_id, transaction_type_id, data_owner_id )
                    VALUES (
                        @Identifier, @RegistrationDate, @CompletionDate, @Amount, @Fee, @Description, 
                        @ReferenceId, @ProviderId, @CurrencyId, @TransactionTypeId, @DataOwnerId );";

                return await connection.ExecuteAsync(sql, transactions.Select(t => new {
                    t.Identifier,
                    RegistrationDate = t.RegistrationDate.ToString(),
                    CompletionDate = t.CompletionDate.ToString(),
                    t.Amount,
                    t.Fee,
                    t.Description,
                    t.ReferenceId,
                    t.ProviderId,
                    t.CurrencyId,
                    t.TransactionTypeId,
                    t.DataOwnerId
                }));
            };
        }
    }
}
