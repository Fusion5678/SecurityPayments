import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { bankAccountAPI, BankAccount } from '../api/bankAccount';
import { currencyAPI, Currency } from '../api/currency';
import { paymentAPI } from '../api/payment';
import { 
  validateAmount, 
  validatePaymentDescription, 
  validateRecipientName,
  validateSwiftCode,
  sanitizeInput,
  VALIDATION_MESSAGES, 
  validateAccountNumber
} from '../utils/validation';
import LoadingSpinner from '../components/LoadingSpinner';

interface FormData {
  accountID: number;
  currencyCode: string;
  amount: string;
  payeeAccount: string;
  payeeSwiftCode: string;
}

interface FormErrors {
  accountID?: string;
  currencyCode?: string;
  amount?: string;
  payeeAccount?: string;
  payeeSwiftCode?: string;
}

const CreatePaymentPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [formData, setFormData] = useState<FormData>({
    accountID: 0,
    currencyCode: '',
    amount: '',
    payeeAccount: '',
    payeeSwiftCode: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [accountsData, currenciesData] = await Promise.all([
          bankAccountAPI.getAll(),
          currencyAPI.getAll()
        ]);
        
        setBankAccounts(accountsData);
        setCurrencies(currenciesData);
        
        // Set default currency to USD if available
        const usdCurrency = currenciesData.find(c => c.currencyCode === 'USD');
        if (usdCurrency) {
          setFormData(prev => ({ ...prev, currencyCode: usdCurrency.currencyCode }));
        }
      } catch (error: any) {
        setError(error.message || 'Failed to load form data');
      }
    };

    fetchData();
  }, []);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Bank Account validation
    if (!formData.accountID || formData.accountID === 0) {
      newErrors.accountID = 'Please select a bank account';
    }

    // Currency validation
    if (!formData.currencyCode.trim()) {
      newErrors.currencyCode = 'Please select a currency';
    }

    // Amount validation
    if (!formData.amount.trim()) {
      newErrors.amount = VALIDATION_MESSAGES.REQUIRED;
    } else if (!validateAmount(formData.amount)) {
      newErrors.amount = VALIDATION_MESSAGES.AMOUNT_INVALID;
    }

    // Payee Account validation
    if (!formData.payeeAccount.trim()) {
      newErrors.payeeAccount = VALIDATION_MESSAGES.REQUIRED;
    } else if (!validateAccountNumber(formData.payeeAccount)) {
      newErrors.payeeAccount = 'Invalid account format';
    }

    // Payee SWIFT Code validation
    if (!formData.payeeSwiftCode.trim()) {
      newErrors.payeeSwiftCode = VALIDATION_MESSAGES.REQUIRED;
    } else if (formData.payeeSwiftCode.trim().length < 8) {
      newErrors.payeeSwiftCode = 'SWIFT code must be at least 8 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const sanitizedValue = sanitizeInput(value);
    
    setFormData(prev => ({
      ...prev,
      [name]: sanitizedValue
    }));

    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }

    // Clear success message when form changes
    if (success) {
      setSuccess('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await paymentAPI.create({
        accountID: formData.accountID,
        amount: parseFloat(formData.amount),
        currencyCode: formData.currencyCode,
        payeeAccount: formData.payeeAccount.trim(),
        payeeSwiftCode: formData.payeeSwiftCode.trim()
      });

      setSuccess('Payment created successfully!');
      
      // Reset form
      setFormData({
        accountID: 0,
        currencyCode: currencies.find(c => c.currencyCode === 'USD')?.currencyCode || '',
        amount: '',
        payeeAccount: '',
        payeeSwiftCode: ''
      });

      // Navigate to dashboard after a short delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);

    } catch (error: any) {
      setError(error.message || 'Failed to create payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const selectedAccount = bankAccounts.find(account => account.accountID === formData.accountID);
  const selectedCurrency = currencies.find(currency => currency.currencyCode === formData.currencyCode);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Create New Payment</h1>
            <p className="mt-2 text-gray-600">
              Fill in the details below to create a new payment.
            </p>
          </div>

          <div className="card">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-md">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-success-50 border border-success-200 text-success-700 px-4 py-3 rounded-md">
                  {success}
                </div>
              )}

              {/* Bank Account Selection */}
              <div>
                <label htmlFor="accountID" className="block text-sm font-medium text-gray-700">
                  From Account *
                </label>
                <select
                  id="accountID"
                  name="accountID"
                  value={formData.accountID}
                  onChange={handleInputChange}
                  className={`mt-1 input-field ${errors.accountID ? 'input-error' : ''}`}
                >
                  <option value={0}>Select an account</option>
                  {bankAccounts.map((account) => (
                    <option key={account.accountID} value={account.accountID}>
                      {account.accountType} - {account.accountNumber} ({account.currencyCode})
                    </option>
                  ))}
                </select>
                {errors.accountID && (
                  <p className="mt-1 text-sm text-danger-600">{errors.accountID}</p>
                )}
                {selectedAccount && (
                  <p className="mt-1 text-sm text-gray-500">
                    Available balance: {selectedAccount.currencyCode} {selectedAccount.balance.toFixed(2)}
                  </p>
                )}
              </div>

              {/* Currency and Amount */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Currency Selection */}
                <div>
                  <label htmlFor="currencyCode" className="block text-sm font-medium text-gray-700">
                    Currency *
                  </label>
                  <select
                    id="currencyCode"
                    name="currencyCode"
                    value={formData.currencyCode}
                    onChange={handleInputChange}
                    className={`mt-1 input-field ${errors.currencyCode ? 'input-error' : ''}`}
                  >
                    <option value="">Select currency</option>
                    {currencies.map((currency) => (
                      <option key={currency.currencyCode} value={currency.currencyCode}>
                        {currency.currencyCode} - {currency.currencyName}
                      </option>
                    ))}
                  </select>
                  {errors.currencyCode && (
                    <p className="mt-1 text-sm text-danger-600">{errors.currencyCode}</p>
                  )}
                </div>

                {/* Amount */}
                <div>
                  <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                    Amount *
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <input
                      type="text"
                      id="amount"
                      name="amount"
                      value={formData.amount}
                      onChange={handleInputChange}
                      className={`input-field pl-8 ${errors.amount ? 'input-error' : ''}`}
                      placeholder="0.00"
                    />
                  </div>
                  {errors.amount && (
                    <p className="mt-1 text-sm text-danger-600">{errors.amount}</p>
                  )}
                </div>
              </div>


              {/* Payee Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="payeeAccount" className="block text-sm font-medium text-gray-700">
                    Payee Account *
                  </label>
                  <input
                    type="text"
                    id="payeeAccount"
                    name="payeeAccount"
                    value={formData.payeeAccount}
                    onChange={handleInputChange}
                    className={`mt-1 input-field ${errors.payeeAccount ? 'input-error' : ''}`}
                    placeholder="Enter payee account number"
                  />
                  {errors.payeeAccount && (
                    <p className="mt-1 text-sm text-danger-600">{errors.payeeAccount}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="payeeSwiftCode" className="block text-sm font-medium text-gray-700">
                    Payee SWIFT Code *
                  </label>
                  <input
                    type="text"
                    id="payeeSwiftCode"
                    name="payeeSwiftCode"
                    value={formData.payeeSwiftCode}
                    onChange={handleInputChange}
                    className={`mt-1 input-field ${errors.payeeSwiftCode ? 'input-error' : ''}`}
                    placeholder="Enter SWIFT code (e.g., ABCDUS33)"
                  />
                  {errors.payeeSwiftCode && (
                    <p className="mt-1 text-sm text-danger-600">{errors.payeeSwiftCode}</p>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="btn-secondary"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <LoadingSpinner size="sm" className="mr-2" />
                      Creating Payment...
                    </div>
                  ) : (
                    'Create Payment'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePaymentPage;

