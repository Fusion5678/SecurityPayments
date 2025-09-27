using Microsoft.EntityFrameworkCore;
using PaymentsAPI.Data;
using PaymentsAPI.Services;
using System.Text.RegularExpressions;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.RateLimiting;

var builder = WebApplication.CreateBuilder(args);

// Configure Kestrel for production - force HTTP only
if (builder.Environment.IsProduction())
{
    builder.WebHost.ConfigureKestrel(options =>
    {
        options.ListenAnyIP(8080); // Only HTTP
        options.AddServerHeader = false; // Remove Server header for security
    });
}

// Configure logging for production
builder.Logging.ClearProviders();
builder.Logging.AddConsole();
if (builder.Environment.IsProduction())
{
    builder.Logging.SetMinimumLevel(LogLevel.Warning);
}
else
{
    builder.Logging.SetMinimumLevel(LogLevel.Information);
}

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddMvc();

// Add Entity Framework
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<PaymentsDbContext>(options =>
    options.UseSqlServer(connectionString));

// Add Authentication
builder.Services.AddAuthentication("Cookies")
        .AddCookie("Cookies", options =>
        {
            var authConfig = builder.Configuration.GetSection("Authentication:Cookie");
            options.LoginPath = authConfig["LoginPath"];
            options.LogoutPath = authConfig["LogoutPath"];
            options.AccessDeniedPath = authConfig["AccessDeniedPath"];
            options.ExpireTimeSpan = TimeSpan.FromHours(int.Parse(authConfig["ExpireHours"]));
            options.SlidingExpiration = true;
            options.Cookie.HttpOnly = bool.Parse(authConfig["HttpOnly"]);
            options.Cookie.SecurePolicy = authConfig["SecurePolicy"] switch
            {
                "Always" => CookieSecurePolicy.Always,
                "SameAsRequest" => CookieSecurePolicy.SameAsRequest,
                _ => CookieSecurePolicy.Always
            };
            options.Cookie.SameSite = authConfig["SameSite"] switch
            {
                "None" => SameSiteMode.None,
                "Lax" => SameSiteMode.Lax,
                "Strict" => SameSiteMode.Strict,
                _ => SameSiteMode.None
            };
            options.Cookie.Name = authConfig["Name"];
        });

// Add Authorization
builder.Services.AddAuthorization();

// Add Rate Limiting
builder.Services.AddRateLimiter(rateLimiterOptions =>
{
    // Global rate limiting for all requests
    rateLimiterOptions.AddFixedWindowLimiter("GlobalLimiter", options =>
    {
        options.PermitLimit = 100; // 100 requests per minute per IP
        options.Window = TimeSpan.FromMinutes(1);
        options.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
        options.QueueLimit = 0; // No queuing - reject immediately
    });
    
    // Strict rate limiting for authentication endpoints
    rateLimiterOptions.AddFixedWindowLimiter("AuthLimiter", options =>
    {
        options.PermitLimit = 5; // 5 login attempts per minute per IP
        options.Window = TimeSpan.FromMinutes(1);
        options.QueueLimit = 0; // No queuing - reject immediately
    });
    
    // Moderate rate limiting for registration
    rateLimiterOptions.AddFixedWindowLimiter("RegisterLimiter", options =>
    {
        options.PermitLimit = 3; // 3 registration attempts per minute per IP
        options.Window = TimeSpan.FromMinutes(1);
        options.QueueLimit = 0;
    });

    // Configure rejection response
    rateLimiterOptions.RejectionStatusCode = 429; // Too Many Requests
    rateLimiterOptions.OnRejected = async (context, token) =>
    {
        context.HttpContext.Response.StatusCode = 429;
        await context.HttpContext.Response.WriteAsync("Too many requests. Please try again later.", cancellationToken: token);
    };
});

