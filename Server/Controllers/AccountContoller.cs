using Dapper;
using Microsoft.AspNetCore.Mvc;
using Server.DbConfig;

namespace Server.Controllers {
    [Route("api")]
    public class AccountContoller : BaseController {

        private readonly ILogger<AccountContoller> _logger;
        private readonly NpgsqlDbConnection _conn;

        public AccountContoller(ILogger<AccountContoller> logger, NpgsqlDbConnection conn) {
            _logger = logger;
            _conn = conn;
        }

        [HttpGet("roles")]
        public async Task<IActionResult> GetRole() {
            using var conn = _conn.Connect();
            conn.Open();
            return Ok(await conn.QueryAsync<string>("select r.role_name from public.roles r"));
        }
    }
}