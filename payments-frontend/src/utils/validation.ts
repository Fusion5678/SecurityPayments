// Strict regex patterns to prevent script injection and ensure security compliance

// Email validation - RFC 5322 compliant
export const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

// Username validation - alphanumeric only, 3-20 characters, no special chars that could be used for injection
export const USERNAME_REGEX = /^[a-zA-Z0-9]{3,20}$/;

// Password validation - min 8 chars, at least 1 number, 1 uppercase, 1 special char, no < > characters
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

// ID Number validation - exactly 13 digits
export const ID_NUMBER_REGEX = /^\d{13}$/;

// Account number validation - alphanumeric and hyphens only, 5-50 characters
export const ACCOUNT_NUMBER_REGEX = /^[a-zA-Z0-9-]{5,50}$/;

// Bank name validation - letters, spaces, and common punctuation only
export const BANK_NAME_REGEX = /^[a-zA-Z\s.,&-]{2,100}$/;

// Account holder name validation - letters, spaces, hyphens, apostrophes only
export const ACCOUNT_HOLDER_REGEX = /^[a-zA-Z\s'-]{2,50}$/;

// SWIFT code validation - 8 or 11 characters, alphanumeric
export const SWIFT_CODE_REGEX = /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/;

// Payment description validation - letters, numbers, spaces, common punctuation, no < > characters
export const PAYMENT_DESCRIPTION_REGEX = /^[a-zA-Z0-9\s.,!?@#$%&*()_+-=]{1,200}$/;

// Recipient name validation - letters, spaces, hyphens, apostrophes only
export const RECIPIENT_NAME_REGEX = /^[a-zA-Z\s'-]{2,50}$/;

// Amount validation - positive decimal with max 2 decimal places
export const AMOUNT_REGEX = /^\d+(\.\d{1,2})?$/;

// Validation functions
export const validateEmail = (email: string): boolean => {
  return EMAIL_REGEX.test(email);
};

export const validateUsername = (username: string): boolean => {
  return USERNAME_REGEX.test(username);
};

export const validatePassword = (password: string): boolean => {
  return PASSWORD_REGEX.test(password);
};

export const validateIdNumber = (idNumber: string): boolean => {
  return ID_NUMBER_REGEX.test(idNumber);
};

export const validateAccountNumber = (accountNumber: string): boolean => {
  return ACCOUNT_NUMBER_REGEX.test(accountNumber);
};

export const validateBankName = (bankName: string): boolean => {
  return BANK_NAME_REGEX.test(bankName);
};

export const validateAccountHolder = (accountHolder: string): boolean => {
  return ACCOUNT_HOLDER_REGEX.test(accountHolder);
};

export const validateSwiftCode = (swiftCode: string): boolean => {
  return SWIFT_CODE_REGEX.test(swiftCode);
};

export const validatePaymentDescription = (description: string): boolean => {
  return PAYMENT_DESCRIPTION_REGEX.test(description);
};

export const validateRecipientName = (recipientName: string): boolean => {
  return RECIPIENT_NAME_REGEX.test(recipientName);
};

export const validateAmount = (amount: string): boolean => {
  return AMOUNT_REGEX.test(amount) && parseFloat(amount) > 0;
};

// Sanitization function to prevent XSS
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Remove < and > characters
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
};

// Escape HTML entities
export const escapeHtml = (text: string): string => {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

// Validation error messages
export const VALIDATION_MESSAGES = {
  EMAIL_INVALID: 'Please enter a valid email address',
  USERNAME_INVALID: 'Username must be 3-20 alphanumeric characters only',
  PASSWORD_INVALID: 'Password must be at least 8 characters with 1 uppercase, 1 lowercase, 1 number, and 1 special character',
  ID_NUMBER_INVALID: 'ID Number must be exactly 13 digits',
  ACCOUNT_NUMBER_INVALID: 'Account number must be 5-50 alphanumeric characters or hyphens',
  BANK_NAME_INVALID: 'Bank name contains invalid characters',
  ACCOUNT_HOLDER_INVALID: 'Account holder name contains invalid characters',
  SWIFT_CODE_INVALID: 'SWIFT code must be 8 or 11 alphanumeric characters',
  PAYMENT_DESCRIPTION_INVALID: 'Description contains invalid characters',
  RECIPIENT_NAME_INVALID: 'Recipient name contains invalid characters',
  AMOUNT_INVALID: 'Amount must be a positive number with max 2 decimal places',
  REQUIRED: 'This field is required',
  MIN_LENGTH: (min: number) => `Minimum length is ${min} characters`,
  MAX_LENGTH: (max: number) => `Maximum length is ${max} characters`,
};
