using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PaymentsAPI.DTOs;
using PaymentsAPI.Services;
using System.Security.Claims;

namespace PaymentsAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        /// <summary>
        /// Register a new customer account
        /// </summary>
        [HttpPost("register")]
        public async Task<ActionResult<UserResponseDto>> Register([FromBody] UserRegistrationDto registrationDto)
        {
            try
            {
                var user = await _authService.RegisterAsync(registrationDto);
                return Ok(user);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Login with username and password
        /// </summary>
        [HttpPost("login")]
        public async Task<ActionResult<UserResponseDto>> Login([FromBody] UserLoginDto loginDto)
        {
            var user = await _authService.LoginAsync(loginDto);
            if (user == null)
            {
                return Unauthorized(new { message = "Invalid username or password" });
            }

            return Ok(user);
        }

        /// <summary>
        /// Logout the current user
        /// </summary>
        [HttpPost("logout")]
        [Authorize]
        public async Task<IActionResult> Logout()
        {
            await _authService.LogoutAsync();
            return Ok(new { message = "Logged out successfully" });
        }

        /// <summary>
        /// Get current user information
        /// </summary>
        [HttpGet("me")]
        [Authorize]
        public async Task<ActionResult<UserResponseDto>> GetCurrentUser()
        {
            var user = await _authService.GetCurrentUserAsync();
            if (user == null)
            {
                return Unauthorized(new { message = "User not found" });
            }

            return Ok(user);
        }

        /// <summary>
        /// Check if username is available
        /// </summary>
        [HttpGet("check-username/{username}")]
        public async Task<ActionResult<object>> CheckUsername(string username)
        {
            var isAvailable = await _authService.IsUsernameAvailableAsync(username);
            return Ok(new { available = isAvailable });
        }

        /// <summary>
        /// Check if email is available
        /// </summary>
        [HttpGet("check-email/{email}")]
        public async Task<ActionResult<object>> CheckEmail(string email)
        {
            var isAvailable = await _authService.IsEmailAvailableAsync(email);
            return Ok(new { available = isAvailable });
        }

        /// <summary>
        /// Check if ID number is available
        /// </summary>
        [HttpGet("check-idnumber/{idNumber}")]
        public async Task<ActionResult<object>> CheckIdNumber(string idNumber)
        {
            var isAvailable = await _authService.IsIdNumberAvailableAsync(idNumber);
            return Ok(new { available = isAvailable });
        }

        /// <summary>
        /// Update current user profile
        /// </summary>
        [HttpPut("profile")]
        [Authorize]
        public async Task<ActionResult<UserResponseDto>> UpdateProfile([FromBody] UserProfileUpdateDto updateDto)
        {
            try
            {
                var user = await _authService.UpdateProfileAsync(updateDto);
                return Ok(user);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Change password for current user
        /// </summary>
        [HttpPut("change-password")]
        [Authorize]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto changePasswordDto)
        {
            try
            {
                await _authService.ChangePasswordAsync(changePasswordDto);
                return Ok(new { message = "Password changed successfully" });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
