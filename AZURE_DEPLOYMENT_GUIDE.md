# 🚀 Azure Deployment Guide for SecurityPayments API

## 📋 Prerequisites

### Required Accounts & Tools:
- ✅ Azure subscription (free tier available)
- ✅ GitHub account
- ✅ Visual Studio Code or any code editor
- ✅ Git installed locally

### What You'll Deploy:
- **Backend API**: .NET 7 Web API (PaymentsAPI)
- **Database**: Azure SQL Database
- **Hosting**: Azure App Service

---

## 🏗️ Step 1: Create Azure Resources (Using Azure Portal)

### 1.1 Create Resource Group

1. **Go to Azure Portal**: https://portal.azure.com
2. **Click "Create a resource"** → Search for "Resource group"
3. **Fill in details**:
   - **Resource group name**: `payments-rg`
   - **Region**: Choose closest to your users (e.g., "East US")
   - **Click "Review + create"** → **"Create"**

### 1.2 Create App Service Plan

1. **Click "Create a resource"** → Search for "App Service Plan"
2. **Fill in details**:
   - **Resource group**: Select `payments-rg`
   - **Name**: `payments-app-plan`
   - **Operating System**: Linux
   - **Region**: Same as resource group
   - **Pricing tier**: B1 (Basic) - $13.14/month
   - **Click "Review + create"** → **"Create"**

### 1.3 Create App Service (Web App)

1. **Click "Create a resource"** → Search for "Web App"
2. **Fill in details**:
   - **Resource group**: Select `payments-rg`
   - **Name**: `payments-api-prod` (must be globally unique)
   - **Runtime stack**: .NET 7
   - **Operating System**: Linux
   - **Region**: Same as resource group
   - **App Service Plan**: Select `payments-app-plan`
   - **Click "Review + create"** → **"Create"**

### 1.4 Create SQL Server

1. **Click "Create a resource"** → Search for "SQL server"
2. **Fill in details**:
   - **Resource group**: Select `payments-rg`
   - **Server name**: `payments-sql-server` (must be globally unique)
   - **Location**: Same as resource group
   - **Authentication method**: Use SQL authentication
   - **Server admin login**: `paymentsadmin`
   - **Password**: Create a strong password (save this!)
   - **Click "Review + create"** → **"Create"**

### 1.5 Create SQL Database

1. **Click "Create a resource"** → Search for "SQL database"
2. **Fill in details**:
   - **Resource group**: Select `payments-rg`
   - **Database name**: `PaymentsDB`
   - **Server**: Select `payments-sql-server`
   - **Want to use SQL elastic pool**: No
   - **Compute + storage**: Basic (5 DTUs, 2 GB)
   - **Click "Review + create"** → **"Create"**

### 1.6 Configure SQL Server Firewall

1. **Go to your SQL server** (`payments-sql-server`)
2. **Click "Networking"** in the left menu
3. **Under "Firewall rules"**:
   - **Click "Add a firewall rule"**
   - **Rule name**: `AllowAzureServices`
   - **Start IP**: `0.0.0.0`
   - **End IP**: `0.0.0.0`
   - **Click "Save"**

---

## 🔧 Step 2: Configure App Service

### 2.1 Get Connection String

1. **Go to your SQL database** (`PaymentsDB`)
2. **Click "Connection strings"** in the left menu
3. **Copy the "ADO.NET" connection string**
4. **Replace placeholders**:
   - Replace `<username>` with `paymentsadmin`
   - Replace `<password>` with your SQL server password
   - **Save this connection string** - you'll need it!

### 2.2 Configure App Service Settings

1. **Go to your App Service** (`payments-api-prod`)
2. **Click "Configuration"** in the left menu
3. **Click "New application setting"** and add these:

#### Required Settings:
```
Name: ASPNETCORE_ENVIRONMENT
Value: Production

Name: ConnectionStrings__DefaultConnection
Value: [Your connection string from step 2.1]

Name: Cors__AllowedOrigins__0
Value: https://your-frontend-domain.azurestaticapps.net
```

4. **Click "Save"** after adding each setting
5. **Click "Continue"** when prompted

### 2.3 Get Deployment Credentials

1. **In your App Service**, click "Deployment Center" in the left menu
2. **Click "Local Git"** tab
3. **Click "Save"** to enable local Git deployment
4. **Copy the Git clone URL** - you'll need this for GitHub Actions

---

## 🔑 Step 3: Configure GitHub Secrets

### 3.1 Go to GitHub Repository

1. **Go to your GitHub repository**
2. **Click "Settings"** tab
3. **Click "Secrets and variables"** → **"Actions"**

### 3.2 Add Required Secrets

Click **"New repository secret"** for each:

#### Secret 1: App Service Name
```
Name: AZURE_APP_NAME_API_PROD
Value: payments-api-prod
```

#### Secret 2: Publish Profile
```
Name: AZURE_WEBAPP_PUBLISH_PROFILE_API_PROD
Value: [Get this from App Service - see step 3.3]
```

