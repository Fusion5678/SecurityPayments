using System.ComponentModel.DataAnnotations;

namespace PaymentsAPI.DTOs
{
    public class PaymentCreateDto
    {
        [Required(ErrorMessage = "Account ID is required")]
        public int AccountID { get; set; }

        [Required(ErrorMessage = "Amount is required")]
        [Range(0.01, double.MaxValue, ErrorMessage = "Amount must be greater than 0")]
        public decimal Amount { get; set; }

        [Required(ErrorMessage = "Currency Code is required")]
        [StringLength(3, ErrorMessage = "Currency Code must be exactly 3 characters")]
        public string CurrencyCode { get; set; } = null!;

        [Required(ErrorMessage = "Payee Account is required")]
        [StringLength(50, ErrorMessage = "Payee Account cannot exceed 50 characters")]
        public string PayeeAccount { get; set; } = null!;

        [Required(ErrorMessage = "Payee SWIFT Code is required")]
        [StringLength(20, ErrorMessage = "Payee SWIFT Code cannot exceed 20 characters")]
        public string PayeeSwiftCode { get; set; } = null!;
    }

    public class PaymentResponseDto
    {
        public int PaymentID { get; set; }
        public int AccountID { get; set; }
        public string AccountNumber { get; set; } = null!;
        public string AccountType { get; set; } = null!;
        public decimal Amount { get; set; }
        public string CurrencyCode { get; set; } = null!;
        public string CurrencyName { get; set; } = null!;
        public string PayeeAccount { get; set; } = null!;
        public string PayeeSwiftCode { get; set; } = null!;
        public string Status { get; set; } = null!;
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public List<PaymentVerificationResponseDto> Verifications { get; set; } = new();
    }

    public class PaymentVerificationResponseDto
    {
        public int VerificationID { get; set; }
        public int PaymentID { get; set; }
        public int EmployeeID { get; set; }
        public string EmployeeName { get; set; } = null!;
        public DateTime VerifiedAt { get; set; }
        public string Action { get; set; } = null!;
    }
}
