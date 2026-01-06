using Dapper;
using Predict.Common.Configuration;
using Npgsql;
using Predict.Repository.HealthRepo.Models;

namespace Predict.Repository.HealthRepo;

public class HealthRepo : IHealthRepo {
    private string _npsqlConnectionString;

    public HealthRepo(IEnvironmentConfiguration envConfig) {
        _npsqlConnectionString = envConfig.GetNpsqlConnectionString();
    }

    public async Task<IEnumerable<HearthRate>> GetHearthRatesByDataOwnerId(int userId, int dataOwnerId, int providerId) {
        using (var connection = new NpgsqlConnection(_npsqlConnectionString)) {
            connection.Open();
            var sql = @"
                    SELECT 
                        hr.id as Id,
                        hr.""date"" as Date,
                        hr.rate as Rate,
                        hr.is_automation as IsAutomation,
                        p.id as providerId,
                        do2.id as DataOwnerId
                    FROM public.hearth_rate hr 
                    JOIN public.data_owner do2 ON do2.id = hr.data_owner_id 
                    JOIN public.""users"" u ON u.id = do2.user_id 
                    JOIN public.provider p ON p.id = hr.provider_id 
                    WHERE u.id = @userId
                        AND do2.id = @dataOwnerId
                        AND p.id = @providerId;";

            return await connection.QueryAsync<HearthRate>(sql, new {
                userId,
                dataOwnerId,
                providerId
            });
        };
    }

    public async Task<int> StoreHearthRates(IEnumerable<HearthRate> hearthRates) {
        using (var connection = new NpgsqlConnection(_npsqlConnectionString)) {
            connection.Open();
            var sql = @"
                    INSERT INTO public.hearth_rate
                        (rate, ""date"", is_automation, provider_id, data_owner_id)
                    VALUES 
                        (@Rate, @Date, @IsAutomation, @ProviderId, @DataOwnerId);";
            return await connection.ExecuteAsync(sql, hearthRates);
        }
    }
}