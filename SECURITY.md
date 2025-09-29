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
- **Development**: Relaxed CORS origins, detailed logging, `AllowedHosts: "*"`
- **Production**: Restricted CORS origins, minimal logging, specific host restrictions
- **Kestrel HTTPS Configuration**: Explicit HTTPS endpoint binding

#### Production-Specific Security Configuration
- **AllowedHosts**: Restricted to `st10500143-payments.azurewebsites.net` (prevents host header attacks)
- **CORS Origins**: Limited to `https://st10500143-payments-portal.azurewebsites.net` only
- **Logging Security**: 
  - Default: Warning level (reduces information disclosure)
  - EF Core: Error level only (prevents SQL query exposure)
  - ASP.NET Core: Warning level (minimal framework logging)
- **Rate Limiting**: Stricter limits in production (60 global, 3 login, 2 registration per minute)
- **Cookie Security**: `SecurePolicy: "Always"` and `SameSite: "None"` for cross-origin
- **CSRF Security**: `SecurePolicy: "Always"` and `SameSite: "None"` for cross-origin
- **HSTS Configuration**: 1-year max-age with includeSubDomains and preload
- **CSP**: Maximum security policy with all sources set to 'none'

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
- **Development Limits**:
  - Login Protection: 5 attempts per minute per IP
  - Registration Protection: 3 attempts per minute per IP  
  - Global Protection: 100 requests per minute per IP
- **Production Limits** (Stricter):
  - Login Protection: 3 attempts per minute per IP
  - Registration Protection: 2 attempts per minute per IP
  - Global Protection: 60 requests per minute per IP
- **Built-in .NET Rate Limiter**: Production-ready, memory efficient
- **429 Too Many Requests**: Immediate rejection with no queuing

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
- **HTTPS Enforcement**: All traffic encrypted in transit
- **Kestrel Configuration**:
  - **Development**: HTTPS endpoint binding (`https://localhost:5001`)
  - **Production**: HTTP-only binding (port 8080) - Azure handles HTTPS termination
- **Protocol Downgrade Protection**: HSTS prevents HTTP downgrade attacks
- **TLS Configuration**: Modern TLS protocols (TLS 1.2+) enforced by Azure App Service
- **Perfect Forward Secrecy**: Azure App Service supports PFS for enhanced security

### SSL/TLS Certificate Management
- **Development Environment**: 
  - ASP.NET Core development certificate (self-signed) for localhost
  - Auto-generated by `dotnet dev-certs https`
  - Valid for localhost only
- **Production Environment**: 
  - Azure App Service SSL certificate (valid, trusted wildcard certificate)
  - Azure-managed wildcard certificate for `*.azurewebsites.net`
  - Automatic certificate renewal and management
- **Certificate Validation**: Valid end keys generated and used to serve web traffic over SSL
- **HTTPS Enforcement**: 
  - Development: `app.UseHttpsRedirection()` forces HTTPS
  - Production: Azure handles HTTPS redirection automatically
- **HSTS Configuration**: 
  - Max-age: 1 year (31,536,000 seconds)
  - IncludeSubDomains: Enabled
  - Preload: Enabled for HSTS preload list
- **Certificate Chain**: Full certificate chain validation with proper root CA trust

### Error Handling
- **Global Error Handling**: Centralized error processing in axios interceptors
- **Error Message Sanitization**: Generic error messages prevent information disclosure

## 5. Production Security Architecture

### Azure App Service Security
- **Managed SSL Certificates**: Azure-provided wildcard certificates for `*.azurewebsites.net`
- **HTTPS Enforcement**: Automatic HTTPS redirection handled by Azure infrastructure
- **Load Balancing**: Built-in Azure load balancer with DDoS protection
- **Network Security**: Azure network security groups and firewall rules

### Environment Isolation
- **Development Environment**:
  - Self-signed certificates for localhost
  - Relaxed CORS policies (`*` allowed hosts)
  - Detailed logging for debugging
  - Swagger UI enabled for API documentation
