using Microsoft.EntityFrameworkCore;
using PaymentsAPI.Data;
using PaymentsAPI.Services;
using System.Text.RegularExpressions;

var builder = WebApplication.CreateBuilder(args);

// --------------------
// Add services to the container
// --------------------
builder.Services.AddControllers();
builder.Services.AddMvc();

// Add Entity Framework
builder.Services.AddDbContext<PaymentsDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

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
            "Strict" => SameSiteMode.Strict,
            "Lax" => SameSiteMode.Lax,
            "None" => SameSiteMode.None,
            _ => SameSiteMode.Strict
        };
        options.Cookie.Name = authConfig["Name"];
    });

// Add Authorization
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

   // app.UseHttpsRedirection();

// Apply security headers globally
app.Use(async (context, next) =>
{
    var securityConfig = app.Configuration.GetSection("Security");
    
    // Prevent MIME sniffing
    context.Response.Headers.Add("X-Content-Type-Options", "nosniff");

    // XSS protection (older browsers, harmless to include)
    context.Response.Headers.Add("X-XSS-Protection", "1; mode=block");

    // Add HSTS (HTTP Strict Transport Security) header to enforce HTTPS and protect against protocol downgrade attacks
    var hstsMaxAge = securityConfig["HstsMaxAge"];
    var includeSubDomains = securityConfig["HstsIncludeSubDomains"];
    var preload = securityConfig["HstsPreload"];

    var hstsValue = $"max-age={hstsMaxAge}";
    if (includeSubDomains == "true") hstsValue += "; includeSubDomains";
    if (preload == "true") hstsValue += "; preload";

    context.Response.Headers.Add("Strict-Transport-Security", hstsValue);   

    // Content Security Policy
    var csp = securityConfig["ContentSecurityPolicy"];
    context.Response.Headers.Add("Content-Security-Policy", csp);

    // Referrer policy
    var referrerPolicy = securityConfig["ReferrerPolicy"];
    context.Response.Headers.Add("Referrer-Policy", referrerPolicy);

    await next();
});

// Apply Authentication & Authorization
app.UseAuthentication();
app.UseAuthorization();

// Map controllers
app.MapControllers();

app.Run();
