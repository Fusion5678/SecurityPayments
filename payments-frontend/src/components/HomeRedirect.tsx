import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const HomeRedirect: React.FC = () => {
  const { isAuthenticated, loading, user } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Redirect employees and admins to employee dashboard
  if (user?.role === 'Employee' || user?.role === 'Admin') {
    return <Navigate to="/employee-dashboard" replace />;
  }

  // Redirect customers to dashboard
  return <Navigate to="/dashboard" replace />;
};

export default HomeRedirect;

