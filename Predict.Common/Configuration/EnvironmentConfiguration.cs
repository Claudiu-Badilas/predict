namespace Predict.Common.Configuration;

public class EnvironmentConfiguration : IEnvironmentConfiguration {
    public string GetNpsqlConnectionString() => Environment.GetEnvironmentVariable("DB_CONN_STRING");
    public string GetJWTKey() => Environment.GetEnvironmentVariable("TOKEN_KEY");
}