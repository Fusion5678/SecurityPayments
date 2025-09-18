import React, { useState, useEffect } from 'react';
import { bankAccountAPI, BankAccount, CreateBankAccountRequest } from '../api/bankAccount';
import { currencyAPI, Currency } from '../api/currency';
import { useNotification } from '../context/NotificationContext';
import { 
  validateAccountNumber, 
  sanitizeInput,
  VALIDATION_MESSAGES 
} from '../utils/validation';
import LoadingSpinner from '../components/LoadingSpinner';

interface FormData {
  accountNumber: string;
  accountType: string;
  currencyCode: string;
  balance: string;
}

interface FormErrors {
  accountNumber?: string;
  accountType?: string;
  currencyCode?: string;
  balance?: string;
}

const BankAccountsPage: React.FC = () => {
  const { addNotification } = useNotification();
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    accountNumber: '',
    accountType: '',
    currencyCode: '',
    balance: '0'
  });
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
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
        addNotification({
          type: 'error',
          title: 'Loading Failed',
          message: error.message || 'Failed to load bank accounts'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Account Number validation
    if (!formData.accountNumber.trim()) {
      newErrors.accountNumber = VALIDATION_MESSAGES.REQUIRED;
    } else if (!validateAccountNumber(formData.accountNumber)) {
      newErrors.accountNumber = VALIDATION_MESSAGES.ACCOUNT_NUMBER_INVALID;
    }

    // Account Type validation
    if (!formData.accountType.trim()) {
      newErrors.accountType = VALIDATION_MESSAGES.REQUIRED;
    }

    // Currency validation
    if (!formData.currencyCode.trim()) {
      newErrors.currencyCode = 'Please select a currency';
    }

    // Balance validation
    if (!formData.balance.trim()) {
      newErrors.balance = VALIDATION_MESSAGES.REQUIRED;
    } else if (isNaN(parseFloat(formData.balance)) || parseFloat(formData.balance) < 0) {
      newErrors.balance = 'Balance must be a non-negative number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setFormLoading(true);

    try {
      const newAccount = await bankAccountAPI.create({
        accountNumber: formData.accountNumber.trim(),
        accountType: formData.accountType.trim(),
        currencyCode: formData.currencyCode,
        balance: parseFloat(formData.balance) || 0
      });

      setBankAccounts(prev => [...prev, newAccount]);
      addNotification({
        type: 'success',
        title: 'Account Created',
        message: 'Bank account created successfully!'
      });
      
      // Reset form
      setFormData({
        accountNumber: '',
        accountType: '',
        currencyCode: currencies.find(c => c.currencyCode === 'USD')?.currencyCode || '',
        balance: '0'
      });
      setShowForm(false);

    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Creation Failed',
        message: error.message || 'Failed to create bank account. Please try again.'
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this bank account? This action cannot be undone.')) {
      return;
    }

    try {
      await bankAccountAPI.delete(id);
      setBankAccounts(prev => prev.filter(account => account.bankAccountId !== id));
      setSuccess('Bank account deleted successfully!');
    } catch (error: any) {
      setError(error.message || 'Failed to delete bank account. Please try again.');
    }
  };

  const formatCurrency = (amount: number, currencyCode: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Bank Accounts</h1>
                <p className="mt-2 text-gray-600">
                  Manage your bank accounts and view balances.
                </p>
              </div>
              <button
                onClick={() => setShowForm(!showForm)}
                className="btn-primary"
              >
                {showForm ? 'Cancel' : 'Add Bank Account'}
              </button>
            </div>
          </div>


          {/* Add Bank Account Form */}
          {showForm && (
            <div className="card mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Add New Bank Account</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="accountNumber" className="block text-sm font-medium text-gray-700">
                      Account Number *
                    </label>
                    <input
                      type="text"
                      id="accountNumber"
                      name="accountNumber"
                      value={formData.accountNumber}
                      onChange={handleInputChange}
                      className={`mt-1 input-field ${errors.accountNumber ? 'input-error' : ''}`}
                      placeholder="Enter account number"
                    />
                    {errors.accountNumber && (
                      <p className="mt-1 text-sm text-danger-600">{errors.accountNumber}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="accountType" className="block text-sm font-medium text-gray-700">
                      Account Type *
                    </label>
                    <select
                      id="accountType"
                      name="accountType"
                      value={formData.accountType}
                      onChange={handleInputChange}
                      className={`mt-1 input-field ${errors.accountType ? 'input-error' : ''}`}
                    >
                      <option value="">Select account type</option>
                      <option value="Checking">Checking</option>
                      <option value="Savings">Savings</option>
                      <option value="Business">Business</option>
                    </select>
                    {errors.accountType && (
                      <p className="mt-1 text-sm text-danger-600">{errors.accountType}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                  <div>
                    <label htmlFor="balance" className="block text-sm font-medium text-gray-700">
                      Initial Balance *
                    </label>
                    <input
                      type="number"
                      id="balance"
                      name="balance"
                      value={formData.balance}
                      onChange={handleInputChange}
                      className={`mt-1 input-field ${errors.balance ? 'input-error' : ''}`}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                    {errors.balance && (
                      <p className="mt-1 text-sm text-danger-600">{errors.balance}</p>
                    )}
                  </div>
                </div>


                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="btn-secondary"
                    disabled={formLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="btn-primary"
                  >
                    {formLoading ? (
                      <div className="flex items-center">
                        <LoadingSpinner size="sm" className="mr-2" />
                        Creating...
                      </div>
                    ) : (
                      'Create Account'
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Bank Accounts List */}
          {bankAccounts.length === 0 ? (
            <div className="card">
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">🏦</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No bank accounts found</h3>
                <p className="text-gray-500 mb-4">Add your first bank account to get started.</p>
                <button
                  onClick={() => setShowForm(true)}
                  className="btn-primary"
                >
                  Add Bank Account
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bankAccounts.map((account) => (
                <div key={account.bankAccountId} className="card">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {account.bankName}
                    </h3>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Account Number</p>
                      <p className="font-mono text-sm text-gray-900">{account.accountNumber}</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">Account Holder</p>
                      <p className="text-sm text-gray-900">{account.accountHolderName}</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">Balance</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(account.balance, account.currencyCode)}
                      </p>
                      <p className="text-xs text-gray-500">{account.currencyName}</p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">Created</p>
                      <p className="text-sm text-gray-900">
                        {new Date(account.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleDelete(account.bankAccountId)}
                      className="btn-danger w-full"
                    >
                      Delete Account
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BankAccountsPage;


