using Microsoft.EntityFrameworkCore;
using PaymentsAPI.Data;
using PaymentsAPI.DTOs;
using PaymentsAPI.Models;

namespace PaymentsAPI.Services
{
    public class BankAccountService : IBankAccountService
    {
        private readonly PaymentsDbContext _context;

        public BankAccountService(PaymentsDbContext context)
        {
            _context = context;
        }

        public async Task<BankAccountResponseDto?> CreateBankAccountAsync(int userId, BankAccountCreateDto createDto)
        {
            // Check if account number is available
            if (!await IsAccountNumberAvailableAsync(createDto.AccountNumber))
                throw new InvalidOperationException("Account number is already taken");

            // Verify currency exists
            var currency = await _context.Currencies.FindAsync(createDto.CurrencyCode);
            if (currency == null)
                throw new InvalidOperationException("Invalid currency code");

            var bankAccount = new BankAccount
            {
                UserID = userId,
                AccountNumber = createDto.AccountNumber,
                AccountType = createDto.AccountType,
                CurrencyCode = createDto.CurrencyCode,
                Balance = createDto.Balance,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.BankAccounts.Add(bankAccount);
            await _context.SaveChangesAsync();

            return await GetBankAccountAsync(userId, bankAccount.AccountID);
        }

        public async Task<IEnumerable<BankAccountResponseDto>> GetUserBankAccountsAsync(int userId)
        {
            return await _context.BankAccounts
                .Where(ba => ba.UserID == userId)
                .Include(ba => ba.Currency)
                .Select(ba => new BankAccountResponseDto
                {
                    AccountID = ba.AccountID,
                    UserID = ba.UserID,
                    AccountNumber = ba.AccountNumber,
                    AccountType = ba.AccountType,
                    CurrencyCode = ba.CurrencyCode,
                    CurrencyName = ba.Currency.CurrencyName,
                    Balance = ba.Balance,
                    CreatedAt = ba.CreatedAt,
                    UpdatedAt = ba.UpdatedAt
                })
                .ToListAsync();
        }

        public async Task<BankAccountResponseDto?> GetBankAccountAsync(int userId, int bankAccountId)
        {
            var bankAccount = await _context.BankAccounts
                .Where(ba => ba.UserID == userId && ba.AccountID == bankAccountId)
                .Include(ba => ba.Currency)
                .FirstOrDefaultAsync();

            if (bankAccount == null)
                return null;

            return new BankAccountResponseDto
            {
                AccountID = bankAccount.AccountID,
                UserID = bankAccount.UserID,
                AccountNumber = bankAccount.AccountNumber,
                AccountType = bankAccount.AccountType,
                CurrencyCode = bankAccount.CurrencyCode,
                CurrencyName = bankAccount.Currency.CurrencyName,
                Balance = bankAccount.Balance,
                CreatedAt = bankAccount.CreatedAt,
                UpdatedAt = bankAccount.UpdatedAt
            };
        }

        public async Task<BankAccountResponseDto?> UpdateBankAccountAsync(int userId, int bankAccountId, BankAccountUpdateDto updateDto)
        {
            var bankAccount = await _context.BankAccounts
                .FirstOrDefaultAsync(ba => ba.UserID == userId && ba.AccountID == bankAccountId);

            if (bankAccount == null)
                return null;

            // Check if new account number is available (if being changed)
            if (!string.IsNullOrEmpty(updateDto.AccountNumber) && 
                updateDto.AccountNumber != bankAccount.AccountNumber &&
                !await IsAccountNumberAvailableAsync(updateDto.AccountNumber))
            {
                throw new InvalidOperationException("Account number is already taken");
            }

            // Verify currency exists (if being changed)
            if (!string.IsNullOrEmpty(updateDto.CurrencyCode))
            {
                var currency = await _context.Currencies.FindAsync(updateDto.CurrencyCode);
                if (currency == null)
                    throw new InvalidOperationException("Invalid currency code");
            }

            // Update fields
            if (!string.IsNullOrEmpty(updateDto.AccountNumber))
                bankAccount.AccountNumber = updateDto.AccountNumber;

            if (!string.IsNullOrEmpty(updateDto.AccountType))
                bankAccount.AccountType = updateDto.AccountType;

            if (!string.IsNullOrEmpty(updateDto.CurrencyCode))
                bankAccount.CurrencyCode = updateDto.CurrencyCode;

            if (updateDto.Balance.HasValue)
                bankAccount.Balance = updateDto.Balance.Value;

            bankAccount.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return await GetBankAccountAsync(userId, bankAccountId);
        }

        public async Task<bool> DeleteBankAccountAsync(int userId, int bankAccountId)
        {
            var bankAccount = await _context.BankAccounts
                .FirstOrDefaultAsync(ba => ba.UserID == userId && ba.AccountID == bankAccountId);

            if (bankAccount == null)
                return false;

            // Check if account has any payments
            var hasPayments = await _context.Payments.AnyAsync(p => p.AccountID == bankAccountId);
            if (hasPayments)
                throw new InvalidOperationException("Cannot delete bank account with existing payments");

            _context.BankAccounts.Remove(bankAccount);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> IsAccountNumberAvailableAsync(string accountNumber)
        {
            return !await _context.BankAccounts.AnyAsync(ba => ba.AccountNumber == accountNumber);
        }
    }
}
