import api from './axiosConfig';

export interface Currency {
  currencyCode: string;
  currencyName: string;
}

export const currencyAPI = {
  // Get all active currencies
  getAll: async (): Promise<Currency[]> => {
    const response = await api.get('/currency');
    return response.data;
  },

  // Get specific currency
  getByCode: async (code: string): Promise<Currency> => {
    const response = await api.get(`/currency/${code}`);
    return response.data;
  },
};

