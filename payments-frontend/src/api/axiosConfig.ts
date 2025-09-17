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

// Request interceptor for logging, CSRF tokens, and error handling
api.interceptors.request.use(
  async (config) => {
    // Log requests in development
    if (import.meta.env.VITE_ENABLE_DEBUG === 'true') {
      console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    }

    // Add CSRF token for state-changing requests (except for CSRF token requests)
    if (config.method && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(config.method.toUpperCase()) && 
        !config.url?.includes('/auth/csrf-token')) {
      try {
        const csrfResponse = await api.get('/auth/csrf-token');
        if (csrfResponse.data?.token) {
          config.headers['X-CSRF-TOKEN'] = csrfResponse.data.token;
          console.log('CSRF token added:', csrfResponse.data.token);
        } else {
          console.warn('CSRF token response missing token field');
        }
      } catch (error) {
        console.error('Failed to get CSRF token:', error);
        // For now, allow the request to proceed without CSRF token
        // In production, you might want to throw an error here
        console.warn('Proceeding without CSRF token');
      }
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
        // Unauthorized - this is expected for unauthenticated users
        console.log('User not authenticated');
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
