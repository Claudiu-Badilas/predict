using Microsoft.AspNetCore.Mvc;
using DataAnalysis.Controllers.Models;
using DataAnalysis.Repositories.Interfaces;
using DataAnalysis.Services.Interfaces;

namespace DataAnalysis.Controllers {
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
        public async Task<ActionResult> RegisterUser([FromBody] UserRequest userRequest) {
            if (await _userRepo.IsExistingUser(userRequest.Email)) {
                return BadRequest("Email is already used!");
            }
            await _accService.RegisterUser(userRequest);
            return Ok();
        }

        [HttpPost("login")]
        public async Task<ActionResult> Login([FromBody] UserRequest userRequest) {
            var user = await _accService.LoginUser(userRequest);
            if (user == null) {
                return Unauthorized("Invalid Email or Password!");
            }

            return Ok(new {
                Token = _tokenService.CreateToken(user)
            });
        }
    }
}
