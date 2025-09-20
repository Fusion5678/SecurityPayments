# Payments API

A .NET Core 7 Web API project using Entity Framework Core with Database-First approach for SQL Server.

## Features

- **Database-First Entity Framework Core** for SQL Server
- **Cookie-based Authentication** with secure HttpOnly cookies
- **BCrypt Password Hashing** with automatic salt generation
- **Server-side Validation** using regex patterns
- **Service Layer Architecture** for business logic separation
- **DTO Layer** for clean API contracts
- **Swagger Documentation** for all endpoints
- **CORS Configuration** for React frontend integration

## Database Schema

The API works with the following tables:
- **Users** (customers + employees)
- **BankAccounts** (user bank accounts)
- **Currencies** (supported currencies)
- **Payments** (payment transactions)
- **PaymentVerifications** (payment verification status)

## Setup Instructions

### 1. Prerequisites
- .NET 9.0 SDK
- SQL Server (local or remote)
- Database named "PaymentsDB" with the required tables

### 2. Database Setup
Create the PaymentsDB database with the following tables:

```sql
-- Users table
CREATE TABLE Users (
    UserId int IDENTITY(1,1) PRIMARY KEY,
    Username nvarchar(50) NOT NULL UNIQUE,
    Email nvarchar(100) NOT NULL UNIQUE,
    PasswordHash nvarchar(255) NOT NULL,
    PasswordSalt nvarchar(255),
    IdNumber nvarchar(13) NOT NULL UNIQUE,
    FirstName nvarchar(50) NOT NULL,
    LastName nvarchar(50) NOT NULL,
    UserType nvarchar(20) NOT NULL, -- 'Customer' or 'Employee'
    CreatedAt datetime2 NOT NULL DEFAULT GETDATE(),
    UpdatedAt datetime2
);

-- Currencies table
CREATE TABLE Currencies (
    CurrencyId int IDENTITY(1,1) PRIMARY KEY,
    Code nvarchar(3) NOT NULL UNIQUE, -- USD, EUR, etc.
    Name nvarchar(50) NOT NULL,
    Symbol nvarchar(5),
    ExchangeRate decimal(18,6) NOT NULL, -- Base rate against USD
    IsActive bit NOT NULL DEFAULT 1,
    CreatedAt datetime2 NOT NULL DEFAULT GETDATE(),
    UpdatedAt datetime2
);

-- BankAccounts table
CREATE TABLE BankAccounts (
    BankAccountId int IDENTITY(1,1) PRIMARY KEY,
    UserId int NOT NULL,
    AccountNumber nvarchar(50) NOT NULL UNIQUE,
    BankName nvarchar(100) NOT NULL,
    AccountHolderName nvarchar(50) NOT NULL,
    CurrencyId int NOT NULL,
    Balance decimal(18,2) NOT NULL DEFAULT 0,
    IsActive bit NOT NULL DEFAULT 1,
    CreatedAt datetime2 NOT NULL DEFAULT GETDATE(),
    UpdatedAt datetime2,
    FOREIGN KEY (UserId) REFERENCES Users(UserId),
    FOREIGN KEY (CurrencyId) REFERENCES Currencies(CurrencyId)
);

-- Payments table
CREATE TABLE Payments (
    PaymentId int IDENTITY(1,1) PRIMARY KEY,
    UserId int NOT NULL,
    BankAccountId int NOT NULL,
    CurrencyId int NOT NULL,
    Amount decimal(18,2) NOT NULL,
    Description nvarchar(200) NOT NULL,
    RecipientName nvarchar(50) NOT NULL,
    RecipientAccount nvarchar(100),
    RecipientBank nvarchar(100),
    Status nvarchar(20) NOT NULL, -- 'Pending', 'Verified', 'Submitted', 'Completed', 'Failed'
    CreatedAt datetime2 NOT NULL DEFAULT GETDATE(),
    UpdatedAt datetime2,
    FOREIGN KEY (UserId) REFERENCES Users(UserId),
    FOREIGN KEY (BankAccountId) REFERENCES BankAccounts(BankAccountId),
    FOREIGN KEY (CurrencyId) REFERENCES Currencies(CurrencyId)
);

-- PaymentVerifications table
CREATE TABLE PaymentVerifications (
    VerificationId int IDENTITY(1,1) PRIMARY KEY,
    PaymentId int NOT NULL,
    Status nvarchar(20) NOT NULL, -- 'Pending', 'Verified', 'Submitted'
    Notes nvarchar(500),
    VerifiedBy nvarchar(100),
    CreatedAt datetime2 NOT NULL DEFAULT GETDATE(),
    UpdatedAt datetime2,
    FOREIGN KEY (PaymentId) REFERENCES Payments(PaymentId)
);

-- Insert sample currencies
INSERT INTO Currencies (Code, Name, Symbol, ExchangeRate) VALUES
('USD', 'US Dollar', '$', 1.000000),
('EUR', 'Euro', '€', 0.850000),
('GBP', 'British Pound', '£', 0.730000),
('ZAR', 'South African Rand', 'R', 18.500000);
```

