import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { paymentAPI, Payment } from '../api/payment';
import LoadingSpinner from '../components/LoadingSpinner';

interface PaymentStatistics {
  totalPayments: number;
  pendingPayments: number;
  verifiedPayments: number;
  rejectedPayments: number;
  submittedPayments: number;
  totalAmount: number;
  pendingAmount: number;
  verifiedAmount: number;
  submittedAmount: number;
}

const EmployeeDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [statistics, setStatistics] = useState<PaymentStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [filter, setFilter] = useState<string>('all');
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [paymentsData, statsData] = await Promise.all([
          paymentAPI.getAll(filter === 'all' ? undefined : filter),
          paymentAPI.getStatistics()
        ]);
        
        setPayments(paymentsData);
        setStatistics(statsData);
      } catch (error: any) {
        setError(error.message || 'Failed to load dashboard data');
        addNotification({
          type: 'error',
          title: 'Loading Failed',
          message: error.message || 'Failed to load dashboard data'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filter, addNotification]);

  const handleVerifyPayment = async (paymentId: number, action: 'Verified' | 'Rejected') => {
    try {
      setActionLoading(paymentId);
      await paymentAPI.verifyPayment(paymentId, action);
      
      addNotification({
        type: 'success',
        title: 'Payment Updated',
        message: `Payment ${action.toLowerCase()} successfully!`
      });

      // Refresh data
      const [paymentsData, statsData] = await Promise.all([
        paymentAPI.getAll(filter === 'all' ? undefined : filter),
        paymentAPI.getStatistics()
      ]);
      
      setPayments(paymentsData);
      setStatistics(statsData);
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Action Failed',
        message: error.message || 'Failed to update payment'
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleSubmitPayment = async (paymentId: number) => {
    try {
      setActionLoading(paymentId);
      await paymentAPI.submitPayment(paymentId);
      
      addNotification({
        type: 'success',
        title: 'Payment Submitted',
        message: 'Payment submitted successfully!'
      });

      // Refresh data
      const [paymentsData, statsData] = await Promise.all([
        paymentAPI.getAll(filter === 'all' ? undefined : filter),
        paymentAPI.getStatistics()
      ]);
      
      setPayments(paymentsData);
      setStatistics(statsData);
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Submission Failed',
        message: error.message || 'Failed to submit payment'
      });
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'verified':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'submitted':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
              Employee Dashboard
            </h1>
            <p className="mt-2 text-gray-600">
              Welcome back, {user?.fullName}! Manage and verify payment transactions.
            </p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          {/* Statistics Cards */}
          {statistics && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="card text-center">
                <h3 className="text-lg font-semibold text-gray-900">Total Payments</h3>
                <p className="text-3xl font-bold text-blue-600 mt-2">
                  {statistics.totalPayments}
                </p>
                <p className="text-sm text-gray-500">
                  {formatCurrency(statistics.totalAmount, 'USD')}
                </p>
              </div>
              
              <div className="card text-center">
                <h3 className="text-lg font-semibold text-gray-900">Pending</h3>
                <p className="text-3xl font-bold text-yellow-600 mt-2">
                  {statistics.pendingPayments}
                </p>
                <p className="text-sm text-gray-500">
                  {formatCurrency(statistics.pendingAmount, 'USD')}
                </p>
              </div>
              
              <div className="card text-center">
                <h3 className="text-lg font-semibold text-gray-900">Verified</h3>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  {statistics.verifiedPayments}
                </p>
                <p className="text-sm text-gray-500">
                  {formatCurrency(statistics.verifiedAmount, 'USD')}
                </p>
              </div>
              
              <div className="card text-center">
                <h3 className="text-lg font-semibold text-gray-900">Submitted</h3>
                <p className="text-3xl font-bold text-blue-600 mt-2">
                  {statistics.submittedPayments}
                </p>
                <p className="text-sm text-gray-500">
                  {formatCurrency(statistics.submittedAmount, 'USD')}
                </p>
              </div>
            </div>
          )}

          {/* Status Filters */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'all', label: 'All', count: statistics?.totalPayments || 0 },
                { key: 'pending', label: 'Pending', count: statistics?.pendingPayments || 0 },
                { key: 'verified', label: 'Verified', count: statistics?.verifiedPayments || 0 },
                { key: 'rejected', label: 'Rejected', count: statistics?.rejectedPayments || 0 },
                { key: 'submitted', label: 'Submitted', count: statistics?.submittedPayments || 0 }
              ].map((statusFilter) => (
                <button
                  key={statusFilter.key}
                  onClick={() => setFilter(statusFilter.key)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === statusFilter.key
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {statusFilter.label}
                  <span className="ml-2 bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-xs">
                    {statusFilter.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Payments Table */}
          <div className="card">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Recipient
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {payments.map((payment) => (
                    <tr key={payment.paymentID} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{payment.paymentID}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {payment.customerName || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <span className="font-semibold">
                            {formatCurrency(payment.amount, payment.currencyCode)}
                          </span>
                          <span className="ml-1 text-xs text-gray-500">
                            {payment.currencyCode}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <div className="font-medium">{payment.payeeAccount}</div>
                          <div className="text-xs text-gray-500">SWIFT: {payment.payeeSwiftCode}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(payment.status)}`}>
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(payment.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {payment.status === 'Pending' && (
                            <>
                              <button
                                onClick={() => handleVerifyPayment(payment.paymentID, 'Verified')}
                                disabled={actionLoading === payment.paymentID}
                                className="text-green-600 hover:text-green-900 disabled:opacity-50"
                              >
                                {actionLoading === payment.paymentID ? 'Processing...' : 'Verify'}
                              </button>
                              <button
                                onClick={() => handleVerifyPayment(payment.paymentID, 'Rejected')}
                                disabled={actionLoading === payment.paymentID}
                                className="text-red-600 hover:text-red-900 disabled:opacity-50"
                              >
                                {actionLoading === payment.paymentID ? 'Processing...' : 'Reject'}
                              </button>
                            </>
                          )}
                          {payment.status === 'Verified' && (
                            <button
                              onClick={() => handleSubmitPayment(payment.paymentID)}
                              disabled={actionLoading === payment.paymentID}
                              className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                            >
                              {actionLoading === payment.paymentID ? 'Processing...' : 'Submit'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {payments.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">💳</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No payments found</h3>
                <p className="text-gray-500">
                  {filter === 'all' 
                    ? 'No payments have been created yet.' 
                    : `No ${filter} payments found.`
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboardPage;


