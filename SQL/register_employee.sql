/* ==========================================================
   REGISTER EMPLOYEE (Parameterized Version)
   ==========================================================
   Usage:
   1️  Replace the parameter values in the DECLARE section
       with actual BCrypt hash + salt generated in your app.
   2️   Run this AFTER creating PaymentsDB and the Users table.
   3️  Safe to re-run — uses IF NOT EXISTS checks.
========================================================== */

USE PaymentsDB;
GO
SET NOCOUNT ON;

-- ==========================================
-- 🔧 PARAMETERS (EDIT THESE AS NEEDED)
-- ==========================================
DECLARE 
    @EmpFullName       NVARCHAR(150) = N'Demo Employee',
    @EmpUsername       NVARCHAR(50)  = N'DemoEmployee',
    @EmpEmail          NVARCHAR(150) = N'john.smith2@securitypayments.com',
    @EmpRole           NVARCHAR(20)  = N'Employee',
    @EmpNumber         NVARCHAR(30)  = N'EMP001',
    @EmpPasswordHash   NVARCHAR(255) = N'',
    @EmpPasswordSalt   NVARCHAR(255) = N'';


-- ==========================================
--  INSERT EMPLOYEE IF NOT EXISTS
-- ==========================================
IF NOT EXISTS (SELECT 1 FROM Users WHERE Username = @EmpUsername)
BEGIN
    INSERT INTO Users (
        FullName,
        Username,
        Email,
        PasswordHash,
        PasswordSalt,
        Role,
        EmployeeNumber,
        CreatedAt,
        UpdatedAt
    ) VALUES (
        @EmpFullName,
        @EmpUsername,
        @EmpEmail,
        @EmpPasswordHash,
        @EmpPasswordSalt,
        @EmpRole,
        @EmpNumber,
        GETDATE(),
        GETDATE()
    );

    PRINT 'Employee account created: ' + @EmpUsername;
END
ELSE
BEGIN
    PRINT 'Employee already exists: ' + @EmpUsername;
END;

-- ==========================================
--  VERIFY RESULTS
-- ==========================================
SELECT 
    UserID,
    FullName,
    Username,
    Email,
    Role,
    EmployeeNumber,
    CreatedAt
FROM Users 
WHERE Role IN ('Employee')
ORDER BY CreatedAt DESC;

PRINT 'Employee setup complete!';
GO
