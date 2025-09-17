using System.ComponentModel.DataAnnotations;

namespace PaymentsAPI.DTOs
{
    public class BankAccountCreateDto
    {
        [Required(ErrorMessage = "Account Number is required")]
        [StringLength(30, ErrorMessage = "Account Number cannot exceed 30 characters")]
        public string AccountNumber { get; set; } = null!;

        [Required(ErrorMessage = "Account Type is required")]
        [RegularExpression(@"^(Checking|Savings|Business)$", ErrorMessage = "Account Type must be Checking, Savings, or Business")]
        public string AccountType { get; set; } = null!;

        [Required(ErrorMessage = "Currency Code is required")]
        [StringLength(3, ErrorMessage = "Currency Code must be exactly 3 characters")]
        public string CurrencyCode { get; set; } = null!;

        [Range(0, double.MaxValue, ErrorMessage = "Balance must be non-negative")]
        public decimal Balance { get; set; } = 0.00m;
    }

    public class BankAccountUpdateDto
    {
        [StringLength(30, ErrorMessage = "Account Number cannot exceed 30 characters")]
        public string? AccountNumber { get; set; }

        [RegularExpression(@"^(Checking|Savings|Business)$", ErrorMessage = "Account Type must be Checking, Savings, or Business")]
        public string? AccountType { get; set; }

        [StringLength(3, ErrorMessage = "Currency Code must be exactly 3 characters")]
        public string? CurrencyCode { get; set; }

        [Range(0, double.MaxValue, ErrorMessage = "Balance must be non-negative")]
        public decimal? Balance { get; set; }
    }

    public class BankAccountResponseDto
    {
        public int AccountID { get; set; }
        public int UserID { get; set; }
        public string AccountNumber { get; set; } = null!;
        public string AccountType { get; set; } = null!;
        public decimal Balance { get; set; }
        public string CurrencyCode { get; set; } = null!;
        public string CurrencyName { get; set; } = null!;
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
