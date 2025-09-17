using PaymentsAPI.DTOs;

namespace PaymentsAPI.Services
{
    public interface IAuthService
    {
        Task<UserResponseDto?> RegisterAsync(UserRegistrationDto registrationDto);
        Task<UserResponseDto?> LoginAsync(UserLoginDto loginDto);
        Task LogoutAsync();
        Task<UserResponseDto?> GetCurrentUserAsync();
        Task<bool> IsUsernameAvailableAsync(string username);
        Task<bool> IsEmailAvailableAsync(string email);
        Task<bool> IsIdNumberAvailableAsync(string idNumber);
        Task<bool> IsEmployeeNumberAvailableAsync(string employeeNumber);
        Task<UserResponseDto> UpdateProfileAsync(UserProfileUpdateDto updateDto);
        Task ChangePasswordAsync(ChangePasswordDto changePasswordDto);
    }
}
