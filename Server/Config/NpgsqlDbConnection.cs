using Npgsql;
using System.Data;

namespace Server.DbConfig {
    public class NpgsqlDbConnection {
        private readonly string ConnectionString;

        public NpgsqlDbConnection(string connectionString) {
            ConnectionString = connectionString;
        }

        public IDbConnection Connect() {
            return new NpgsqlConnection(ConnectionString);
        }
    }
}
