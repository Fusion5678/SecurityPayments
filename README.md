# Payments Portal

## Overview

The Payments Portal is an internal international payment system for an international bank. It enables customers to make secure international payments via the bank's online banking site, with dedicated staff managing payment verification and SWIFT submission.

For detailed information on implemented security measures, please see SECURITY.md.

## Key Features

### For Customers
- **Registration** – Register with full name, username, email, ID number, and password
- **Login** – Authenticate with username and password
- **Bank Account Management** – Create, view, update, and delete bank accounts with different currencies
- **Profile Management** – Update personal information and change password
- **Payment Creation** – Enter amount, select currency, and choose SWIFT as payment provider
- **Recipient Details** – Provide payee account information and SWIFT code for transfers
- **Payment Submission** – Submit payment via "Pay Now"
- **Payment Tracking** – Track payment status and view history

### For Bank Employees
- **Login** – Authenticate with username and password (pre-registered accounts)
- **Transaction Review** – Review customer payment transactions
- **SWIFT Verification** – Verify payee account information and SWIFT code
- **Payment Approval** – Approve transactions with the "Verified" button
- **SWIFT Submission** – Submit approved payments to dummy SWIFT API for testing

## Core Functionality

- Secure customer registration and login
- Employee login with pre-registered accounts
- Bank account creation and management with multi-currency support
- User profile management and password change functionality
- Multi-step payment creation with currency selection
- Dummy SWIFT API integration for testing
- Employee verification workflow
- Secure database storage of transactions
- Payment status tracking with real-time updates

## Implementation Status

-**Currently Implemented**: Customer Portal with registration, login, bank account management, profile management, payment creation, and employee verification workflows
-**Still to be Implemented**: Azure deployment and DevSecOps pipeline for deployment and continuous security monitoring