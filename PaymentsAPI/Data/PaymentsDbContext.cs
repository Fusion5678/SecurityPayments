using Microsoft.EntityFrameworkCore;
using PaymentsAPI.Models;

namespace PaymentsAPI.Data
{
    public partial class PaymentsDbContext : DbContext
    {
        public PaymentsDbContext(DbContextOptions<PaymentsDbContext> options)
            : base(options)
        {
        }

        public virtual DbSet<User> Users { get; set; } = null!;
        public virtual DbSet<BankAccount> BankAccounts { get; set; } = null!;
        public virtual DbSet<Currency> Currencies { get; set; } = null!;
        public virtual DbSet<Payment> Payments { get; set; } = null!;
        public virtual DbSet<PaymentVerification> PaymentVerifications { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasIndex(e => e.Username, "IX_Users_Username")
                    .IsUnique();

                entity.HasIndex(e => e.Email, "IX_Users_Email")
                    .IsUnique();

                entity.HasIndex(e => e.IDNumber, "IX_Users_IDNumber")
                    .IsUnique()
                    .HasFilter("[IDNumber] IS NOT NULL");

                entity.HasIndex(e => e.EmployeeNumber, "IX_Users_EmployeeNumber")
                    .IsUnique()
                    .HasFilter("[EmployeeNumber] IS NOT NULL");

                entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");
                entity.Property(e => e.UpdatedAt).HasDefaultValueSql("(getdate())");
            });

            modelBuilder.Entity<BankAccount>(entity =>
            {
                entity.HasIndex(e => e.AccountNumber, "IX_BankAccounts_AccountNumber")
                    .IsUnique();

                entity.Property(e => e.Balance).HasColumnType("decimal(18, 2)");
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");
                entity.Property(e => e.UpdatedAt).HasDefaultValueSql("(getdate())");
            });

            modelBuilder.Entity<Currency>(entity =>
            {
                entity.HasKey(e => e.CurrencyCode);
                entity.Property(e => e.CurrencyCode).HasMaxLength(3);
            });

            modelBuilder.Entity<Payment>(entity =>
            {
                entity.Property(e => e.Amount).HasColumnType("decimal(18, 2)");
                entity.Property(e => e.CreatedAt).HasDefaultValueSql("(getdate())");
                entity.Property(e => e.UpdatedAt).HasDefaultValueSql("(getdate())");
            });

            modelBuilder.Entity<PaymentVerification>(entity =>
            {
                entity.Property(e => e.VerifiedAt).HasDefaultValueSql("(getdate())");
            });

            OnModelCreatingPartial(modelBuilder);
        }

        partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
    }
}
