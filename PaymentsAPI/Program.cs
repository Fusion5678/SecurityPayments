using Microsoft.EntityFrameworkCore;
using PaymentsAPI.Data;
using PaymentsAPI.Services;
using System.Text.RegularExpressions;

// Global exception handler for startup
AppDomain.CurrentDomain.UnhandledException += (sender, e) =>
{
    Console.WriteLine($"UNHANDLED EXCEPTION: {e.ExceptionObject}");
    Console.WriteLine($"Is terminating: {e.IsTerminating}");
};

// Force console output immediately
Console.WriteLine("=== PAYMENTS API STARTUP (.NET 8) ===");
Console.WriteLine($"Environment: {Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Not Set"}");
Console.WriteLine($"WEBSITE_SITE_NAME: {Environment.GetEnvironmentVariable("WEBSITE_SITE_NAME") ?? "Not Set"}");
Console.WriteLine($"Current Directory: {Directory.GetCurrentDirectory()}");
Console.WriteLine($"Executing Assembly: {System.Reflection.Assembly.GetExecutingAssembly().Location}");

// Test basic functionality
Console.WriteLine("Testing basic operations...");
try 
{
    var test = "Hello World";
    Console.WriteLine($"Test string: {test}");
}
catch (Exception ex)
{
    Console.WriteLine($"Basic test failed: {ex.Message}");
}

try
{
    Console.WriteLine("Creating WebApplication builder...");
    var builder = WebApplication.CreateBuilder(args);
    Console.WriteLine("Builder created successfully");

    // Configure Kestrel for production - force HTTP only
    if (builder.Environment.IsProduction())
    {
        Console.WriteLine("Production environment detected - configuring Kestrel for HTTP only");
        builder.WebHost.ConfigureKestrel(options =>
        {
            options.ListenAnyIP(8080); // Only HTTP
            options.AddServerHeader = false; // Remove Server header for security
            // Do NOT call options.ListenAnyIP(443) or UseHttps()
        });
        Console.WriteLine("Kestrel configured for HTTP on port 8080 with security headers");
    }

    // Add logging to help diagnose startup issues
    Console.WriteLine("Configuring logging...");
    builder.Logging.ClearProviders();
    builder.Logging.AddConsole();
    builder.Logging.SetMinimumLevel(LogLevel.Debug);
    Console.WriteLine("Logging configured");

    Console.WriteLine("Starting application configuration...");

    // --------------------
    // Add services to the container
    // --------------------
    Console.WriteLine("Adding controllers and MVC...");
    builder.Services.AddControllers();
    builder.Services.AddMvc();

    // Add Entity Framework
    Console.WriteLine("Configuring Entity Framework...");
    try
    {
        var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
        Console.WriteLine($"Connection string: {connectionString}");
        builder.Services.AddDbContext<PaymentsDbContext>(options =>
            options.UseSqlServer(connectionString));
        Console.WriteLine("Entity Framework configured successfully");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Entity Framework configuration failed: {ex.Message}");
        throw;
    }

    // Add Authentication
    Console.WriteLine("Configuring Authentication...");
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
                "Strict" => SameSiteMode.Strict,
                "Lax" => SameSiteMode.Lax,
                "None" => SameSiteMode.None,
                _ => SameSiteMode.Strict
            };
            options.Cookie.Name = authConfig["Name"];
        });
    Console.WriteLine("Authentication configured successfully");

    // Add Authorization
    Console.WriteLine("Configuring Authorization...");
    builder.Services.AddAuthorization();

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
        "Strict" => SameSiteMode.Strict,
        "Lax" => SameSiteMode.Lax,
        _ => SameSiteMode.Strict
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
//if (app.Environment.IsDevelopment())
//{
    app.UseSwagger();
    app.UseSwaggerUI();
//}

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

// Map controllers
app.MapControllers();

// Add a simple health check endpoint that doesn't require any configuration
app.MapGet("/health", () => "OK");

app.MapGet("/", () => "Payments API is running");

    try
    {
        Console.WriteLine("Starting application...");
        app.Run();
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Application startup failed: {ex.Message}");
        Console.WriteLine($"Stack trace: {ex.StackTrace}");
        throw;
    }
}
catch (Exception ex)
{
    Console.WriteLine($"Application configuration failed: {ex.Message}");
    Console.WriteLine($"Stack trace: {ex.StackTrace}");
    throw;
}
