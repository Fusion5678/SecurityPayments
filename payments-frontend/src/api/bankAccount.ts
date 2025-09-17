import api from './axiosConfig';

export interface BankAccount {
  accountID: number;
  userID: number;
  accountNumber: string;
  accountType: string;
  balance: number;
  currencyCode: string;
  currencyName: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBankAccountRequest {
  accountNumber: string;
  accountType: string;
  currencyCode: string;
  balance?: number;
}

export interface UpdateBankAccountRequest {
  accountNumber?: string;
  accountType?: string;
  currencyCode?: string;
  balance?: number;
}

export const bankAccountAPI = {
  // Create bank account
  create: async (data: CreateBankAccountRequest): Promise<BankAccount> => {
    const response = await api.post('/bankaccount', data);
    return response.data;
  },

  // Get user's bank accounts
  getAll: async (): Promise<BankAccount[]> => {
    const response = await api.get('/bankaccount');
    return response.data;
  },

  // Get specific bank account
  getById: async (id: number): Promise<BankAccount> => {
    const response = await api.get(`/bankaccount/${id}`);
    return response.data;
  },

  // Update bank account
  update: async (id: number, data: UpdateBankAccountRequest): Promise<BankAccount> => {
    const response = await api.put(`/bankaccount/${id}`, data);
    return response.data;
  },

  // Delete bank account
  delete: async (id: number): Promise<{ message: string }> => {
    const response = await api.delete(`/bankaccount/${id}`);
    return response.data;
  },
};
