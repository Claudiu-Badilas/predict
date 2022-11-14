using Dapper;
using Microsoft.AspNetCore.Mvc;
using Server.DbConfig;

namespace Server.Controllers
{
    [ApiController]
    [Route("api")]
    public class WeatherForecastController : ControllerBase
    {

        private readonly ILogger<WeatherForecastController> _logger;
        private readonly NpgsqlDbConnection _conn;

        public WeatherForecastController(ILogger<WeatherForecastController> logger, NpgsqlDbConnection conn)
        {
            _logger = logger;
            _conn = conn;
        }

        [HttpGet("roles")]
        public Task<IEnumerable<string>> GetRole()
        {
            using var conn = _conn.Connect();
            conn.Open();
            return conn.QueryAsync<string>("select r.role_name from public.roles r");
        }
    }
}