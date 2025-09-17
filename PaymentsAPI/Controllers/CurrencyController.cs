using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PaymentsAPI.Data;

namespace PaymentsAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CurrencyController : ControllerBase
    {
        private readonly PaymentsDbContext _context;

        public CurrencyController(PaymentsDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Get all currencies
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetCurrencies()
        {
            var currencies = await _context.Currencies
                .Select(c => new
                {
                    CurrencyCode = c.CurrencyCode,
                    CurrencyName = c.CurrencyName
                })
                .ToListAsync();

            return Ok(currencies);
        }

        /// <summary>
        /// Get a specific currency by code
        /// </summary>
        [HttpGet("{code}")]
        public async Task<ActionResult<object>> GetCurrency(string code)
        {
            var currency = await _context.Currencies
                .Where(c => c.CurrencyCode == code)
                .Select(c => new
                {
                    CurrencyCode = c.CurrencyCode,
                    CurrencyName = c.CurrencyName
                })
                .FirstOrDefaultAsync();

            if (currency == null)
            {
                return NotFound(new { message = "Currency not found" });
            }

            return Ok(currency);
        }
    }
}
