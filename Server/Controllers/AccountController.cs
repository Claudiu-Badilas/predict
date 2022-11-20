using Dapper;
using Microsoft.AspNetCore.Mvc;
using Server.Configuration;
using Server.Controllers.Models;
using Server.Repositories.Interfaces;
using Server.Services.Interfaces;

namespace Server.Controllers {
    [Route("api")]
    public class AccountController : BaseController {

        private readonly IAccountService _accService;
        private readonly IUserRepository _userRepo;
        private readonly ITokenService _tokenService;

        public AccountController(IAccountService accService, IUserRepository userRepo, ITokenService tokenService) {
            _accService = accService;
            _userRepo = userRepo;
            _tokenService = tokenService;
        }

        [HttpPost("register")]
        public async Task<ActionResult> RegisterUser([FromBody] UserRequest registerDto) {
            try {
                var data = await _userRepo.IsExistingUser(registerDto.Email);
                if (data) {
                    return BadRequest("Email is already used!");
                }
                await _accService.RegisterUser(registerDto);
                return Ok();
            } catch (Exception e) {
                return BadRequest(e.Message);
            }
        }

        [HttpPost("login")]
        public async Task<ActionResult> Login([FromBody] UserRequest loginDto) {
            try {
                var user = await _accService.LoginUser(loginDto);
                if (user == null) {
                    return Unauthorized("Invalid Email or Password!");
                }

                return Ok(new {
                    Token = _tokenService.CreateToken(user)
                });
            } catch (Exception e) {
                return BadRequest(e.Message);
            }
        }
    }
}
