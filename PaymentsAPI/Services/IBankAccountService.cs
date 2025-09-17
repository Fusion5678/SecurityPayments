using PaymentsAPI.DTOs;

namespace PaymentsAPI.Services
{
    public interface IBankAccountService
    {
        Task<BankAccountResponseDto?> CreateBankAccountAsync(int userId, BankAccountCreateDto createDto);
        Task<IEnumerable<BankAccountResponseDto>> GetUserBankAccountsAsync(int userId);
        Task<BankAccountResponseDto?> GetBankAccountAsync(int userId, int bankAccountId);
        Task<BankAccountResponseDto?> UpdateBankAccountAsync(int userId, int bankAccountId, BankAccountUpdateDto updateDto);
        Task<bool> DeleteBankAccountAsync(int userId, int bankAccountId);
        Task<bool> IsAccountNumberAvailableAsync(string accountNumber);
    }
}
