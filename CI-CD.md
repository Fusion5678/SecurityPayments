# SecurityPayments CI/CD Pipeline Documentation

### 🚀 API Pipeline (api-ci.yml)

**Triggers**: Push/PR on master and dev, path filters for API files

**Steps**:
1. Restore and build .NET 8 Web API
2. Security Scans: TruffleHog (secrets), CodeQL (C#), NuGet audit
3. Publish artifacts
4. Deploy to Azure App Service → **API Production**
   - **API URL**: https://st10500143-payments.azurewebsites.net

### 🎨 Frontend Pipeline (frontend-ci.yml)

**Triggers**: Push/PR on master and dev, path filters for frontend files

**Steps**:
1. Install Node.js and dependencies (npm ci)
2. Security Scans: TruffleHog, npm audit, audit-ci
3. Lint with ESLint
4. Production build with Vite
5. Deploy to Azure App Service → **Payments Portal**
   - **Frontend URL**: https://st10500143-payments-portal.azurewebsites.net


### 🔐 Security Integration

- GitHub Secrets for publish profiles
- .env.ci for environment configuration
- Multiple scanners across backend & frontend
- Minimal permissions for Actions
- Security scan results logged in GitHub Security tab