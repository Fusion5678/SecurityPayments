import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { sanitizeInput } from '../utils/validation';

interface FormData {
  username: string;
  password: string;
}

const LoginPage: React.FC = () => {
  const { login, isAuthenticated } = useAuth();
  const { addNotification } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    username: '',
    password: ''
  });

  // Get the intended destination from location state
  const from = location.state?.from?.pathname || '/dashboard';

  // Redirect authenticated users to dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const sanitizedValue = sanitizeInput(value);
    
    setFormData(prev => ({
      ...prev,
      [name]: sanitizedValue
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.username.trim() || !formData.password) {
      addNotification({
        type: 'error',
        title: 'Validation Error',
        message: 'Please enter both username and password'
      });
      return;
    }

    setLoading(true);

    try {
      await login(formData.username.trim(), formData.password);
      addNotification({
        type: 'success',
        title: 'Login Successful',
        message: 'Welcome back! Redirecting to dashboard...'
      });
      navigate(from, { replace: true });
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Login Failed',
        message: error.message || 'Invalid username or password. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link
              to="/register"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              create a new account
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>

          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username or Email
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={formData.username}
                onChange={handleInputChange}
                className="mt-1 input-field"
                placeholder="Enter your username or email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleInputChange}
                className="mt-1 input-field"
                placeholder="Enter your password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default LoginPage;


