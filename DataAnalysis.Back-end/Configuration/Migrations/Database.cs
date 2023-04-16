using Dapper;
using DataAnalysis.Configuration.Context;
using DataAnalysis.Configuration.Migrations;

namespace DataAnalysis.Configuration.Migrations {
    public class Database {
        private readonly IDapperContext _context;

        public Database(IDapperContext context) {
            _context = context;
        }

        public void CreateDatabase(string dbName) {
            using (var connection = _context.CreateNpgsqlConnection()) {
                var query = @"
                    SELECT datname 
                    FROM pg_catalog.pg_database 
                    WHERE lower(datname) = lower(@dbName)";
                var records = connection.Query(query, new { dbName });
                if (!records.Any())
                    connection.Execute($"CREATE DATABASE {dbName}");
            }
        }
    }
}
