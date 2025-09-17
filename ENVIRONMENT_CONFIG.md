# Environment Configuration Guide

This document explains how the application handles two environments: **Local** (for development) and **Production** (for Azure deployment).

## Configuration Files

### 1. `appsettings.json` (Base Configuration)
- **Purpose**: Default configuration for local development
- **Connection String**: LocalDB for local development
- **CORS**: Local development origins
- **Authentication**: Development-friendly settings

### 2. `appsettings.Production.json` (Production Override)
- **Purpose**: Overrides for production environment
- **Connection String**: Empty (must be set via environment variables)
- **CORS**: Empty array (must be set via environment variables)
- **Authentication**: Production security settings (SecurePolicy: Always, SameSite: None)

## Environment Variables

### Local Development
The application automatically uses `appsettings.json` when `ASPNETCORE_ENVIRONMENT=Development`.

**No additional environment variables needed** - everything is configured in the JSON files.

### Azure Production Environment
Set these environment variables in Azure App Service Configuration:

```json
{
  "ASPNETCORE_ENVIRONMENT": "Production",
  "ConnectionStrings__DefaultConnection": "Server=tcp:your-sql-server.database.windows.net,1433;Initial Catalog=PaymentsDB;Persist Security Info=False;User ID=your-username;Password=your-password;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;",
  "Cors__AllowedOrigins__0": "https://your-frontend-prod.azurewebsites.net"
}
```

## Configuration Priority

ASP.NET Core configuration follows this priority order (highest to lowest):

1. **Environment Variables** (highest priority)
2. **appsettings.Production.json** (when ASPNETCORE_ENVIRONMENT=Production)
3. **appsettings.json** (lowest priority)

## Key Configuration Differences

### Connection Strings

| Environment | Connection String Source | Database |
|-------------|-------------------------|----------|
| Local | `appsettings.json` | LocalDB |
| Azure Prod | Environment Variable | Azure SQL |

### CORS Origins

| Environment | Origins |
|-------------|---------|
| Local | localhost:3000, localhost:3001 (HTTP/HTTPS) |
| Azure Prod | Frontend prod URL only |

### Authentication Settings

| Environment | SecurePolicy | SameSite | HttpOnly |
|-------------|--------------|----------|----------|
| Local | None | Lax | true |
| Azure Prod | Always | None | true |

## How to Set Environment Variables in Azure

### Method 1: Azure Portal
1. Go to Azure Portal > App Service
2. Go to Configuration > Application settings
3. Add new application settings
4. Use double underscore `__` for nested configuration (e.g., `ConnectionStrings__DefaultConnection`)

### Method 2: Azure CLI
```bash
az webapp config appsettings set \
  --resource-group "PaymentsAPI-RG" \
  --name "payments-api-prod" \
  --settings \
    ASPNETCORE_ENVIRONMENT=Production \
    ConnectionStrings__DefaultConnection="your-connection-string" \
    Cors__AllowedOrigins__0="https://your-frontend-prod.azurewebsites.net"
```

## Frontend Environment Configuration

### Local Development
The `.env.development` file is already configured for local development:
```env
REACT_APP_API_BASE_URL=https://localhost:5001/api
REACT_APP_ENVIRONMENT=development
REACT_APP_ENABLE_DEBUG=true
```

**Note**: You can also create a `.env.local` file to override these settings if needed.

### Azure Production
Set in Azure App Service Configuration:
```json
{
  "REACT_APP_API_BASE_URL": "https://your-api-prod.azurewebsites.net/api",
  "REACT_APP_ENVIRONMENT": "production",
  "REACT_APP_ENABLE_DEBUG": "false"
}
```

## GitHub Secrets Required

### API Secrets
- `AZURE_APP_NAME_API_PROD` - Production API app name
- `AZURE_WEBAPP_PUBLISH_PROFILE_API_PROD` - Production API publish profile

### Frontend Secrets
- `AZURE_APP_NAME_FRONTEND_PROD` - Production frontend app name
- `AZURE_WEBAPP_PUBLISH_PROFILE_FRONTEND_PROD` - Production frontend publish profile

## Deployment Flow

### Local Development
1. Run backend: `dotnet run` (in PaymentsAPI directory)
2. Run frontend: `npm start` (in payments-frontend directory)
3. Access at: `http://localhost:3000`

### Production Deployment
1. Push code to `main` branch
2. GitHub Actions automatically:
   - Tests and builds both API and frontend
   - Deploys to Azure App Services
3. Access at: Your Azure App Service URLs

## Testing Configuration

### Verify Environment
Add this endpoint to test configuration:

```csharp
[HttpGet("config")]
public IActionResult GetConfig()
{
    return Ok(new
    {
        Environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT"),
        ConnectionString = _configuration.GetConnectionString("DefaultConnection")?.Substring(0, 20) + "...",
        CorsOrigins = _configuration.GetSection("Cors:AllowedOrigins").Get<string[]>(),
        CookieSecurePolicy = _configuration["Authentication:Cookie:SecurePolicy"]
    });
}
```

### Test URLs
- **Local**: `https://localhost:5001/api/config`
- **Azure Prod**: `https://your-api-prod.azurewebsites.net/api/config`

## Troubleshooting

### Common Issues

1. **Connection String Not Working**
   - Check environment variable name (use double underscore `__`)
   - Verify SQL Server firewall rules
   - Test connection string format

2. **CORS Issues**
   - Verify origins are correctly set
   - Check that frontend URL matches exactly
   - Ensure HTTPS is used in production

3. **Authentication Issues**
   - Check cookie settings for environment
   - Verify SameSite and SecurePolicy settings
   - Ensure HTTPS is used in production

4. **Environment Not Detected**
   - Verify `ASPNETCORE_ENVIRONMENT` is set correctly
   - Check that environment-specific appsettings files exist
   - Restart application after configuration changes

## Security Considerations

1. **Never commit sensitive data** to appsettings files
2. **Use Azure Key Vault** for production secrets
3. **Rotate connection strings** regularly
4. **Use managed identities** when possible
5. **Enable diagnostic logging** for security monitoring