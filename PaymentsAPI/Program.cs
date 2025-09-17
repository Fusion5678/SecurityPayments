using Microsoft.EntityFrameworkCore;
using PaymentsAPI.Data;
using PaymentsAPI.Services;
using System.Text.RegularExpressions;

var builder = WebApplication.CreateBuilder(args);

// --------------------
// Add services to the container
// --------------------
builder.Services.AddControllers();

// Add Entity Framework
builder.Services.AddDbContext<PaymentsDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Add Authentication
builder.Services.AddAuthentication("Cookies")
    .AddCookie("Cookies", options =>
    {
        var authConfig = builder.Configuration.GetSection("Authentication:Cookie");
        options.LoginPath = authConfig["LoginPath"] ?? "/api/auth/login";
        options.LogoutPath = authConfig["LogoutPath"] ?? "/api/auth/logout";
        options.AccessDeniedPath = authConfig["AccessDeniedPath"] ?? "/api/auth/access-denied";
        options.ExpireTimeSpan = TimeSpan.FromHours(int.Parse(authConfig["ExpireHours"] ?? "24"));
        options.SlidingExpiration = true;
        options.Cookie.HttpOnly = bool.Parse(authConfig["HttpOnly"] ?? "true");
        options.Cookie.SecurePolicy = builder.Environment.IsDevelopment() 
            ? CookieSecurePolicy.None 
            : CookieSecurePolicy.Always; // enforce HTTPS in production
        options.Cookie.SameSite = builder.Environment.IsDevelopment() 
            ? SameSiteMode.Lax 
            : SameSiteMode.None; // allows cross-site cookies with HTTPS in production
        options.Cookie.Name = "PaymentsAuth"; // Set explicit cookie name
    });

// Add Authorization
builder.Services.AddAuthorization();

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("ReactFrontend", policy =>
    {
        if (builder.Environment.IsDevelopment())
        {
            // Local development origins
            policy.WithOrigins("http://localhost:3000", "https://localhost:3000", "http://localhost:3001", "https://localhost:3001")
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials();
        }
        else
        {
            // Production origins - configure these in Azure App Settings
            var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() 
                ?? new[] { "https://your-frontend-domain.azurewebsites.net" };
            
            policy.WithOrigins(allowedOrigins)
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials();
        }
    });
});

// Add HttpContextAccessor
builder.Services.AddHttpContextAccessor();

// Add Services
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IBankAccountService, BankAccountService>();
builder.Services.AddScoped<IPaymentService, PaymentService>();

// Add Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "Payments API", Version = "v1" });
});

var app = builder.Build();

// --------------------
// Configure the HTTP request pipeline
// --------------------
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Apply CORS FIRST (before any other middleware)
app.UseCors("ReactFrontend");

// Handle OPTIONS requests for CORS preflight BEFORE authentication
app.Use(async (context, next) =>
{
    if (context.Request.Method == "OPTIONS")
    {
        context.Response.StatusCode = 200;
        await context.Response.WriteAsync("");
        return;
    }
    await next();
});

// Enforce HTTPS
app.UseHttpsRedirection();

// Apply security headers globally
app.Use(async (context, next) =>
{
    // Prevent MIME sniffing
    context.Response.Headers.Add("X-Content-Type-Options", "nosniff");

    // XSS protection (older browsers, harmless to include)
    context.Response.Headers.Add("X-XSS-Protection", "1; mode=block");

    // HSTS (only effective if HTTPS is used)
    context.Response.Headers.Add("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");

    // Content Security Policy (restrict scripts/styles to self)
    context.Response.Headers.Add("Content-Security-Policy", "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';");

    // Referrer policy
    context.Response.Headers.Add("Referrer-Policy", "no-referrer");

    await next();
});

// Apply Authentication & Authorization
app.UseAuthentication();
app.UseAuthorization();

// Map controllers
app.MapControllers();

app.Run();
