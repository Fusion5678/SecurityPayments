import api from './axiosConfig';

export interface User {
  userID: number;
  fullName: string;
  username: string;
  email: string;
  role: string;
  idNumber?: string;
  employeeNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfileUpdate {
  fullName: string;
  email: string;
  idNumber?: string;
  employeeNumber?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  username: string;
  email: string;
  password: string;
  role: string;
  idNumber?: string;
  employeeNumber?: string;
}

export interface AuthResponse {
  message: string;
}

export const authAPI = {
  // Register new user
  register: async (data: RegisterRequest): Promise<User> => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  // Login user
  login: async (data: LoginRequest): Promise<User> => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  // Logout user
  logout: async (): Promise<AuthResponse> => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  // Get current user
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Update user profile
  updateProfile: async (data: UserProfileUpdate): Promise<User> => {
    const response = await api.put('/auth/profile', data);
    return response.data;
  },

  // Change password
  changePassword: async (data: ChangePasswordRequest): Promise<{ message: string }> => {
    const response = await api.put('/auth/change-password', data);
    return response.data;
  },

  // Check username availability
  checkUsername: async (username: string): Promise<{ available: boolean }> => {
    const response = await api.get(`/auth/check-username/${encodeURIComponent(username)}`);
    return response.data;
  },

  // Check email availability
  checkEmail: async (email: string): Promise<{ available: boolean }> => {
    const response = await api.get(`/auth/check-email/${encodeURIComponent(email)}`);
    return response.data;
  },

  // Check ID number availability
  checkIdNumber: async (idNumber: string): Promise<{ available: boolean }> => {
    const response = await api.get(`/auth/check-idnumber/${encodeURIComponent(idNumber)}`);
    return response.data;
  },
};

