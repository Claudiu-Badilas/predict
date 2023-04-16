using DataAnalysis.Common.Configuration;
using Npgsql;
using System.Data;

namespace DataAnalysis.Configuration.Context {
    public class DapperContext : IDapperContext {
        private string _npsqlConnectionString;

        public DapperContext(IEnvironmentConfiguration envConfig) {
            _npsqlConnectionString = envConfig.GetNpsqlConnectionString();
        }

        public IDbConnection CreateNpgsqlConnection() => new NpgsqlConnection(_npsqlConnectionString);
    }
}