- **Production Environment**:
  - Valid SSL certificates with proper chain of trust
  - Strict CORS policies (single origin only)
  - Minimal logging to prevent information disclosure
  - Swagger UI disabled for security

### Cross-Origin Security
- **Frontend-Backend Communication**: 
  - Frontend: `https://st10500143-payments-portal.azurewebsites.net`
  - Backend: `https://st10500143-payments.azurewebsites.net`
  - Credentials: `withCredentials: true` for cookie-based authentication
- **SameSite Cookie Policy**: `SameSite: "None"` for cross-origin cookie sharing
- **Secure Cookie Policy**: `SecurePolicy: "Always"` for HTTPS-only cookies

### Information Security
- **Logging Strategy**:
  - Production: Warning level and above only
  - EF Core: Error level only (prevents SQL query logging)
  - No sensitive data in logs (passwords, tokens, personal information)
- **Error Handling**:
  - Generic error messages prevent information disclosure
  - No stack traces exposed to clients
  - Centralized error processing

### Infrastructure Security
- **Host Header Validation**: `AllowedHosts` restricts valid host headers
- **Request Size Limits**: Built-in ASP.NET Core request size limits
- **Timeout Protection**: Configurable request timeout limits
- **Memory Management**: Efficient rate limiting with no queuing

## 6. Threats Mitigated

By combining these measures, the system is protected against:

- **SQL Injection** → prevented by EF Core parameterized queries
- **Cross-Site Scripting (XSS)** → mitigated with input sanitization + CSP headers + X-XSS-Protection
- **Cross-Site Request Forgery (CSRF)** → mitigated with anti-forgery tokens + X-Requested-With headers
- **Session Hijacking** → mitigated by HttpOnly/Secure cookies, JWT expiration
- **Man-in-the-Middle (MITM)** → prevented by HTTPS + HSTS + protocol downgrade protection + valid SSL certificates
- **Unauthorized Access** → blocked by `[Authorize]` attributes + frontend route guards
- **Clickjacking** → prevented by CSP frame-ancestors 'none'
- **MIME Sniffing** → prevented by X-Content-Type-Options nosniff
- **Information Disclosure** → prevented by error message sanitization and no-referrer policy
- **Request Timeout Attacks** → prevented by configurable timeout limits
- **Network-based Attacks** → mitigated by CORS policies and credential management
- **Brute Force Attacks** → mitigated by rate limiting (5 login attempts/minute, 3 registration attempts/minute)
- **DDoS Attacks** → mitigated by global rate limiting (100 requests/minute per IP)

## 7. Conclusion

The Payments Project implements a comprehensive, defense-in-depth security architecture with production-grade protections across both backend and frontend. The system features:

### Multi-Layer Security Controls
- **Authentication & Authorization**: BCrypt password hashing, JWT tokens, secure cookies, and role-based access control
- **Transport Security**: HTTPS enforcement, HSTS headers, and valid SSL certificates in both development and production
- **Input Protection**: Parameterized queries, input validation, and sanitization at multiple layers
- **Cross-Site Protection**: CSRF tokens, CORS policies, and Content Security Policy headers
- **Rate Limiting**: Environment-specific rate limiting with stricter production controls
- **Infrastructure Security**: Azure App Service security, host header validation, and secure logging

### Production-Ready Security
- **Environment Isolation**: Separate security configurations for development and production
- **Azure Integration**: Managed SSL certificates, automatic HTTPS, and built-in DDoS protection
- **Information Security**: Minimal logging, generic error messages, and no sensitive data exposure
- **Cross-Origin Security**: Secure frontend-backend communication with proper cookie policies

The project is well-prepared to resist common web application attacks including SQL injection, XSS, CSRF, session hijacking, MITM attacks, and DDoS attempts, while safeguarding sensitive payment data in a production environment.
