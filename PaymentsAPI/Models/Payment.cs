using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PaymentsAPI.Models
{
    public partial class Payment
    {
        public Payment()
        {
            PaymentVerifications = new HashSet<PaymentVerification>();
        }

        [Key]
        public int PaymentID { get; set; }

        [Required]
        public int AccountID { get; set; }

        [Required]
        [Column(TypeName = "decimal(18, 2)")]
        public decimal Amount { get; set; }

        [Required]
        [StringLength(3)]
        public string CurrencyCode { get; set; } = null!;

        [Required]
        [StringLength(50)]
        public string PayeeAccount { get; set; } = null!;

        [Required]
        [StringLength(20)]
        public string PayeeSwiftCode { get; set; } = null!;

        [Required]
        [StringLength(20)]
        public string Status { get; set; } = "Pending"; // "Pending", "Verified", "Submitted"

        public DateTime CreatedAt { get; set; }

        public DateTime UpdatedAt { get; set; }

        [ForeignKey("AccountID")]
        [InverseProperty("Payments")]
        public virtual BankAccount BankAccount { get; set; } = null!;

        [ForeignKey("CurrencyCode")]
        [InverseProperty("Payments")]
        public virtual Currency Currency { get; set; } = null!;

        public virtual ICollection<PaymentVerification> PaymentVerifications { get; set; }
    }
}
