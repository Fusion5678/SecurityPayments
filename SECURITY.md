# Security Implementation Guide

## CSRF Protection

### Backend Implementation
- **Antiforgery Service**: Configured in `Program.cs` with secure cookie settings
- **CSRF Token Endpoint**: `/api/auth/csrf-token` provides tokens for state-changing requests
- **ValidateAntiForgeryToken**: Applied to all state-changing endpoints (POST/PUT/PATCH/DELETE)
- **Automatic Token Injection**: Frontend automatically includes CSRF tokens in state-changing requests

### Frontend Implementation
- **Axios Interceptor**: Automatically fetches and includes CSRF tokens
- **Header Name**: `X-CSRF-TOKEN`
- **Cookie Name**: `CSRF-TOKEN`

## Content Security Policy (CSP)

### Development
```http
Content-Security-Policy: default-src 'self' 'unsafe-inline' 'unsafe-eval';
```

### Production
```http
Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-{NONCE}'; style-src 'self' 'nonce-{NONCE}'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'
```

## Security Headers

- **X-Content-Type-Options**: `nosniff`
- **X-XSS-Protection**: `1; mode=block`
- **Strict-Transport-Security**: `max-age=31536000; includeSubDomains; preload` (production only)
- **Referrer-Policy**: `no-referrer`

## Cookie Security

- **HttpOnly**: `true` (prevents JavaScript access)
- **Secure**: `Always` (HTTPS only)
- **SameSite**: `Lax` (allows same domain, different ports)
- **Authentication Cookie**: `PaymentsAuth`
- **CSRF Cookie**: `CSRF-TOKEN`

## Secrets Management

### Configuration Files
- **Template**: `appsettings.Template.json` (safe to commit)
- **Development**: `appsettings.json` (contains local settings)
- **Production**: `appsettings.Production.json` (empty secrets, use environment variables)

### Environment Variables
- Use Azure App Settings or environment variables for production secrets
- Never commit sensitive data to version control
- `.gitignore` properly excludes sensitive configuration files

## CORS Configuration

### Development
```csharp
policy.WithOrigins("http://localhost:3000", "https://localhost:3000", "http://localhost:3001", "https://localhost:3001")
      .AllowAnyHeader()
      .AllowAnyMethod()
      .AllowCredentials();
```

### Production
Configure allowed origins via `Cors:AllowedOrigins` in appsettings.

## Best Practices

1. **Always use HTTPS** in production
2. **Validate all inputs** on both client and server
3. **Use parameterized queries** to prevent SQL injection
4. **Implement rate limiting** for authentication endpoints
5. **Regular security audits** and dependency updates
6. **Monitor for suspicious activity**
7. **Use strong password policies**
8. **Implement proper session management**
