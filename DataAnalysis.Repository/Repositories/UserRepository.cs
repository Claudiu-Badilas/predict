using DataAnalysis.Models;
using Dapper;
using DataAnalysis.Repositories.Interfaces;
using Npgsql;
using static DataAnalysis.Common.Configuration.ConfigurationUtils;

namespace DataAnalysis.Repositories {
    public class UserRepository : IUserRepository {

        public async Task<bool> IsExistingUser(string email) {
            using (var connection = new NpgsqlConnection(NpsqlConnectionString)) {
                connection.Open();
                var sql = @"
                    SELECT email FROM public.""user"" 
                    WHERE email = @email;";

                return (await connection.QueryAsync<string>(sql, new { email })).ToList().Count > 0;
            };
        }

        public async Task<AppUser> GetUserByEmail(string email) {
            using (var connection = new NpgsqlConnection(NpsqlConnectionString)) {
                connection.Open();
                var sql = @"
                    SELECT 
                        u.id as Id, 
                        u.password_hash as PasswordHash,
                        u.password_salt as PasswordSalt,
                        u.email as Email,
                        u.join_date as JoinDate,
                        u.last_login as LastLogin,
                        u.is_active as IsActive,
                        u.is_admin as IsAdmin
                    FROM public.""user"" u 
                    WHERE u.email = @email;";
                return (await connection.QueryAsync<AppUser>(sql, new { email })).FirstOrDefault();
            };
        }

        public async Task AddUser(AppUser user) {
            using (var connection = new NpgsqlConnection(NpsqlConnectionString)) {
                connection.Open();
                var sql = @"
                    INSERT INTO public.""user"" 
                        (email, password_hash, password_salt, join_date, last_login, is_active, is_admin) 
                    VALUES
                        (@Email, @PasswordHash, @PasswordSalt, @JoinDate, @LastLogin, @IsActive, @IsAdmin);";

                await connection.ExecuteAsync(sql, user);
            };
        }
    }
}