### 3. Project Setup

1. **Clone/Download** the project files
2. **Update Connection String** in `appsettings.json` if needed
3. **Restore Packages**:
   ```bash
   dotnet restore
   ```
4. **Run the Application**:
   ```bash
   dotnet run
   ```

### 4. Database Scaffolding (Optional)

If you want to regenerate the models from an existing database:

```bash
# Install EF Core tools
dotnet tool install --global dotnet-ef --version 7.0.0

# Scaffold the database
dotnet ef dbcontext scaffold "Server=localhost;Database=PaymentsDB;User Id=sa;Password=password;TrustServerCertificate=True;" Microsoft.EntityFrameworkCore.SqlServer -o Models -c PaymentsDbContext --context-dir Data --force
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new customer
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user info
- `GET /api/auth/check-username/{username}` - Check username availability
- `GET /api/auth/check-email/{email}` - Check email availability
- `GET /api/auth/check-idnumber/{idNumber}` - Check ID number availability

### Bank Accounts (Requires Authentication)
- `POST /api/bankaccount` - Create bank account
- `GET /api/bankaccount` - Get user's bank accounts
- `GET /api/bankaccount/{id}` - Get specific bank account
- `PUT /api/bankaccount/{id}` - Update bank account
- `DELETE /api/bankaccount/{id}` - Delete bank account
- `GET /api/bankaccount/check-account/{accountNumber}` - Check account number availability

### Payments (Requires Authentication)
- `POST /api/payment` - Create payment
- `GET /api/payment` - Get user's payments
- `GET /api/payment/{id}` - Get specific payment
- `POST /api/payment/{id}/verify` - Verify payment (for employees)

### Currencies
- `GET /api/currency` - Get all active currencies
- `GET /api/currency/{id}` - Get specific currency

## Validation Rules

### User Registration
- **Username**: Alphanumeric, 3-20 characters
- **Email**: Valid email format
- **Password**: Min 8 chars, at least 1 number, 1 uppercase, 1 special character
- **ID Number**: Numeric, exactly 13 digits

### Bank Account
- **Account Number**: Unique, max 50 characters
- **Bank Name**: Max 100 characters
- **Account Holder Name**: Max 50 characters
- **Balance**: Non-negative decimal

### Payment
- **Amount**: Greater than 0
- **Description**: Max 200 characters
- **Recipient Name**: Max 50 characters

## Security Features

- **BCrypt Password Hashing** with automatic salt generation
- **Secure HttpOnly Cookies** for authentication
- **CORS Configuration** for React frontend (http://localhost:3000)
- **Server-side Validation** with regex patterns
- **Authorization Required** for protected endpoints

## Project Structure

```
PaymentsAPI/
├── Controllers/          # API Controllers
├── Data/                # DbContext
├── DTOs/                # Data Transfer Objects
├── Models/              # Entity Framework Models
├── Services/            # Business Logic Services
├── Program.cs           # Application entry point
├── appsettings.json     # Configuration
└── PaymentsAPI.csproj   # Project file
```

## Swagger Documentation

Once the application is running, visit:
- **Swagger UI**: `https://localhost:5001/swagger` (or the port shown in console)
- **API Documentation**: Available through Swagger UI

## Testing with React Frontend

The API is configured to accept requests from `http://localhost:3000` (React development server). Make sure to:

1. Include credentials in fetch requests:
   ```javascript
   fetch('/api/auth/login', {
     method: 'POST',
     credentials: 'include',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify(loginData)
   });
   ```

2. Handle authentication cookies properly in your React app.

## Notes

- Only customers can register through the API
- Employees must be created directly in the database
- All payment operations require authentication
- Bank accounts can only be deleted if they have no associated payments
- Payment verification is available for employees
