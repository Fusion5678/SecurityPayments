using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PaymentsAPI.DTOs;
using PaymentsAPI.Services;
using System.Security.Claims;

namespace PaymentsAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PaymentController : ControllerBase
    {
        private readonly IPaymentService _paymentService;

        public PaymentController(IPaymentService paymentService)
        {
            _paymentService = paymentService;
        }

        /// <summary>
        /// Create a new payment
        /// </summary>
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<ActionResult<PaymentResponseDto>> CreatePayment([FromBody] PaymentCreateDto createDto)
        {
            try
            {
                var userId = GetCurrentUserId();
                var payment = await _paymentService.CreatePaymentAsync(userId, createDto);
                return CreatedAtAction(nameof(GetPayment), new { id = payment?.PaymentID }, payment);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Get all payments for the current user
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<PaymentResponseDto>>> GetPayments()
        {
            var userId = GetCurrentUserId();
            var payments = await _paymentService.GetUserPaymentsAsync(userId);
            return Ok(payments);
        }

        /// <summary>
        /// Get a specific payment by ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<PaymentResponseDto>> GetPayment(int id)
        {
            var userId = GetCurrentUserId();
            var payment = await _paymentService.GetPaymentAsync(userId, id);
            
            if (payment == null)
            {
                return NotFound(new { message = "Payment not found" });
            }

            return Ok(payment);
        }

        /// <summary>
        /// Get all payments (for employees and admins)
        /// </summary>
        [HttpGet("all")]
        [Authorize(Roles = "Employee,Admin")]
        public async Task<ActionResult<IEnumerable<PaymentResponseDto>>> GetAllPayments([FromQuery] string? status = null)
        {
            var payments = await _paymentService.GetAllPaymentsAsync(status);
            return Ok(payments);
        }

        /// <summary>
        /// Verify a payment (for employees)
        /// </summary>
        [HttpPost("{id}/verify")]
        [ValidateAntiForgeryToken]
        [Authorize(Roles = "Employee,Admin")]
        public async Task<IActionResult> VerifyPayment(int id, [FromBody] PaymentVerificationDto verificationDto)
        {
            try
            {
                var employeeId = GetCurrentUserId();
                var result = await _paymentService.VerifyPaymentAsync(id, employeeId, verificationDto.Action);
                
                if (!result)
                {
                    return NotFound(new { message = "Payment not found" });
                }

                return Ok(new { message = "Payment verified successfully" });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Submit a verified payment (for employees)
        /// </summary>
        [HttpPost("{id}/submit")]
        [ValidateAntiForgeryToken]
        [Authorize(Roles = "Employee,Admin")]
        public async Task<IActionResult> SubmitPayment(int id)
        {
            try
            {
                var employeeId = GetCurrentUserId();
                var result = await _paymentService.SubmitPaymentAsync(id, employeeId);
                
                if (!result)
                {
                    return NotFound(new { message = "Payment not found or cannot be submitted" });
                }

                return Ok(new { message = "Payment submitted successfully" });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Get payment statistics (for employees and admins)
        /// </summary>
        [HttpGet("statistics")]
        [Authorize(Roles = "Employee,Admin")]
        public async Task<ActionResult<PaymentStatisticsDto>> GetPaymentStatistics()
        {
            var statistics = await _paymentService.GetPaymentStatisticsAsync();
            return Ok(statistics);
        }

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
            {
                throw new UnauthorizedAccessException("User ID not found in claims");
            }
            return userId;
        }
    }

    public class PaymentVerificationDto
    {
        public string Action { get; set; } = null!; // "Verified" or "Rejected"
    }
}
