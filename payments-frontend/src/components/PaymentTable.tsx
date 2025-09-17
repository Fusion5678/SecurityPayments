import React from 'react';
import { Payment } from '../api/payment';

interface PaymentTableProps {
  payments: Payment[];
  loading?: boolean;
}

const PaymentTable: React.FC<PaymentTableProps> = ({ payments, loading = false }) => {
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

  const getRowClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-warning-50 border-l-4 border-warning-400';
      case 'verified':
        return 'bg-success-50 border-l-4 border-success-400';
      case 'submitted':
        return 'bg-primary-50 border-l-4 border-primary-400';
      default:
        return 'bg-gray-50 border-l-4 border-gray-400';
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
      <div className="card">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <span className="ml-2 text-gray-600">Loading payments...</span>
        </div>
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <div className="card">
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">💳</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No payments found</h3>
          <p className="text-gray-500 mb-4">You haven't made any payments yet.</p>
          <a
            href="/create-payment"
            className="btn-primary"
          >
            Create Your First Payment
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Payment ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Recipient Account
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                From Account
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {payments.map((payment) => (
              <tr
                key={payment.paymentID}
                className={`hover:bg-gray-50 transition-colors ${getRowClass(payment.status)}`}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  #{payment.paymentID}
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
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div>
                    <div className="font-medium">{payment.accountNumber}</div>
                    <div className="text-xs">{payment.accountType}</div>
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Payment Verification Details */}
      {payments.some(p => p.verifications && p.verifications.length > 0) && (
        <div className="mt-6 border-t border-gray-200 pt-6">
          <h4 className="text-sm font-medium text-gray-900 mb-4">Verification History</h4>
          <div className="space-y-4">
            {payments
              .filter(p => p.verifications && p.verifications.length > 0)
              .map((payment) => (
                <div key={payment.paymentID} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">
                      Payment #{payment.paymentID}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusClass(payment.status)}`}>
                      {payment.status}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {payment.verifications.map((verification) => (
                      <div key={verification.verificationID} className="flex items-center justify-between text-xs text-gray-600">
                        <span>
                          {verification.action} - {formatDate(verification.verifiedAt)}
                          {verification.employeeName && ` by ${verification.employeeName}`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentTable;


