# Local Development Setup Guide

This guide will help you set up and run the Payments API project locally on your development machine.

## Prerequisites

Before starting, ensure you have the following installed:

- **.NET 7.0 SDK** - [Download here](https://dotnet.microsoft.com/download/dotnet/7.0)
- **Node.js 18+** - [Download here](https://nodejs.org/)
- **SQL Server** - Choose one:
  - **SQL Server LocalDB** (recommended for development) - Comes with Visual Studio
  - **SQL Server Express** - [Download here](https://www.microsoft.com/en-us/sql-server/sql-server-downloads)
  - **SQL Server Developer Edition** (free) - [Download here](https://www.microsoft.com/en-us/sql-server/sql-server-downloads)
- **Git** - [Download here](https://git-scm.com/)

## Step 1: Clone and Setup Project

### 1.1 Clone the Repository
```bash
git clone <your-repository-url>
cd "Yona Project"
```

### 1.2 Verify Prerequisites
```bash
# Check .NET version
dotnet --version
# Should show 7.0.x

# Check Node.js version
node --version
# Should show 18.x.x or higher

# Check npm version
npm --version
```

## Step 2: Backend Setup (PaymentsAPI)

### 2.1 Navigate to Backend Directory
```bash
cd PaymentsAPI
```

### 2.2 Restore Dependencies
```bash
dotnet restore
```

### 2.3 Configure Database Connection
Edit `appsettings.json` and update the connection string:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=PaymentsDB;Trusted_Connection=true;MultipleActiveResultSets=true"
  }
}
```

**Alternative connection strings:**
```json
// For SQL Server Express
"Server=.\\SQLEXPRESS;Database=PaymentsDB;Trusted_Connection=true;MultipleActiveResultSets=true"

// For SQL Server with specific instance
"Server=localhost\\SQLEXPRESS;Database=PaymentsDB;Trusted_Connection=true;MultipleActiveResultSets=true"
```

### 2.4 Install Entity Framework Tools (if not already installed)
```bash
dotnet tool install --global dotnet-ef
```

### 2.5 Create and Update Database
```bash
# Create initial migration (if not exists)
dotnet ef migrations add InitialCreate

# Update database
dotnet ef database update
```

### 2.6 Run the Backend
```bash
dotnet run
```

**Expected Output:**
```
info: Microsoft.Hosting.Lifetime[14]
      Now listening on: https://localhost:5001
info: Microsoft.Hosting.Lifetime[14]
      Now listening on: http://localhost:5000
info: Microsoft.Hosting.Lifetime[0]
      Application started. Press Ctrl+C to shut down.
```

The API will be available at:
- **HTTPS**: `https://localhost:5001`
- **HTTP**: `http://localhost:5000`

## Step 3: Frontend Setup (payments-frontend)

### 3.1 Navigate to Frontend Directory
```bash
cd ../payments-frontend
```

### 3.2 Install Dependencies
```bash
npm install
```

### 3.3 Create Local Environment File
```bash
# Copy the example environment file
cp .env.example .env.local
```

### 3.4 Configure Environment Variables
Edit `.env.local` with your local settings:

```env
# API Configuration
REACT_APP_API_BASE_URL=https://localhost:5001/api
REACT_APP_API_TIMEOUT=10000

# Environment
REACT_APP_ENVIRONMENT=development

# Feature Flags
REACT_APP_ENABLE_DEBUG=true
REACT_APP_ENABLE_ANALYTICS=false
```

**Note**: The `.env.development` file is already configured to use `https://localhost:5001/api` for local development.

### 3.5 Run the Frontend
```bash
npm start
```

**Expected Output:**
```
Compiled successfully!

You can now view payments-frontend in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.1.100:3000

Note that the development build is not optimized.
To create a production build, use npm run build.
```

The frontend will be available at: `http://localhost:3000`

## Step 4: Verify Setup

### 4.1 Test Backend API
Open a browser or use curl to test the API:

```bash
# Test API health (if you have a health endpoint)
curl https://localhost:5001/api/health

# Test currencies endpoint
curl https://localhost:5001/api/currency
```

### 4.2 Test Frontend
1. Open `http://localhost:3000` in your browser
2. You should see the login page
3. Try creating a new account or logging in

## Step 5: Development Workflow

### 5.1 Backend Development
```bash
cd PaymentsAPI

# Run with hot reload
dotnet watch run

# Add new migration after model changes
dotnet ef migrations add MigrationName

# Update database
dotnet ef database update

# Run tests
dotnet test
```

### 5.2 Frontend Development
```bash
cd payments-frontend

# Start development server with hot reload
npm start

# Run tests
npm test

# Run linting
npm run lint

# Build for production
npm run build
```

## Troubleshooting

### Common Issues

#### 1. Database Connection Issues
**Error**: `Cannot connect to database`

**Solutions**:
- Ensure SQL Server is running
- Check connection string in `appsettings.json`
- Try different connection string formats
- Install SQL Server LocalDB if using that option

#### 2. Port Already in Use
**Error**: `Port 5001 is already in use`

**Solutions**:
```bash
# Kill processes using the port
netstat -ano | findstr :5001
taskkill /PID <PID_NUMBER> /F

# Or use a different port
dotnet run --urls "https://localhost:5002"
```

#### 3. CORS Issues
**Error**: `CORS policy` errors in browser console

**Solutions**:
- Ensure backend is running on HTTPS (port 5001)
- Check CORS configuration in `Program.cs`
- Verify frontend is calling the correct API URL

#### 4. Frontend Build Issues
**Error**: `Module not found` or build failures

**Solutions**:
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check for TypeScript errors
npm run build
```

#### 5. Entity Framework Issues
**Error**: `dotnet ef` command not found

**Solutions**:
```bash
# Install EF tools globally
dotnet tool install --global dotnet-ef

# Or use locally
dotnet tool restore
dotnet ef --help
```

### Useful Commands

#### Backend Commands
```bash
# View all migrations
dotnet ef migrations list

# Remove last migration
dotnet ef migrations remove

# Generate SQL script
dotnet ef migrations script

# Update database to specific migration
dotnet ef database update MigrationName
```

#### Frontend Commands
```bash
# Install specific package
npm install package-name

# Update all dependencies
npm update

# Check for security vulnerabilities
npm audit

# Fix security issues
npm audit fix
```

## Development Tips

1. **Use Hot Reload**: Both `dotnet watch run` and `npm start` support hot reload
2. **Check Logs**: Monitor console output for errors and warnings
3. **Database Changes**: Always create migrations for model changes
4. **Environment Variables**: Use `.env.local` for local-specific settings
5. **API Testing**: Use tools like Postman or curl to test API endpoints
6. **Browser DevTools**: Use F12 to debug frontend issues

## Next Steps

Once local development is working:
1. Test all major features (login, payments, bank accounts)
2. Create some test data
3. Verify all API endpoints work
4. Test error handling and edge cases
5. Set up your IDE for better development experience
