using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PaymentsAPI.Models
{
    public partial class BankAccount
    {
        public BankAccount()
        {
            Payments = new HashSet<Payment>();
        }

        [Key]
        public int AccountID { get; set; }

        [Required]
        public int UserID { get; set; }

        [Required]
        [StringLength(30)]
        public string AccountNumber { get; set; } = null!;

        [Required]
        [StringLength(20)]
        public string AccountType { get; set; } = null!; // "Checking", "Savings", "Business"

        [Column(TypeName = "decimal(18, 2)")]
        public decimal Balance { get; set; }

        [Required]
        [StringLength(3)]
        public string CurrencyCode { get; set; } = null!;

        public DateTime CreatedAt { get; set; }

        public DateTime UpdatedAt { get; set; }

        [ForeignKey("UserID")]
        [InverseProperty("BankAccounts")]
        public virtual User User { get; set; } = null!;

        [ForeignKey("CurrencyCode")]
        [InverseProperty("BankAccounts")]
        public virtual Currency Currency { get; set; } = null!;

        public virtual ICollection<Payment> Payments { get; set; }
    }
}
