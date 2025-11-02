using PaymentsAPI.DTOs;

namespace PaymentsAPI.Services
{
    public interface IPaymentService
    {
        Task<PaymentResponseDto?> CreatePaymentAsync(int userId, PaymentCreateDto createDto);
        Task<IEnumerable<PaymentResponseDto>> GetUserPaymentsAsync(int userId);
        Task<PaymentResponseDto?> GetPaymentAsync(int userId, int paymentId);
        Task<bool> VerifyPaymentAsync(int paymentId, int employeeId, string action);
        Task<IEnumerable<PaymentResponseDto>> GetAllPaymentsAsync(string? status = null);
        Task<bool> SubmitPaymentAsync(int paymentId, int employeeId);
        Task<PaymentStatisticsDto> GetPaymentStatisticsAsync();
    }
}
