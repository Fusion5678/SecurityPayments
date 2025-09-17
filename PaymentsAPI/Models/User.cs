using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PaymentsAPI.Models
{
    public partial class User
    {
        public User()
        {
            BankAccounts = new HashSet<BankAccount>();
            PaymentVerifications = new HashSet<PaymentVerification>();
        }

        [Key]
        public int UserID { get; set; }

        [Required]
        [StringLength(150)]
        public string FullName { get; set; } = null!;

        [Required]
        [StringLength(50)]
        public string Username { get; set; } = null!;

        [Required]
        [StringLength(150)]
        public string Email { get; set; } = null!;

        [Required]
        [StringLength(255)]
        public string PasswordHash { get; set; } = null!;

        [Required]
        [StringLength(255)]
        public string PasswordSalt { get; set; } = null!;

        [Required]
        [StringLength(20)]
        public string Role { get; set; } = null!; // "Customer", "Employee", "Admin"

        [StringLength(30)]
        public string? IDNumber { get; set; } // only for customers

        [StringLength(30)]
        public string? EmployeeNumber { get; set; } // only for employees

        public DateTime CreatedAt { get; set; }

        public DateTime UpdatedAt { get; set; }

        public virtual ICollection<BankAccount> BankAccounts { get; set; }
        public virtual ICollection<PaymentVerification> PaymentVerifications { get; set; }
    }
}
