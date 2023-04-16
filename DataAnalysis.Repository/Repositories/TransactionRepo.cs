using Dapper;
using DataAnalysis.Repository.Repositories.Interfaces;
using Npgsql;
using DataAnalysis.Repository.Models;
using DataAnalysis.Common.Configuration;

namespace DataAnalysis.Repository.Repositories {
    public class TransactionRepo : ITransactionRepo {

        private string _npsqlConnectionString;

        public TransactionRepo(IEnvironmentConfiguration envConfig) {
            _npsqlConnectionString = envConfig.GetNpsqlConnectionString();
        }

        public async Task<IEnumerable<TransactionResponse>> GetTransactionByUserId(int dataOwnerId) {
            using (var connection = new NpgsqlConnection(_npsqlConnectionString)) {
                connection.Open();
                var sql = @"
                    SELECT 
                        t.id as Id, 
                        t.registration_date::timestamp as RegistrationDate, 
                        t.completition_date::timestamp as CompletitionDate, 
                        t.amount as Amount, 
                        t.fee as Fee, 
                        t.description as Description, 
                        t.reference_id as ReferenceId, 
                        p.""name""  as Provider, 
                        c.""type""  as Currency, 
                        tt.""type""  as TransactionType, 
                        data_owner_id as DataOwnerId
                    FROM public.""transaction"" t
                    JOIN public.currency c ON c.id = t.currency_id
                    JOIN public.provider p ON p.id = t.provider_id 
                    JOIN public.transaction_type tt ON tt.id = t.transaction_type_id  
                    WHERE data_owner_id = @dataOwnerId;";

                return await connection.QueryAsync<TransactionResponse>(sql, new { dataOwnerId });
            };
        }

        public async Task<IEnumerable<string>> GetTransactionIds(int dataOwnerId, int providerId) {
            using (var connection = new NpgsqlConnection(_npsqlConnectionString)) {
                connection.Open();
                var sql = @"
                    SELECT identifier 
                    FROM public.""transaction"" t
                    WHERE t.data_owner_id = @dataOwnerId
                        AND t.provider_id = @providerId;";

                return await connection.QueryAsync<string>(sql, new { dataOwnerId, providerId });
            };
        }

        public async Task<int> StoreTransactions(IEnumerable<Transaction> transactions) {
            using (var connection = new NpgsqlConnection(_npsqlConnectionString)) {
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
                    t.RegistrationDate,
                    t.CompletionDate,
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
