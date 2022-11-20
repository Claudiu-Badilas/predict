using Server.Configuration;
using Server.Models;
using Dapper;
using Server.Repositories.Interfaces;

namespace Server.Repositories {
    public class UserRepository : IUserRepository {
        private readonly NpgsqlDbConnection _conn;

        public UserRepository(NpgsqlDbConnection conn) {
            _conn = conn;
        }

        public async Task<bool> IsExistingUser(string email) {
            using (var connection = _conn.Connect()) {
                connection.Open();
                var sql = @"SELECT email FROM platform.users WHERE email = @email;";

                return (await connection.QueryAsync<string>(sql, new { email })).ToList().Count > 0;
            };
        }

        public async Task<AppUser> GetUserByEmail(string email) {
            using (var connection = _conn.Connect()) {
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
                        r.id as RoleId, 
                        r.role_name as RoleName
                    FROM platform.users u 
                    JOIN platform.roles r ON u.role_id = r.id
                    WHERE u.email = @email;";
                return (await connection.QueryAsync<AppUser>(sql, new { email })).FirstOrDefault();
            };
        }

        public async Task AddUser(AppUser user) {
            using (var connection = _conn.Connect()) {
                connection.Open();
                var sql = @"
                    INSERT INTO platform.users 
                        (email, password_hash, password_salt, join_date, last_login, is_active, role_id) 
                    VALUES
                        (@Email, @PasswordHash, @PasswordSalt, @JoinDate, @LastLogin, @IsActive, @RoleId);";

                await connection.ExecuteAsync(sql, user);
            };
        }
    }
}
