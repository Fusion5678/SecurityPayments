# Payments Project – Security Report

> **Note:** This report describes the security measures currently implemented. It is not a final draft.

This report provides an overview of the security architecture and protections implemented across the Payments API (backend) and the Payments Frontend. The goal is to demonstrate how the system defends against common web application threats such as SQL injection, XSS, CSRF, and unauthorized access.

## 1. Backend Security

The backend (ASP.NET Core API) implements multi-layered security controls:

### Program.cs
- Enforces cookie security policies: **HttpOnly**, **Secure**
- Security middleware:
  - HTTPS redirection (production only)
  - CORS policies (restricted origins for dev vs production)
  - Security headers: HSTS, CSP, X-Content-Type-Options, X-XSS-Protection, Referrer-Policy
- Handles CORS preflight OPTIONS requests securely
- Sliding expiration for authentication cookies

### Services/AuthService.cs
- **BCrypt** password hashing
- JWT token generation and validation
- Secure authentication cookie management

### Controllers/AuthController.cs
- Anti-forgery token validation (`[ValidateAntiForgeryToken]`)
- CSRF token endpoint for frontend integration
- `[Authorize]` attributes on protected endpoints

### Data/PaymentsDbContext.cs
- **Entity Framework Core** parameterized queries prevent SQL injection

### appsettings.json & appsettings.Production.json
- Store JWT secrets, cookie expiration settings, and authentication configuration
- Environment-specific security configurations (production vs local dev)
- **Development**: Relaxed CORS origins, detailed logging
- **Production**: Restricted CORS origins, minimal logging
- **Kestrel HTTPS Configuration**: Explicit HTTPS endpoint binding

## 2. Frontend Security

The React frontend enforces input validation, token management, and route protection:

### utils/validation.ts
- Regex validation for emails, passwords, and IDs
- Input sanitization before API submission

### api/axiosConfig.ts
- JWT token attachment and CSRF token management
- Security headers (`X-Requested-With: XMLHttpRequest`)
- Request timeout protection and global error handling
- **Method-Specific CSRF**: Only state-changing methods require CSRF tokens
- **Credential Management**: Automatic cookie handling with `withCredentials`

### components/ProtectedRoute.tsx
- Route protection with authentication checks

### context/AuthContext.tsx
- Global authentication state management
- **Automatic Authentication Check**: Validates auth state on app load
- **Graceful Logout Handling**: Server logout failures don't prevent local state clearing
- **Registration vs Login Separation**: Users must explicitly login after registration

## 3. Form Security

User input is validated at both frontend and backend layers:

### pages/RegisterPage.tsx
- Client-side input validation and sanitization


### pages/LoginPage.tsx
- Validates login credentials with regex rules
- **Input Sanitization Integration**: All form inputs are sanitized before processing

## 4. Key Security Protections

The project implements a defense-in-depth approach, including:

### Authentication & Session Security
- **BCrypt** password hashing
- JWT tokens with expiration
- **HttpOnly**, **Secure** cookies
- Sliding expiration for persistent sessions

### Input Validation & Sanitization
- Regex validation on email, password, and IDs
- Client-side and server-side validation

### CSRF Protection
- Anti-forgery tokens validated on state-changing endpoints
- CSRF token endpoint for frontend integration

### CORS Security
- Environment-specific origin restrictions
- Secure preflight OPTIONS request handling

### Database Security
- EF Core parameterized queries prevent SQL injection
- **SQL Connection Encryption**: Encrypted with azure

### Rate Limiting
- **Login Protection**: 5 attempts per minute per IP (3 in production)
- **Registration Protection**: 3 attempts per minute per IP (2 in production)  
- **Global Protection**: 100 requests per minute per IP (60 in production)
- **Built-in .NET Rate Limiter**: Production-ready, memory efficient

### Security Headers
- **HSTS**: HTTP Strict Transport Security with configurable max-age, subdomains, and preload
- **CSP**: Content Security Policy with nonce-based sources and frame-ancestors 'none'
- **Referrer-Policy**: no-referrer policy
- **X-Content-Type-Options**: nosniff to prevent MIME sniffing
- **X-XSS-Protection**: XSS filtering for older browsers
- **X-Requested-With**: CSRF protection indicator

### Route Protection
- `[Authorize]` attributes in backend
- Protected routes in frontend

### Transport Security
- HTTPS enforced in production with HSTS
- **Kestrel HTTPS Binding**: Explicit HTTPS endpoint configuration
- **Protocol Downgrade Protection**: HSTS prevents HTTP downgrade attacks

### Error Handling
- **Global Error Handling**: Centralized error processing in axios interceptors
- **Error Message Sanitization**: Generic error messages prevent information disclosure


## 5. Threats Mitigated

By combining these measures, the system is protected against:

- **SQL Injection** → prevented by EF Core parameterized queries
- **Cross-Site Scripting (XSS)** → mitigated with input sanitization + CSP headers + X-XSS-Protection
- **Cross-Site Request Forgery (CSRF)** → mitigated with anti-forgery tokens + X-Requested-With headers
- **Session Hijacking** → mitigated by HttpOnly/Secure cookies, JWT expiration
- **Man-in-the-Middle (MITM)** → prevented by HTTPS + HSTS + protocol downgrade protection
- **Unauthorized Access** → blocked by `[Authorize]` attributes + frontend route guards
- **Clickjacking** → prevented by CSP frame-ancestors 'none'
- **MIME Sniffing** → prevented by X-Content-Type-Options nosniff
- **Information Disclosure** → prevented by error message sanitization and no-referrer policy
- **Request Timeout Attacks** → prevented by configurable timeout limits
- **Network-based Attacks** → mitigated by CORS policies and credential management
- **Brute Force Attacks** → mitigated by rate limiting (5 login attempts/minute, 3 registration attempts/minute)
- **DDoS Attacks** → mitigated by global rate limiting (100 requests/minute per IP)

## 6. Conclusion

The Payments Project has a robust security architecture with layered protections across both backend and frontend. From password hashing and JWT-based authentication to CSRF tokens, CORS policies, secure cookies, and security headers, the project is well-prepared to resist common web application attacks and safeguard sensitive payment data.
