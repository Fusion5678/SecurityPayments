# 🔑 GitHub Secrets Setup for Azure Deployment

## Required GitHub Secrets

Go to your GitHub repository → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

### 1. Production API Secrets

#### `AZURE_APP_NAME_API_PROD`
```
Value: payments-api-prod
Description: Name of your Azure App Service for production
```

#### `AZURE_WEBAPP_PUBLISH_PROFILE_API_PROD`
```
Value: [XML content from Azure App Service publish profile]
Description: Download from Azure Portal → App Service → Get publish profile
```

#### `SQL_CONNECTION_STRING`
```
Value: Server=tcp:payments-sql-server.database.windows.net,1433;Initial Catalog=PaymentsDB;Persist Security Info=False;User ID=paymentsadmin;Password=YourPassword;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;
Description: Connection string to your Azure SQL Database
```

#### `FRONTEND_URL`
```
Value: https://your-frontend-domain.azurestaticapps.net
Description: URL of your deployed frontend application
```


## How to Get Publish Profile

1. **Go to Azure Portal** → Your App Service
2. **Click "Get publish profile"** (downloads a .PublishSettings file)
3. **Open the file** in a text editor
4. **Copy the entire XML content**
5. **Paste as the secret value**

## How to Get Connection String

1. **Go to Azure Portal** → Your SQL Database
2. **Click "Connection strings"**
3. **Copy the "ADO.NET" connection string**
4. **Replace placeholders**:
   - `<username>` → `paymentsadmin`
   - `<password>` → Your SQL server password
5. **Paste as the secret value**

## Security Best Practices

- ✅ **Never commit secrets** to your repository
- ✅ **Rotate secrets** regularly
- ✅ **Use Azure Key Vault** for sensitive data in production
- ✅ **Limit access** to repository secrets

## Testing Your Setup

After adding all secrets:

1. **Push to main branch** to trigger production deployment
2. **Check GitHub Actions** for successful deployment
3. **Test your API endpoints** to ensure they're working

## Troubleshooting

### Common Issues:

#### "Secret not found" error
- **Check secret name** matches exactly (case-sensitive)
- **Verify secret exists** in repository settings
- **Ensure you're using** the correct repository

#### "Invalid publish profile" error
- **Re-download** the publish profile from Azure
- **Check file format** (should be XML)
- **Verify App Service name** matches

#### "Connection string invalid" error
- **Check SQL server** is accessible
- **Verify firewall rules** allow Azure services
- **Test connection** from Azure Portal

---

**🎯 Once all secrets are configured, your CI/CD pipeline will automatically deploy to Azure!**
