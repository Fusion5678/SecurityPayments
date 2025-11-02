import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const HomeRedirect: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

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

