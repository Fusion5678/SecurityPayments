# Payments API Project

A full-stack payment management system built with .NET Core Web API backend and React frontend.

## Project Structure

```
Yona Project/
├── PaymentsAPI/                 # .NET Core Web API Backend
│   ├── Controllers/            # API Controllers
│   ├── Models/                 # Entity Models
│   ├── DTOs/                   # Data Transfer Objects
│   ├── Services/               # Business Logic Services
│   ├── Data/                   # Database Context
│   └── Program.cs              # Application Entry Point
├── payments-frontend/          # React Frontend
│   ├── src/
│   │   ├── components/         # Reusable Components
│   │   ├── pages/              # Page Components
│   │   ├── context/            # React Context Providers
│   │   ├── api/                # API Client Configuration
│   │   └── utils/              # Utility Functions
│   └── public/                 # Static Assets
└── .github/workflows/          # GitHub Actions CI/CD
```

## Prerequisites

- .NET 7.0 SDK
- Node.js 18+ and npm
- SQL Server (LocalDB or SQL Server Express)
- Git

## Local Development Setup

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd PaymentsAPI
   ```

2. **Restore dependencies:**
   ```bash
   dotnet restore
   ```

3. **Update database connection string in `appsettings.json`:**
   ```json
   {
     "ConnectionStrings": {
       "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=PaymentsDB;Trusted_Connection=true;MultipleActiveResultSets=true"
     }
   }
   ```

4. **Run database migrations:**
   ```bash
   dotnet ef database update
   ```

5. **Run the backend:**
   ```bash
   dotnet run
   ```
   Backend will be available at: `https://localhost:5001`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd payments-frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create local environment file:**
   ```bash
   cp .env.example .env.local
   ```

4. **Update `.env.local` with your local settings:**
   ```env
   REACT_APP_API_BASE_URL=https://localhost:5001/api
   REACT_APP_ENVIRONMENT=development
   REACT_APP_ENABLE_DEBUG=true
   ```

5. **Run the frontend:**
   ```bash
   npm start
   ```
   Frontend will be available at: `http://localhost:3000`

## Environment Configuration

### Local Development
- **Backend**: `https://localhost:5001`
- **Frontend**: `http://localhost:3000`
- **Database**: Local SQL Server instance

### Development Environment (Azure)
- **Backend**: `https://your-backend-dev.azurewebsites.net`
- **Frontend**: `https://your-frontend-dev.azurewebsites.net`
- **Database**: Azure SQL Database

### Production Environment (Azure)
- **Backend**: `https://your-backend-prod.azurewebsites.net`
- **Frontend**: `https://your-frontend-prod.azurewebsites.net`
- **Database**: Azure SQL Database

## GitHub Secrets Configuration

To enable CI/CD deployment, configure the following secrets in your GitHub repository:

### Development Environment Secrets
- `AZURE_APP_NAME_BACKEND_DEV` - Azure App Service name for backend dev
- `AZURE_WEBAPP_PUBLISH_PROFILE_BACKEND_DEV` - Backend dev publish profile
- `AZURE_APP_NAME_FRONTEND_DEV` - Azure App Service name for frontend dev
- `AZURE_WEBAPP_PUBLISH_PROFILE_FRONTEND_DEV` - Frontend dev publish profile

### Production Environment Secrets
- `AZURE_APP_NAME_BACKEND_PROD` - Azure App Service name for backend prod
- `AZURE_WEBAPP_PUBLISH_PROFILE_BACKEND_PROD` - Backend prod publish profile
- `AZURE_APP_NAME_FRONTEND_PROD` - Azure App Service name for frontend prod
- `AZURE_WEBAPP_PUBLISH_PROFILE_FRONTEND_PROD` - Frontend prod publish profile

### How to Get Publish Profiles
1. Go to Azure Portal
2. Navigate to your App Service
3. Click "Get publish profile" in the overview section
4. Copy the content and add it as a GitHub secret

## CI/CD Pipeline

The project uses GitHub Actions for continuous integration and deployment:

### Workflow Triggers
- **Push to `main`**: Deploys to production
- **Push to `develop`**: Deploys to development
- **Pull Requests**: Runs tests and builds only

### Pipeline Steps
1. **Backend Tests**: Restore, build, test, and publish .NET API
2. **Frontend Tests**: Install dependencies, lint, test, and build React app
3. **Deploy**: Deploy to appropriate Azure App Service based on branch

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password

### Bank Accounts
- `GET /api/bankaccount` - Get user's bank accounts
- `POST /api/bankaccount` - Create bank account
- `GET /api/bankaccount/{id}` - Get specific bank account
- `PUT /api/bankaccount/{id}` - Update bank account
- `DELETE /api/bankaccount/{id}` - Delete bank account

### Payments
- `GET /api/payment` - Get user's payments
- `POST /api/payment` - Create payment
- `GET /api/payment/{id}` - Get specific payment
- `POST /api/payment/{id}/verify` - Verify payment (employees only)

### Currencies
- `GET /api/currency` - Get available currencies
- `GET /api/currency/{code}` - Get specific currency

## Database Schema

### Users Table
- UserID (Primary Key)
- Username, Email, FullName
- Role (Customer/Employee)
- PasswordHash, PasswordSalt
- IDNumber, EmployeeNumber (nullable)

### BankAccounts Table
- AccountID (Primary Key)
- UserID (Foreign Key)
- AccountNumber, AccountType
- Balance, CurrencyCode
- CreatedAt, UpdatedAt

### Payments Table
- PaymentID (Primary Key)
- AccountID (Foreign Key)
- Amount, CurrencyCode
- PayeeAccount, PayeeSwiftCode
- Status (Pending/Verified/Submitted)
- CreatedAt, UpdatedAt

### PaymentVerifications Table
- VerificationID (Primary Key)
- PaymentID (Foreign Key)
- EmployeeID (Foreign Key)
- Action, VerifiedAt

## Development Commands

### Backend Commands
```bash
# Run the application
dotnet run

# Run tests
dotnet test

# Add new migration
dotnet ef migrations add MigrationName

# Update database
dotnet ef database update

# Build for production
dotnet publish -c Release
```

### Frontend Commands
```bash
# Start development server
npm start

# Run tests
npm test

# Build for production
npm run build

# Run linting
npm run lint
```

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure backend CORS is configured for your frontend URL
2. **Database Connection**: Verify connection string and SQL Server is running
3. **Authentication Issues**: Check cookie settings and HTTPS configuration
4. **Build Failures**: Ensure all dependencies are installed and versions match

### Environment Variables
Make sure all required environment variables are set:
- Backend: Connection strings, CORS origins
- Frontend: API base URL, environment settings

## Contributing

1. Create a feature branch from `develop`
2. Make your changes
3. Run tests and ensure they pass
4. Create a pull request to `develop`
5. After review and merge, changes will be deployed to development
6. Create a pull request from `develop` to `main` for production deployment

## License

This project is licensed under the MIT License.
