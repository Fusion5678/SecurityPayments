-- ========================
-- CREATE DATABASE
-- ========================
CREATE DATABASE BankPayments;
GO

USE BankPayments;
GO

-- ========================
-- USERS (Customers + Employees)
-- ========================
CREATE TABLE Users (
    UserID          INT IDENTITY PRIMARY KEY,
    FullName        VARCHAR(150) NOT NULL,
    Username        VARCHAR(50) UNIQUE NOT NULL,
    Email           VARCHAR(150) UNIQUE NOT NULL,
    PasswordHash    VARCHAR(255) NOT NULL,
    PasswordSalt    VARCHAR(255) NOT NULL,
    Role            VARCHAR(20) NOT NULL CHECK (Role IN ('Customer','Employee','Admin')),
    IDNumber        VARCHAR(30),         -- only for customers
    EmployeeNumber  VARCHAR(30),         -- only for employees
    CreatedAt       DATETIME DEFAULT GETDATE(),
    UpdatedAt       DATETIME DEFAULT GETDATE()
);

-- ========================
-- CURRENCIES
-- ========================
CREATE TABLE Currencies (
    CurrencyCode CHAR(3) PRIMARY KEY, -- e.g., 'USD', 'ZAR', 'EUR'
    CurrencyName VARCHAR(50) NOT NULL
);

-- Seed currencies
INSERT INTO Currencies (CurrencyCode, CurrencyName) VALUES
('USD', 'US Dollar'),
('ZAR', 'South African Rand'),
('EUR', 'Euro'),
('GBP', 'British Pound');

-- ========================
-- BANK ACCOUNTS
-- ========================
CREATE TABLE BankAccounts (
    AccountID       INT IDENTITY PRIMARY KEY,
    UserID          INT NOT NULL REFERENCES Users(UserID),
    AccountNumber   VARCHAR(30) UNIQUE NOT NULL,
    AccountType     VARCHAR(20) NOT NULL CHECK (AccountType IN ('Checking','Savings','Business')),
    Balance         DECIMAL(18,2) DEFAULT 0.00,
    CurrencyCode    CHAR(3) NOT NULL REFERENCES Currencies(CurrencyCode),
    CreatedAt       DATETIME DEFAULT GETDATE(),
    UpdatedAt       DATETIME DEFAULT GETDATE()
);

-- ========================
-- PAYMENTS
-- ========================
CREATE TABLE Payments (
    PaymentID       INT IDENTITY PRIMARY KEY,
    AccountID       INT NOT NULL REFERENCES BankAccounts(AccountID),
    Amount          DECIMAL(18,2) NOT NULL,
    CurrencyCode    CHAR(3) NOT NULL REFERENCES Currencies(CurrencyCode),
    PayeeAccount    VARCHAR(50) NOT NULL,
    PayeeSwiftCode  VARCHAR(20) NOT NULL,
    Status          VARCHAR(20) DEFAULT 'Pending' 
                   CHECK (Status IN ('Pending','Verified','Submitted')),
    CreatedAt       DATETIME DEFAULT GETDATE(),
    UpdatedAt       DATETIME DEFAULT GETDATE()
);

-- ========================
-- PAYMENT VERIFICATIONS
-- ========================
CREATE TABLE PaymentVerifications (
    VerificationID   INT IDENTITY PRIMARY KEY,
    PaymentID        INT NOT NULL REFERENCES Payments(PaymentID),
    EmployeeID       INT NOT NULL REFERENCES Users(UserID),
    VerifiedAt       DATETIME DEFAULT GETDATE(),
    Action           VARCHAR(20) NOT NULL CHECK (Action IN ('Verified','Rejected'))
);

-- ========================
-- SAMPLE DATA (OPTIONAL)
-- ========================

-- Insert sample employee
INSERT INTO Users (FullName, Username, Email, PasswordHash, PasswordSalt, Role, EmployeeNumber)
VALUES ('Alice Verifier', 'alice.v', 'alice@bank.com', 'hashed_pw_here', 'salt_here', 'Employee', 'EMP001');

-- Insert sample customer
INSERT INTO Users (FullName, Username, Email, PasswordHash, PasswordSalt, Role, IDNumber)
VALUES ('John Doe', 'johnd', 'john@example.com', 'hashed_pw_here', 'salt_here', 'Customer', '1234567890123');

-- Assign bank account to customer
INSERT INTO BankAccounts (UserID, AccountNumber, AccountType, Balance, CurrencyCode)
VALUES (2, '1234567890', 'Checking', 50000.00, 'ZAR');

-- Customer creates a payment
INSERT INTO Payments (AccountID, Amount, CurrencyCode, PayeeAccount, PayeeSwiftCode)
VALUES (1, 1500.00, 'USD', '9876543210', 'ABCDUS33');

-- Employee verifies the payment
INSERT INTO PaymentVerifications (PaymentID, EmployeeID, Action)
VALUES (1, 1, 'Verified');

-- Update payment status after verification
UPDATE Payments SET Status = 'Verified' WHERE PaymentID = 1;