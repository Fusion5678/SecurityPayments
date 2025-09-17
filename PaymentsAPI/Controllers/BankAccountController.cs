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
    public class BankAccountController : ControllerBase
    {
        private readonly IBankAccountService _bankAccountService;

        public BankAccountController(IBankAccountService bankAccountService)
        {
            _bankAccountService = bankAccountService;
        }

        /// <summary>
        /// Create a new bank account for the current user
        /// </summary>
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<ActionResult<BankAccountResponseDto>> CreateBankAccount([FromBody] BankAccountCreateDto createDto)
        {
            try
            {
                var userId = GetCurrentUserId();
                var bankAccount = await _bankAccountService.CreateBankAccountAsync(userId, createDto);
                return CreatedAtAction(nameof(GetBankAccount), new { id = bankAccount?.AccountID }, bankAccount);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Get all bank accounts for the current user
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<BankAccountResponseDto>>> GetBankAccounts()
        {
            var userId = GetCurrentUserId();
            var bankAccounts = await _bankAccountService.GetUserBankAccountsAsync(userId);
            return Ok(bankAccounts);
        }

        /// <summary>
        /// Get a specific bank account by ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<BankAccountResponseDto>> GetBankAccount(int id)
        {
            var userId = GetCurrentUserId();
            var bankAccount = await _bankAccountService.GetBankAccountAsync(userId, id);
            
            if (bankAccount == null)
            {
                return NotFound(new { message = "Bank account not found" });
            }

            return Ok(bankAccount);
        }

        /// <summary>
        /// Update a bank account
        /// </summary>
        [HttpPut("{id}")]
        public async Task<ActionResult<BankAccountResponseDto>> UpdateBankAccount(int id, [FromBody] BankAccountUpdateDto updateDto)
        {
            try
            {
                var userId = GetCurrentUserId();
                var bankAccount = await _bankAccountService.UpdateBankAccountAsync(userId, id, updateDto);
                
                if (bankAccount == null)
                {
                    return NotFound(new { message = "Bank account not found" });
                }

                return Ok(bankAccount);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Delete a bank account
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBankAccount(int id)
        {
            try
            {
                var userId = GetCurrentUserId();
                var result = await _bankAccountService.DeleteBankAccountAsync(userId, id);
                
                if (!result)
                {
                    return NotFound(new { message = "Bank account not found" });
                }

                return NoContent();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Check if account number is available
        /// </summary>
        [HttpGet("check-account/{accountNumber}")]
        public async Task<ActionResult<object>> CheckAccountNumber(string accountNumber)
        {
            var isAvailable = await _bankAccountService.IsAccountNumberAvailableAsync(accountNumber);
            return Ok(new { available = isAvailable });
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
}
