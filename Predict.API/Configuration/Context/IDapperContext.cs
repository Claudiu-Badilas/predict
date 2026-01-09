using System.Data;

namespace Predict.Configuration.Context {
    public interface IDapperContext {
        IDbConnection CreateNpgsqlConnection();
    }
}
