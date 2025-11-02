import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import ProtectedRoute from './components/ProtectedRoute';
import HomeRedirect from './components/HomeRedirect';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import EmployeeDashboardPage from './pages/EmployeeDashboardPage';
import CreatePaymentPage from './pages/CreatePaymentPage';
import PaymentsPage from './pages/PaymentsPage';
import BankAccountsPage from './pages/BankAccountsPage';
import ProfilePage from './pages/ProfilePage';

const App: React.FC = () => {
  return (
    <NotificationProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main>
              <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              
              {/* Protected Routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute requiredRole="Customer">
                  <DashboardPage />
                </ProtectedRoute>
              } />
              
              <Route path="/employee-dashboard" element={
                <ProtectedRoute requiredRole="Employee">
                  <EmployeeDashboardPage />
                </ProtectedRoute>
              } />
              
              <Route path="/create-payment" element={
                <ProtectedRoute requiredRole="Customer">
                  <CreatePaymentPage />
                </ProtectedRoute>
              } />
              
              <Route path="/payments" element={
                <ProtectedRoute requiredRole="Customer">
                  <PaymentsPage />
                </ProtectedRoute>
              } />
              
              <Route path="/bank-accounts" element={
                <ProtectedRoute requiredRole="Customer">
                  <BankAccountsPage />
                </ProtectedRoute>
              } />
              
              <Route path="/profile" element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } />
              
              {/* Root route - redirect based on user role */}
              <Route path="/" element={<HomeRedirect />} />
              
              {/* Catch all route - redirect to login */}
              <Route path="*" element={<Navigate to="/login" replace />} />
              </Routes>
            </main>
          </div>
        </Router>
      </AuthProvider>
    </NotificationProvider>
  );
};

export default App;
