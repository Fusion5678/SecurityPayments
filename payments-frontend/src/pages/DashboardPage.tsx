import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { bankAccountAPI, BankAccount } from '../api/bankAccount';
import { paymentAPI, Payment } from '../api/payment';
import LoadingSpinner from '../components/LoadingSpinner';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [accountsData, paymentsData] = await Promise.all([
          bankAccountAPI.getAll(),
          paymentAPI.getAll()
        ]);
        
        setBankAccounts(accountsData);
        setPayments(paymentsData);
      } catch (error: any) {
        setError(error.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'status-pending';
      case 'verified':
        return 'status-verified';
      case 'submitted':
        return 'status-submitted';
      default:
        return 'status-pending';
    }
  };

  const formatCurrency = (amount: number, currencyCode: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user?.fullName}!
            </h1>
            <p className="mt-2 text-gray-600">
              Here's an overview of your accounts and recent payments.
            </p>
          </div>

          {error && (
            <div className="mb-6 bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          {/* Quick Actions */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-4">
              <Link
                to="/create-payment"
                className="btn-primary"
              >
                Create New Payment
              </Link>
              <Link
                to="/bank-accounts"
                className="btn-secondary"
              >
                Manage Accounts
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Bank Accounts */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Bank Accounts</h2>
                <Link
                  to="/bank-accounts"
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  View All
                </Link>
              </div>

              {bankAccounts.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No bank accounts found</p>
                  <Link
                    to="/bank-accounts"
                    className="btn-primary"
                  >
                    Add Bank Account
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {bankAccounts.slice(0, 3).map((account) => (
                    <div
                      key={account.bankAccountId}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {account.bankName}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {account.accountNumber}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            {formatCurrency(account.balance, account.currencyCode)}
                          </p>
                          <p className="text-sm text-gray-500">
                            {account.currencyName}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Payments */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Recent Payments</h2>
                <Link
                  to="/payments"
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  View All
                </Link>
              </div>

              {payments.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No payments found</p>
                  <Link
                    to="/create-payment"
                    className="btn-primary"
                  >
                    Create Payment
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {payments.slice(0, 5).map((payment) => (
                    <div
                      key={payment.paymentID}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h3 className="font-medium text-gray-900">
                            Payment #{payment.paymentID}
                          </h3>
                          <p className="text-sm text-gray-500">
                            To: {payment.payeeAccount}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            {formatCurrency(payment.amount, payment.currencyCode)}
                          </p>
                          <span className={`inline-block ${getStatusClass(payment.status)}`}>
                            {payment.status}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-400">
                        {formatDate(payment.createdAt)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Statistics */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card text-center">
              <h3 className="text-lg font-semibold text-gray-900">Total Accounts</h3>
              <p className="text-3xl font-bold text-primary-600 mt-2">
                {bankAccounts.length}
              </p>
            </div>
            
            <div className="card text-center">
              <h3 className="text-lg font-semibold text-gray-900">Total Payments</h3>
              <p className="text-3xl font-bold text-primary-600 mt-2">
                {payments.length}
              </p>
            </div>
            
            <div className="card text-center">
              <h3 className="text-lg font-semibold text-gray-900">Pending Payments</h3>
              <p className="text-3xl font-bold text-warning-600 mt-2">
                {payments.filter(p => p.status.toLowerCase() === 'pending').length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
