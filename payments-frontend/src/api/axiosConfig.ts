import axios from 'axios';

// Create axios instance with secure configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'https://localhost:5001/api',
  withCredentials: true, // Send cookies automatically for HttpOnly authentication
  timeout: parseInt(process.env.REACT_APP_API_TIMEOUT || '10000'), // Configurable timeout
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest', // CSRF protection
  },
});

// Request interceptor for logging and error handling
api.interceptors.request.use(
  (config) => {
    // Log requests in development
    if (process.env.REACT_APP_ENABLE_DEBUG === 'true') {
      console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for global error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle network errors
    if (!error.response) {
      console.error('Network Error:', error.message);
      throw new Error('Network error. Please check your connection.');
    }

    // Handle HTTP errors
    const { status, data } = error.response;
    
    switch (status) {
      case 401:
        // Unauthorized - let React Router handle the redirect
        console.warn('Unauthorized access');
        throw new Error('Unauthorized');
      case 403:
        console.error('Forbidden access');
        throw new Error('Access denied');
      case 404:
        console.error('Resource not found');
        throw new Error('Resource not found');
      case 500:
        console.error('Server error');
        throw new Error('Server error. Please try again later.');
      default:
        console.error(`HTTP Error ${status}:`, data);
        throw new Error(data?.message || 'An unexpected error occurred');
    }
  }
);

export default api;
