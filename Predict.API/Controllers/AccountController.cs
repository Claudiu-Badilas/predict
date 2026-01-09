using Microsoft.AspNetCore.Mvc;
using Predict.Repository.UserRepo.Models;
using Predict.Repository.UserRepo;
using Predict.Service.TokenService;
using Predict.Service.AccountService;

namespace Predict.Controllers;

[Route("api/v1/account")]
public class AccountController : BaseController
{

    private readonly IAccountService _accService;
    private readonly IUserRepository _userRepo;
    private readonly ITokenService _tokenService;

    public AccountController(IAccountService accService, IUserRepository userRepo, ITokenService tokenService)
    {
        _accService = accService;
        _userRepo = userRepo;
        _tokenService = tokenService;
    }

    [HttpPost("register")]
    public async Task<ActionResult> RegisterUser([FromBody] UserRequest userRequest)
    {
        if (await _userRepo.IsExistingUser(userRequest.Email))
        {
            return BadRequest("Email is already used!");
        }
        await _accService.RegisterUser(userRequest);
        return Ok();
    }

    [HttpPost("login")]
    public async Task<ActionResult> Login([FromBody] UserRequest userRequest)
    {
        var email = await _accService.LoginUser(userRequest);
        if (email == null)
        {
            return Unauthorized("Invalid Email or Password!");
        }

        return Ok(new
        {
            Token = _tokenService.CreateToken(email)
        });
    }
}
