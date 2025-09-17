using Microsoft.EntityFrameworkCore;
using PaymentsAPI.Data;
using PaymentsAPI.DTOs;
using PaymentsAPI.Models;

namespace PaymentsAPI.Services
{
    public class PaymentService : IPaymentService
    {
        private readonly PaymentsDbContext _context;

        public PaymentService(PaymentsDbContext context)
        {
            _context = context;
        }

        public async Task<PaymentResponseDto?> CreatePaymentAsync(int userId, PaymentCreateDto createDto)
        {
            // Verify bank account belongs to user
            var bankAccount = await _context.BankAccounts
                .Include(ba => ba.Currency)
                .FirstOrDefaultAsync(ba => ba.AccountID == createDto.AccountID && ba.UserID == userId);

            if (bankAccount == null)
                throw new InvalidOperationException("Bank account not found or does not belong to user");

            // Verify currency exists
            var currency = await _context.Currencies.FindAsync(createDto.CurrencyCode);
            if (currency == null)
                throw new InvalidOperationException("Invalid currency code");

            // Check if user has sufficient balance
            if (bankAccount.Balance < createDto.Amount)
                throw new InvalidOperationException("Insufficient balance");

            var payment = new Payment
            {
                AccountID = createDto.AccountID,
                Amount = createDto.Amount,
                CurrencyCode = createDto.CurrencyCode,
                PayeeAccount = createDto.PayeeAccount,
                PayeeSwiftCode = createDto.PayeeSwiftCode,
                Status = "Pending",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Payments.Add(payment);
            await _context.SaveChangesAsync();

            return await GetPaymentAsync(userId, payment.PaymentID);
        }

        public async Task<IEnumerable<PaymentResponseDto>> GetUserPaymentsAsync(int userId)
        {
            return await _context.Payments
                .Where(p => p.BankAccount.UserID == userId)
                .Include(p => p.BankAccount)
                .Include(p => p.Currency)
                .Include(p => p.PaymentVerifications)
                    .ThenInclude(v => v.Employee)
                .OrderByDescending(p => p.CreatedAt)
                .Select(p => new PaymentResponseDto
                {
                    PaymentID = p.PaymentID,
                    AccountID = p.AccountID,
                    AccountNumber = p.BankAccount.AccountNumber,
                    AccountType = p.BankAccount.AccountType,
                    Amount = p.Amount,
                    CurrencyCode = p.CurrencyCode,
                    CurrencyName = p.Currency.CurrencyName,
                    PayeeAccount = p.PayeeAccount,
                    PayeeSwiftCode = p.PayeeSwiftCode,
                    Status = p.Status,
                    CreatedAt = p.CreatedAt,
                    UpdatedAt = p.UpdatedAt,
                    Verifications = p.PaymentVerifications.Select(v => new PaymentVerificationResponseDto
                    {
                        VerificationID = v.VerificationID,
                        PaymentID = v.PaymentID,
                        EmployeeID = v.EmployeeID,
                        EmployeeName = v.Employee.FullName,
                        VerifiedAt = v.VerifiedAt,
                        Action = v.Action
                    }).ToList()
                })
                .ToListAsync();
        }

        public async Task<PaymentResponseDto?> GetPaymentAsync(int userId, int paymentId)
        {
            var payment = await _context.Payments
                .Where(p => p.BankAccount.UserID == userId && p.PaymentID == paymentId)
                .Include(p => p.BankAccount)
                .Include(p => p.Currency)
                .Include(p => p.PaymentVerifications)
                    .ThenInclude(v => v.Employee)
                .FirstOrDefaultAsync();

            if (payment == null)
                return null;

            return new PaymentResponseDto
            {
                PaymentID = payment.PaymentID,
                AccountID = payment.AccountID,
                AccountNumber = payment.BankAccount.AccountNumber,
                AccountType = payment.BankAccount.AccountType,
                Amount = payment.Amount,
                CurrencyCode = payment.CurrencyCode,
                CurrencyName = payment.Currency.CurrencyName,
                PayeeAccount = payment.PayeeAccount,
                PayeeSwiftCode = payment.PayeeSwiftCode,
                Status = payment.Status,
                CreatedAt = payment.CreatedAt,
                UpdatedAt = payment.UpdatedAt,
                Verifications = payment.PaymentVerifications.Select(v => new PaymentVerificationResponseDto
                {
                    VerificationID = v.VerificationID,
                    PaymentID = v.PaymentID,
                    EmployeeID = v.EmployeeID,
                    EmployeeName = v.Employee.FullName,
                    VerifiedAt = v.VerifiedAt,
                    Action = v.Action
                }).ToList()
            };
        }

        public async Task<bool> VerifyPaymentAsync(int paymentId, int employeeId, string action)
        {
            var payment = await _context.Payments.FindAsync(paymentId);
            if (payment == null)
                return false;

            // Update payment status based on action
            payment.Status = action == "Verified" ? "Verified" : "Pending";
            payment.UpdatedAt = DateTime.UtcNow;

            // Create new verification record
            var verification = new PaymentVerification
            {
                PaymentID = paymentId,
                EmployeeID = employeeId,
                Action = action,
                VerifiedAt = DateTime.UtcNow
            };

            _context.PaymentVerifications.Add(verification);
            await _context.SaveChangesAsync();

            return true;
        }
    }
}
