import api from './axiosConfig';

export interface PaymentVerification {
  verificationID: number;
  paymentID: number;
  employeeID: number;
  employeeName: string;
  verifiedAt: string;
  action: string;
}

export interface Payment {
  paymentID: number;
  accountID: number;
  accountNumber: string;
  accountType: string;
  amount: number;
  currencyCode: string;
  currencyName: string;
  payeeAccount: string;
  payeeSwiftCode: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  customerName?: string; // For employee view
  verifications: PaymentVerification[];
}

export interface CreatePaymentRequest {
  accountID: number;
  amount: number;
  currencyCode: string;
  payeeAccount: string;
  payeeSwiftCode: string;
}

export interface PaymentVerificationRequest {
  action: string;
}

export interface PaymentStatistics {
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

export const paymentAPI = {
  // Create payment
  create: async (data: CreatePaymentRequest): Promise<Payment> => {
    const response = await api.post('/payment', data);
    return response.data;
  },

  // Get user's payments
  getUserPayments: async (): Promise<Payment[]> => {
    const response = await api.get('/payment');
    return response.data;
  },

  // Get specific payment
  getById: async (id: number): Promise<Payment> => {
    const response = await api.get(`/payment/${id}`);
    return response.data;
  },

  // Verify payment (for employees)
  verify: async (id: number, data: PaymentVerificationRequest): Promise<{ message: string }> => {
    const response = await api.post(`/payment/${id}/verify`, data);
    return response.data;
  },

  // Get all payments (for employees)
  getAll: async (status?: string): Promise<Payment[]> => {
    const params = status ? { status } : {};
    const response = await api.get('/payment/all', { params });
    return response.data;
  },

  // Verify payment with action (for employees)
  verifyPayment: async (id: number, action: 'Verified' | 'Rejected'): Promise<{ message: string }> => {
    const response = await api.post(`/payment/${id}/verify`, { action });
    return response.data;
  },

  // Submit payment (for employees)
  submitPayment: async (id: number): Promise<{ message: string }> => {
    const response = await api.post(`/payment/${id}/submit`);
    return response.data;
  },

  // Get payment statistics (for employees)
  getStatistics: async (): Promise<PaymentStatistics> => {
    const response = await api.get('/payment/statistics');
    return response.data;
  },
};

