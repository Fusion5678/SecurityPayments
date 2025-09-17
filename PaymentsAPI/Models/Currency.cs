using System.ComponentModel.DataAnnotations;

namespace PaymentsAPI.Models
{
    public partial class Currency
    {
        public Currency()
        {
            BankAccounts = new HashSet<BankAccount>();
            Payments = new HashSet<Payment>();
        }

        [Key]
        [StringLength(3)]
        public string CurrencyCode { get; set; } = null!; // USD, EUR, etc.

        [Required]
        [StringLength(50)]
        public string CurrencyName { get; set; } = null!;

        public virtual ICollection<BankAccount> BankAccounts { get; set; }
        public virtual ICollection<Payment> Payments { get; set; }
    }
}
