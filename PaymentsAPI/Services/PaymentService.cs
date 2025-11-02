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
            payment.Status = action == "Verified" ? "Verified" : "Rejected";
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

        public async Task<IEnumerable<PaymentResponseDto>> GetAllPaymentsAsync(string? status = null)
        {
            var query = _context.Payments
                .Include(p => p.BankAccount)
                    .ThenInclude(ba => ba.User)
                .Include(p => p.Currency)
                .Include(p => p.PaymentVerifications)
                    .ThenInclude(v => v.Employee)
                .AsQueryable();

            if (!string.IsNullOrEmpty(status))
            {
                query = query.Where(p => p.Status.ToLower() == status.ToLower());
            }

            return await query
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
                    CustomerName = p.BankAccount.User.FullName,
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

        public async Task<bool> SubmitPaymentAsync(int paymentId, int employeeId)
        {
            var payment = await _context.Payments
                .Include(p => p.BankAccount)
                .FirstOrDefaultAsync(p => p.PaymentID == paymentId);

            if (payment == null || payment.Status != "Verified")
                return false;

            // Check if user has sufficient balance
            if (payment.BankAccount.Balance < payment.Amount)
                throw new InvalidOperationException("Insufficient balance to submit payment");

            // Update payment status to Submitted
            payment.Status = "Submitted";
            payment.UpdatedAt = DateTime.UtcNow;

            // Deduct amount from user's account
            payment.BankAccount.Balance -= payment.Amount;
            payment.BankAccount.UpdatedAt = DateTime.UtcNow;

            // Create verification record for submission (DB allows 'Submitted')
            var verification = new PaymentVerification
            {
                PaymentID = paymentId,
                EmployeeID = employeeId,
                Action = "Submitted",
                VerifiedAt = DateTime.UtcNow
            };

            _context.PaymentVerifications.Add(verification);

            // Send to dummy API (simulate external payment processing)
            try
            {
                await SendToDummyPaymentAPI(payment);

                await _context.SaveChangesAsync();
            }
            catch (Exception)
            {

                throw;
            }
         

            return true;
        }

        public async Task<PaymentStatisticsDto> GetPaymentStatisticsAsync()
        {
            var payments = await _context.Payments.ToListAsync();

            return new PaymentStatisticsDto
            {
                TotalPayments = payments.Count,
                PendingPayments = payments.Count(p => p.Status == "Pending"),
                VerifiedPayments = payments.Count(p => p.Status == "Verified"),
                RejectedPayments = payments.Count(p => p.Status == "Rejected"),
                SubmittedPayments = payments.Count(p => p.Status == "Submitted"),
                TotalAmount = payments.Sum(p => p.Amount),
                PendingAmount = payments.Where(p => p.Status == "Pending").Sum(p => p.Amount),
                VerifiedAmount = payments.Where(p => p.Status == "Verified").Sum(p => p.Amount),
                SubmittedAmount = payments.Where(p => p.Status == "Submitted").Sum(p => p.Amount)
            };
        }

        private async Task SendToDummyPaymentAPI(Payment payment)
        {
            // Simulate sending to external payment API
            // In a real application, this would make an HTTP call to an external service
            await Task.Delay(100); // Simulate network delay
            
            // Log the payment submission
            Console.WriteLine($"Payment {payment.PaymentID} submitted to external API:");
            Console.WriteLine($"  Amount: {payment.Amount} {payment.CurrencyCode}");
            Console.WriteLine($"  Payee Account: {payment.PayeeAccount}");
            Console.WriteLine($"  SWIFT Code: {payment.PayeeSwiftCode}");
        }
    }
}
