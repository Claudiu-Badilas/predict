using Predict.Common.Configuration;
using Npgsql;
using System.Data;

namespace Predict.Configuration.Context {
    public class DapperContext : IDapperContext {
        private string _npsqlConnectionString;

        public DapperContext(IEnvironmentConfiguration envConfig) {
            _npsqlConnectionString = envConfig.GetNpsqlConnectionString();
        }

        public IDbConnection CreateNpgsqlConnection() => new NpgsqlConnection(_npsqlConnectionString);
    }
}
