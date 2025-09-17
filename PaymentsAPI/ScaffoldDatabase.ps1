# PowerShell script to scaffold the database using Entity Framework Core
# Run this script from the project root directory

Write-Host "Scaffolding PaymentsDB database..." -ForegroundColor Green

# Install EF Core tools if not already installed
dotnet tool install --global dotnet-ef --version 7.0.0

# Scaffold the database
dotnet ef dbcontext scaffold "Server=localhost;Database=PaymentsDB;User Id=sa;Password=password;TrustServerCertificate=True;" Microsoft.EntityFrameworkCore.SqlServer -o Models -c PaymentsDbContext --context-dir Data --force

Write-Host "Database scaffolding completed!" -ForegroundColor Green
Write-Host "Please review the generated models and update them as needed." -ForegroundColor Yellow
