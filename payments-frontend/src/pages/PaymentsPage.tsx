import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { paymentAPI, Payment } from '../api/payment';
import PaymentTable from '../components/PaymentTable';

const PaymentsPage: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        const paymentsData = await paymentAPI.getAll();
        setPayments(paymentsData);
      } catch (error: any) {
        setError(error.message || 'Failed to load payments');
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  const filteredPayments = payments.filter(payment => {
    if (filter === 'all') return true;
    return payment.status.toLowerCase() === filter.toLowerCase();
  });

  const getStatusCounts = () => {
    const counts = {
      all: payments.length,
      pending: 0,
      verified: 0,
      submitted: 0
    };

    payments.forEach(payment => {
      const status = payment.status.toLowerCase();
      if (status in counts) {
        counts[status as keyof typeof counts]++;
      }
    });

    return counts;
  };

  const statusCounts = getStatusCounts();

  const statusFilters = [
    { key: 'all', label: 'All', count: statusCounts.all },
    { key: 'pending', label: 'Pending', count: statusCounts.pending },
    { key: 'verified', label: 'Verified', count: statusCounts.verified },
    { key: 'submitted', label: 'Submitted', count: statusCounts.submitted }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
                <p className="mt-2 text-gray-600">
                  View and manage all your payment transactions.
                </p>
              </div>
              <Link
                to="/create-payment"
                className="btn-primary"
              >
                Create New Payment
              </Link>
            </div>
          </div>

          {error && (
            <div className="mb-6 bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          {/* Status Filters */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              {statusFilters.map((statusFilter) => (
                <button
                  key={statusFilter.key}
                  onClick={() => setFilter(statusFilter.key)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === statusFilter.key
                      ? 'bg-primary-600 text-white'
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

          {/* Payment Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="card text-center">
              <h3 className="text-lg font-semibold text-gray-900">Total Payments</h3>
              <p className="text-3xl font-bold text-primary-600 mt-2">
                {statusCounts.all}
              </p>
            </div>
            
            <div className="card text-center">
              <h3 className="text-lg font-semibold text-gray-900">Pending</h3>
              <p className="text-3xl font-bold text-warning-600 mt-2">
                {statusCounts.pending}
              </p>
            </div>
            
            <div className="card text-center">
              <h3 className="text-lg font-semibold text-gray-900">Verified</h3>
              <p className="text-3xl font-bold text-success-600 mt-2">
                {statusCounts.verified}
              </p>
            </div>
            
            <div className="card text-center">
              <h3 className="text-lg font-semibold text-gray-900">Completed</h3>
              <p className="text-3xl font-bold text-success-600 mt-2">
                {statusCounts.completed}
              </p>
            </div>
          </div>

          {/* Payment Table */}
          <PaymentTable payments={filteredPayments} loading={loading} />

          {/* Summary */}
          {!loading && payments.length > 0 && (
            <div className="mt-6 text-center text-sm text-gray-500">
              Showing {filteredPayments.length} of {payments.length} payments
              {filter !== 'all' && ` (filtered by ${filter})`}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentsPage;


