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

export const paymentAPI = {
  // Create payment
  create: async (data: CreatePaymentRequest): Promise<Payment> => {
    const response = await api.post('/payment', data);
    return response.data;
  },

  // Get user's payments
  getAll: async (): Promise<Payment[]> => {
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
};

