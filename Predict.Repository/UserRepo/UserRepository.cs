using Dapper;
using Predict.Common.Configuration;
using Npgsql;
using Predict.Repository.UserRepo.Models;

namespace Predict.Repository.UserRepo;

public class UserRepository : IUserRepository {

    private string _npsqlConnectionString;

    public UserRepository(IEnvironmentConfiguration envConfig) {
        _npsqlConnectionString = envConfig.GetNpsqlConnectionString();
    }

    public async Task<bool> IsExistingUser(string email) {
        using (var connection = new NpgsqlConnection(_npsqlConnectionString)) {
            connection.Open();
            var sql = @"
                    SELECT EXISTS(
                        SELECT 1 
                        FROM public.""users""    
                        WHERE email = @email
                    )";
            return (await connection.QueryAsync<bool>(sql, new { email })).FirstOrDefault();
        };
    }

    public async Task<AppUser> GetAppUserByEmail(string email) {
        using (var connection = new NpgsqlConnection(_npsqlConnectionString)) {
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
                    FROM public.""users"" u 
                    WHERE u.email = @email;";
            return (await connection.QueryAsync<AppUser>(sql, new { email })).FirstOrDefault();
        };
    }

    public async Task<int> StoreUser(AppUser user) {
        using (var connection = new NpgsqlConnection(_npsqlConnectionString)) {
            connection.Open();
            var sql = @"
                    INSERT INTO public.""users"" 
                        (email, password_hash, password_salt, join_date, last_login, is_active, is_admin) 
                    VALUES
                        (@Email, @PasswordHash, @PasswordSalt, @JoinDate, @LastLogin, @IsActive, @IsAdmin)
                    RETURNING id;";

            return await connection.ExecuteScalarAsync<int>(sql, user);
        };
    }

    public async Task<User> GetUserByEmail(string email) {
        using (var connection = new NpgsqlConnection(_npsqlConnectionString)) {
            connection.Open();
            var sql = @"
                    SELECT 
                        u.id as Id, 
                        u.email as Email,
                        u.join_date as JoinDate,
                        u.last_login as LastLogin,
                        u.is_active as IsActive,
                        u.is_admin as IsAdmin
                    FROM public.""users"" u 
                    WHERE u.email = @email;";
            return (await connection.QueryAsync<User>(sql, new { email })).FirstOrDefault();
        };
    }

    public async Task<IEnumerable<DataOwner>> GetDataOwnersByUserId(int userId) {
        using (var connection = new NpgsqlConnection(_npsqlConnectionString)) {
            connection.Open();
            var sql = @"
                    SELECT 
	                    do2.id as Id,
	                    do2.""name"" as Name,
	                    do2.creation_date as CreationDate,
	                    do2.user_id as UserId
                    FROM public.data_owner do2 
                    JOIN public.""users"" u ON u.id = do2.user_id
                    WHERE u.id = @userId;";
            return await connection.QueryAsync<DataOwner>(sql, new { userId });
        };
    }

    public async Task<int> StoreDataOwner(DataOwner owner) {
        using (var connection = new NpgsqlConnection(_npsqlConnectionString)) {
            connection.Open();
            var sql = @"
                    INSERT INTO public.data_owner
                        (name, creation_date, user_id) 
                    VALUES 
                        (@Name, @CreationDate, @UserId)
                    RETURNING id;";
            return await connection.ExecuteAsync(sql, owner);
        };
    }
}