import axios from 'axios';

// Create axios instance with secure configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true, // Send cookies automatically for HttpOnly authentication
  timeout: parseInt(import.meta.env.VITE_API_TIMEOUT), // Configurable timeout
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest', // CSRF protection
  },
});

// Request interceptor for CSRF tokens and error handling
api.interceptors.request.use(
  async (config) => {

  // Add CSRF token for state-changing requests (except for login, logout, and CSRF token requests)
  if (config.method && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(config.method.toUpperCase()) && 
      !config.url?.includes('/auth/csrf-token') && 
      !config.url?.includes('/auth/login') && 
      !config.url?.includes('/auth/logout')) {
      try {
        const csrfResponse = await api.get('/auth/csrf-token');
        if (csrfResponse.data?.token) {
          config.headers['X-CSRF-TOKEN'] = csrfResponse.data.token;
        }
      } catch (error) {
        // Allow the request to proceed without CSRF token
        // This prevents blocking legitimate requests if CSRF endpoint is unavailable
      }
    }

    return config;
  },
  (error) => {
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
      throw new Error('Network error. Please check your connection.');
    }

    // Handle HTTP errors
    const { status, data } = error.response;
    
    switch (status) {
      case 401:
        throw new Error('Unauthorized');
      case 403:
        throw new Error('Access denied');
      case 404:
        throw new Error('Resource not found');
      case 429:
        throw new Error('Too many requests. Please wait a moment and try again.');
      case 500:
        throw new Error('Server error. Please try again later.');
      default:
        throw new Error(data?.message || 'An unexpected error occurred');
    }
  }
);

export default api;
