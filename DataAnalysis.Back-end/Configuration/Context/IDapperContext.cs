using System.Data;

namespace DataAnalysis.Configuration.Context {
    public interface IDapperContext {
        IDbConnection CreateNpgsqlConnection();
    }
}
