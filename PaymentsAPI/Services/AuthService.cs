using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.EntityFrameworkCore;
using PaymentsAPI.Data;
using PaymentsAPI.DTOs;
using PaymentsAPI.Models;
using System.Security.Claims;

namespace PaymentsAPI.Services
{
    public class AuthService : IAuthService
    {
        private readonly PaymentsDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public AuthService(PaymentsDbContext context, IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<UserResponseDto?> RegisterAsync(UserRegistrationDto registrationDto)
        {
            // Check if username, email, or ID number already exists
            if (!await IsUsernameAvailableAsync(registrationDto.Username))
                throw new InvalidOperationException("Username is already taken");

            if (!await IsEmailAvailableAsync(registrationDto.Email))
                throw new InvalidOperationException("Email is already registered");

            if (registrationDto.IDNumber != null && !await IsIdNumberAvailableAsync(registrationDto.IDNumber))
                throw new InvalidOperationException("ID Number is already registered");

            if (registrationDto.EmployeeNumber != null && !await IsEmployeeNumberAvailableAsync(registrationDto.EmployeeNumber))
                throw new InvalidOperationException("Employee Number is already registered");

            // Hash password using BCrypt
            string passwordHash = BCrypt.Net.BCrypt.HashPassword(registrationDto.Password);
            string passwordSalt = BCrypt.Net.BCrypt.GenerateSalt();

            var user = new User
            {
                FullName = registrationDto.FullName,
                Username = registrationDto.Username,
                Email = registrationDto.Email,
                PasswordHash = passwordHash,
                PasswordSalt = passwordSalt,
                Role = registrationDto.Role,
                IDNumber = registrationDto.IDNumber,
                EmployeeNumber = registrationDto.EmployeeNumber,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return MapToUserResponseDto(user);
        }

        public async Task<UserResponseDto?> LoginAsync(UserLoginDto loginDto)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Username == loginDto.Username);

            if (user == null || !BCrypt.Net.BCrypt.Verify(loginDto.Password, user.PasswordHash))
                return null;

            // Sign in the user
            await SignInUserAsync(user);

            return MapToUserResponseDto(user);
        }

        private async Task SignInUserAsync(User user)
        {
            // Create claims
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.UserID.ToString()),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim("Role", user.Role),
                new Claim("FullName", user.FullName)
            };

            var claimsIdentity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
            var authProperties = new AuthenticationProperties
            {
                IsPersistent = true,
                ExpiresUtc = DateTimeOffset.UtcNow.AddHours(24),
                AllowRefresh = true
            };

            var httpContext = _httpContextAccessor.HttpContext;
            if (httpContext != null)
            {
                await httpContext.SignInAsync(
                    CookieAuthenticationDefaults.AuthenticationScheme,
                    new ClaimsPrincipal(claimsIdentity),
                    authProperties);
            }
        }

        public async Task LogoutAsync()
        {
            var httpContext = _httpContextAccessor.HttpContext;
            if (httpContext != null)
            {
                await httpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            }
        }

        public async Task<UserResponseDto?> GetCurrentUserAsync()
        {
            var httpContext = _httpContextAccessor.HttpContext;
            if (httpContext?.User?.Identity?.IsAuthenticated != true)
                return null;

            var userIdClaim = httpContext.User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
                return null;

            var user = await _context.Users.FindAsync(userId);
            return user != null ? MapToUserResponseDto(user) : null;
        }

        public async Task<bool> IsUsernameAvailableAsync(string username)
        {
            return !await _context.Users.AnyAsync(u => u.Username == username);
        }

        public async Task<bool> IsEmailAvailableAsync(string email)
        {
            return !await _context.Users.AnyAsync(u => u.Email == email);
        }

        public async Task<bool> IsIdNumberAvailableAsync(string idNumber)
        {
            return !await _context.Users.AnyAsync(u => u.IDNumber == idNumber);
        }

        public async Task<bool> IsEmployeeNumberAvailableAsync(string employeeNumber)
        {
            return !await _context.Users.AnyAsync(u => u.EmployeeNumber == employeeNumber);
        }

        private static UserResponseDto MapToUserResponseDto(User user)
        {
            return new UserResponseDto
            {
                UserID = user.UserID,
                FullName = user.FullName,
                Username = user.Username,
                Email = user.Email,
                Role = user.Role,
                IDNumber = user.IDNumber,
                EmployeeNumber = user.EmployeeNumber,
                CreatedAt = user.CreatedAt,
                UpdatedAt = user.UpdatedAt
            };
        }

        public async Task<UserResponseDto> UpdateProfileAsync(UserProfileUpdateDto updateDto)
        {
            var httpContext = _httpContextAccessor.HttpContext;
            if (httpContext?.User?.Identity?.IsAuthenticated != true)
            {
                throw new InvalidOperationException("User not authenticated");
            }

            var userIdClaim = httpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(userIdClaim, out int userId))
            {
                throw new InvalidOperationException("Invalid user ID");
            }

            var user = await _context.Users.FindAsync(userId);
            if (user == null)
            {
                throw new InvalidOperationException("User not found");
            }

            // Check if email is already taken by another user
            if (user.Email != updateDto.Email)
            {
                var emailExists = await _context.Users.AnyAsync(u => u.Email == updateDto.Email && u.UserID != userId);
                if (emailExists)
                {
                    throw new InvalidOperationException("Email is already taken");
                }
            }

            // Check if ID number is already taken by another user
            if (!string.IsNullOrEmpty(updateDto.IDNumber) && user.IDNumber != updateDto.IDNumber)
            {
                var idExists = await _context.Users.AnyAsync(u => u.IDNumber == updateDto.IDNumber && u.UserID != userId);
                if (idExists)
                {
                    throw new InvalidOperationException("ID number is already taken");
                }
            }

            // Check if employee number is already taken by another user
            if (!string.IsNullOrEmpty(updateDto.EmployeeNumber) && user.EmployeeNumber != updateDto.EmployeeNumber)
            {
                var empExists = await _context.Users.AnyAsync(u => u.EmployeeNumber == updateDto.EmployeeNumber && u.UserID != userId);
                if (empExists)
                {
                    throw new InvalidOperationException("Employee number is already taken");
                }
            }

            // Update user properties
            user.FullName = updateDto.FullName;
            user.Email = updateDto.Email;
            user.IDNumber = updateDto.IDNumber;
            user.EmployeeNumber = updateDto.EmployeeNumber;
            user.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return MapToUserResponseDto(user);
        }

        public async Task ChangePasswordAsync(ChangePasswordDto changePasswordDto)
        {
            var httpContext = _httpContextAccessor.HttpContext;
            if (httpContext?.User?.Identity?.IsAuthenticated != true)
            {
                throw new InvalidOperationException("User not authenticated");
            }

            var userIdClaim = httpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!int.TryParse(userIdClaim, out int userId))
            {
                throw new InvalidOperationException("Invalid user ID");
            }

            var user = await _context.Users.FindAsync(userId);
            if (user == null)
            {
                throw new InvalidOperationException("User not found");
            }

            // Verify current password
            if (!BCrypt.Net.BCrypt.Verify(changePasswordDto.CurrentPassword, user.PasswordHash))
            {
                throw new InvalidOperationException("Current password is incorrect");
            }

            // Hash new password
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(changePasswordDto.NewPassword);
            user.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
        }
    }
}