// Add CSRF Protection
builder.Services.AddAntiforgery(options =>
{
    var csrfConfig = builder.Configuration.GetSection("CSRF");
    options.HeaderName = csrfConfig["HeaderName"];
    options.Cookie.Name = csrfConfig["CookieName"];
    options.Cookie.HttpOnly = bool.Parse(csrfConfig["HttpOnly"]);
    options.Cookie.SecurePolicy = csrfConfig["SecurePolicy"] switch
    {
        "Always" => CookieSecurePolicy.Always,
        "SameAsRequest" => CookieSecurePolicy.SameAsRequest,
        _ => CookieSecurePolicy.Always
    };
    options.Cookie.SameSite = csrfConfig["SameSite"] switch
    {
        "None" => SameSiteMode.None,
        "Lax" => SameSiteMode.Lax,
        "Strict" => SameSiteMode.Strict,
        _ => SameSiteMode.None
    };
});

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("ReactFrontend", policy =>
    {
        var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>();
        
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
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

// Enforce HTTPS redirection (skip on Azure App Service Linux)
if (!app.Environment.IsProduction())
{
  app.UseHttpsRedirection();
}

// Apply production-grade security headers globally
app.Use(async (context, next) =>
{
    var securityConfig = app.Configuration.GetSection("Security");
    
    // Generate unique nonce per request for CSP
    var nonce = Convert.ToBase64String(System.Security.Cryptography.RandomNumberGenerator.GetBytes(32));
    context.Items["csp-nonce"] = nonce;
    
    // Prevent MIME sniffing
    context.Response.Headers.Add("X-Content-Type-Options", "nosniff");

    // XSS protection (older browsers, harmless to include)
    context.Response.Headers.Add("X-XSS-Protection", "1; mode=block");

    // Frame options (prevent clickjacking)
    context.Response.Headers.Add("X-Frame-Options", "DENY");

    // Add HSTS (HTTP Strict Transport Security) header to enforce HTTPS and protect against protocol downgrade attacks
    var hstsMaxAge = securityConfig["HstsMaxAge"];
    var includeSubDomains = securityConfig["HstsIncludeSubDomains"];
    var preload = securityConfig["HstsPreload"];

    var hstsValue = $"max-age={hstsMaxAge}";
    if (includeSubDomains == "true") hstsValue += "; includeSubDomains";
    if (preload == "true") hstsValue += "; preload";

    context.Response.Headers.Add("Strict-Transport-Security", hstsValue);   

    // Content Security Policy - maximum security for JSON API
    var cspTemplate = securityConfig["ContentSecurityPolicy"];
    var csp = cspTemplate?.Replace("{NONCE}", nonce) ?? 
              $"default-src 'none'; script-src 'none'; style-src 'none'; img-src 'none'; font-src 'none'; connect-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'; object-src 'none'; media-src 'none'; child-src 'none'";
    context.Response.Headers.Add("Content-Security-Policy", csp);

    // Permissions Policy - restrict dangerous APIs
    context.Response.Headers.Add("Permissions-Policy", 
        "geolocation=(), camera=(), microphone=(), payment=(), usb=(), magnetometer=(), gyroscope=(), speaker=(), vibrate=(), fullscreen=(self), sync-xhr=()");

    // Referrer policy
    var referrerPolicy = securityConfig["ReferrerPolicy"];
    context.Response.Headers.Add("Referrer-Policy", referrerPolicy);

    // Cross-Origin policies (more permissive in development)
    if (app.Environment.IsProduction())
    {
        context.Response.Headers.Add("Cross-Origin-Embedder-Policy", "require-corp");
        context.Response.Headers.Add("Cross-Origin-Opener-Policy", "same-origin");
        context.Response.Headers.Add("Cross-Origin-Resource-Policy", "same-origin");
    }

    await next();
});

// Apply Authentication & Authorization
app.UseAuthentication();
app.UseAuthorization();

// Add Rate Limiting (after authentication to avoid conflicts)
app.UseRateLimiter();

// Map controllers
app.MapControllers();

// Add a simple health check endpoint that doesn't require any configuration
app.MapGet("/health", () => "OK");

app.MapGet("/", () => "Payments API is running");

app.Run();
