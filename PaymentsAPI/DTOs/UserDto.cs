using System.ComponentModel.DataAnnotations;

namespace PaymentsAPI.DTOs
{
    public class UserRegistrationDto
    {
        [Required(ErrorMessage = "Full Name is required")]
        [StringLength(150, ErrorMessage = "Full Name cannot exceed 150 characters")]
        public string FullName { get; set; } = null!;

        [Required(ErrorMessage = "Username is required")]
        [RegularExpression(@"^[a-zA-Z0-9]{3,20}$", ErrorMessage = "Username must be alphanumeric and 3-20 characters long")]
        public string Username { get; set; } = null!;

        [Required(ErrorMessage = "Email is required")]
        [EmailAddress(ErrorMessage = "Invalid email format")]
        public string Email { get; set; } = null!;

        [Required(ErrorMessage = "Password is required")]
        [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$", 
            ErrorMessage = "Password must be at least 8 characters with 1 uppercase, 1 lowercase, 1 number, and 1 special character")]
        public string Password { get; set; } = null!;

        [Required(ErrorMessage = "Role is required")]
        [RegularExpression(@"^(Customer|Employee|Admin)$", ErrorMessage = "Role must be Customer, Employee, or Admin")]
        public string Role { get; set; } = null!;

        [StringLength(30, ErrorMessage = "ID Number cannot exceed 30 characters")]
        public string? IDNumber { get; set; } // only for customers

        [StringLength(30, ErrorMessage = "Employee Number cannot exceed 30 characters")]
        public string? EmployeeNumber { get; set; } // only for employees
    }

    public class UserLoginDto
    {
        [Required(ErrorMessage = "Username is required")]
        public string Username { get; set; } = null!;

        [Required(ErrorMessage = "Password is required")]
        public string Password { get; set; } = null!;
    }

    public class UserResponseDto
    {
        public int UserID { get; set; }
        public string FullName { get; set; } = null!;
        public string Username { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string Role { get; set; } = null!;
        public string? IDNumber { get; set; }
        public string? EmployeeNumber { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class UserProfileUpdateDto
    {
        [Required(ErrorMessage = "Full Name is required")]
        [StringLength(150, ErrorMessage = "Full Name cannot exceed 150 characters")]
        public string FullName { get; set; } = null!;

        [Required(ErrorMessage = "Email is required")]
        [EmailAddress(ErrorMessage = "Invalid email format")]
        public string Email { get; set; } = null!;

        [StringLength(30, ErrorMessage = "ID Number cannot exceed 30 characters")]
        public string? IDNumber { get; set; }

        [StringLength(30, ErrorMessage = "Employee Number cannot exceed 30 characters")]
        public string? EmployeeNumber { get; set; }
    }

    public class ChangePasswordDto
    {
        [Required(ErrorMessage = "Current password is required")]
        public string CurrentPassword { get; set; } = null!;

        [Required(ErrorMessage = "New password is required")]
        [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$", 
            ErrorMessage = "Password must be at least 8 characters with 1 uppercase, 1 lowercase, 1 number, and 1 special character")]
        public string NewPassword { get; set; } = null!;

        [Required(ErrorMessage = "Confirm password is required")]
        [Compare(nameof(NewPassword), ErrorMessage = "Passwords do not match")]
        public string ConfirmPassword { get; set; } = null!;
    }
}
