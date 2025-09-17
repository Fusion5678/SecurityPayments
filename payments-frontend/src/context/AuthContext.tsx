import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../api/auth';
import { authAPI } from '../api/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: {
    fullName: string;
    username: string;
    email: string;
    password: string;
    role: string;
    idNumber?: string;
    employeeNumber?: string;
  }) => Promise<void>;
  updateUser: (userData: User) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user is authenticated on app load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await authAPI.getCurrentUser();
        setUser(userData);
      } catch (error) {
        // User is not authenticated - this is normal for unauthenticated users
        if (error instanceof Error && error.message === 'Unauthorized') {
          console.log('User not authenticated - this is normal');
        } else {
          console.error('Authentication check failed:', error);
        }
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (username: string, password: string): Promise<void> => {
    try {
      const userData = await authAPI.login({ username, password });
      setUser(userData);
    } catch (error) {
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authAPI.logout();
    } catch (error) {
      // Even if logout fails on server, clear local state
      console.error('Logout error:', error);
    } finally {
      setUser(null);
    }
  };

  const register = async (userData: {
    fullName: string;
    username: string;
    email: string;
    password: string;
    role: string;
    idNumber?: string;
    employeeNumber?: string;
  }): Promise<void> => {
    try {
      const newUser = await authAPI.register(userData);
      setUser(newUser);
    } catch (error) {
      throw error;
    }
  };

  const updateUser = (userData: User): void => {
    setUser(userData);
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    register,
    updateUser,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