### 3.3 Get Publish Profile

1. **Go to your App Service** in Azure Portal
2. **Click "Get publish profile"** (downloads a file)
3. **Open the downloaded file** in a text editor
4. **Copy the entire XML content**
5. **Paste it as the value** for `AZURE_WEBAPP_PUBLISH_PROFILE_API_PROD`

---

## 🚀 Step 4: Deploy Using GitHub Actions

### 4.1 Push Your Code

1. **Commit your changes**:
   ```bash
   git add .
   git commit -m "Add Azure deployment configuration"
   git push origin main
   ```

2. **Go to GitHub** → **"Actions"** tab
3. **Watch the deployment** - it should start automatically

### 4.2 Monitor Deployment

1. **Click on the running workflow**
2. **Check each step** for any errors
3. **If successful**, you'll see "Deploy to Azure App Service" complete

---

## 🗄️ Step 5: Set Up Database

### 5.1 Connect to App Service

1. **Go to your App Service** in Azure Portal
2. **Click "SSH"** in the left menu
3. **Click "Go"** to open SSH session

### 5.2 Run Database Migrations

In the SSH terminal, run:
```bash
cd /home/site/wwwroot
dotnet ef database update
```

**Note**: If you get an error about Entity Framework tools, you may need to install them first:
```bash
dotnet tool install --global dotnet-ef
```

---

## ✅ Step 6: Test Your Deployment

### 6.1 Test API Endpoints

1. **Go to your App Service** in Azure Portal
2. **Copy the URL** (e.g., `https://payments-api-prod.azurewebsites.net`)
3. **Test these endpoints**:
   - `https://your-app-url/api/auth/csrf-token`
   - `https://your-app-url/swagger` (if enabled)

### 6.2 Update Frontend Configuration

1. **Update your frontend** `.env.production` file:
   ```
   VITE_API_BASE_URL=https://payments-api-prod.azurewebsites.net/api
   ```

2. **Deploy your frontend** to Azure Static Web Apps

---

## 🔧 Step 7: Configure Custom Domain (Optional)

### 7.1 Add Custom Domain

1. **Go to your App Service**
2. **Click "Custom domains"** in the left menu
3. **Click "Add custom domain"**
4. **Enter your domain** (e.g., `api.yourdomain.com`)
5. **Follow the DNS configuration** instructions

### 7.2 Update CORS Settings

1. **Go to App Service** → **"Configuration"**
2. **Update the CORS setting**:
   ```
   Name: Cors__AllowedOrigins__0
   Value: https://yourdomain.com
   ```

---

## 🚨 Troubleshooting

### Common Issues:

#### 1. Deployment Fails
- **Check GitHub Actions logs** for specific errors
- **Verify all secrets** are correctly set
- **Ensure App Service name** is globally unique

#### 2. Database Connection Issues
- **Verify connection string** is correct
- **Check SQL Server firewall** rules
- **Ensure database exists** and is accessible

#### 3. CORS Errors
- **Update CORS origins** in App Service configuration
- **Include both HTTP and HTTPS** if needed
- **Check frontend URL** matches CORS settings

#### 4. Authentication Issues
- **Verify environment** is set to "Production"
- **Check cookie settings** in appsettings.Production.json
- **Ensure HTTPS** is properly configured

---

## 📊 Monitoring & Maintenance

### 7.1 Enable Application Insights

1. **Go to your App Service**
2. **Click "Application Insights"** in the left menu
3. **Click "Turn on Application Insights"**
4. **Create new resource** or use existing
5. **Click "Apply"**

### 7.2 Set Up Alerts

1. **Go to "Alerts"** in Azure Portal
2. **Click "Create"** → **"Alert rule"**
3. **Configure alerts** for:
   - High CPU usage
   - Memory usage
   - Failed requests
   - Response time

### 7.3 Backup Strategy

1. **Go to your SQL Database**
2. **Click "Backups"** in the left menu
3. **Configure automated backups**
4. **Set retention period** (7-35 days)

---

## 💰 Cost Optimization

### Estimated Monthly Costs:
- **App Service Plan (B1)**: ~$13.14
- **SQL Database (Basic)**: ~$4.99
- **Total**: ~$18.13/month

### Cost-Saving Tips:
- **Use Basic tier** for development
- **Scale down** during non-business hours
- **Monitor usage** with Azure Cost Management
- **Use Azure credits** if available

---

## 🎯 Next Steps

1. **Set up CI/CD** for automatic deployments
2. **Configure monitoring** and alerts
3. **Implement backup** strategies
4. **Set up staging** environment
5. **Configure custom domains**
6. **Implement security** best practices

---

## 📞 Support

If you encounter issues:
1. **Check Azure Service Health** for outages
2. **Review Azure documentation** for your specific service
3. **Use Azure Support** (if you have a support plan)
4. **Check GitHub Issues** for similar problems

---

**🎉 Congratulations! Your SecurityPayments API is now deployed to Azure!**
