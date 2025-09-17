using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PaymentsAPI.Models
{
    public partial class PaymentVerification
    {
        [Key]
        public int VerificationID { get; set; }

        [Required]
        public int PaymentID { get; set; }

        [Required]
        public int EmployeeID { get; set; }

        public DateTime VerifiedAt { get; set; }

        [Required]
        [StringLength(20)]
        public string Action { get; set; } = null!; // "Verified", "Rejected"

        [ForeignKey("PaymentID")]
        [InverseProperty("PaymentVerifications")]
        public virtual Payment Payment { get; set; } = null!;

        [ForeignKey("EmployeeID")]
        [InverseProperty("PaymentVerifications")]
        public virtual User Employee { get; set; } = null!;
    }
}
