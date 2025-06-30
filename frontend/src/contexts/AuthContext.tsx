import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { AuthState } from '../types';
import authService from '../services/auth.service';
import userService from '../services/user.service';
import axios from 'axios';
import { useToast } from './ToastContext';

export interface AuthContextType {
  authState: AuthState;
  login: (username: string, password: string) => Promise<void>;
  register: (phone: string, email: string, password: string, firstName: string, lastName?: string) => Promise<void>;
  logout: () => void;
  loadUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const initialAuthState: AuthState = {
  isAuthenticated: false,
  user: null,
  loading: true,
  error: null,
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>(initialAuthState);
  const { showToast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      if (authService.isAuthenticated()) {
        try {
          await loadUser();
        } catch (error) {
          console.error('Failed to load user:', error);
          authService.logout();
          setAuthState({
            isAuthenticated: false,
            user: null,
            loading: false,
            error: 'Session expired. Please login again.',
          });
          showToast('Session expired. Please login again.', 'error');
        }
      } else {
        setAuthState({
          ...initialAuthState,
          loading: false,
        });
      }
    };

    checkAuth();
  }, []);

  const loadUser = async (): Promise<void> => {
    try {
      setAuthState(prev => ({ ...prev, loading: true }));
      const res = await userService.getCurrentUser();
      const user = res.data;      
      setAuthState({
        isAuthenticated: true,
        user,
        loading: false,
        error: null,
      });
    } catch (error) {
      setAuthState({
        isAuthenticated: false,
        user: null,
        loading: false,
        error: 'Failed to load user data',
      });
      throw error;
    }
  };

  const login = async (username: string, password: string): Promise<void> => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      await authService.login({ username, password });
      await loadUser();
      showToast('Login successful!', 'success');
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setAuthState({
          isAuthenticated: false,
          user: null,
          loading: false,
          error: error.response?.data?.message || 'Login failed',
        });
      } else {
        setAuthState({
          isAuthenticated: false,
          user: null,
          loading: false,
          error: 'An unexpected error occurred',
        });
      }
      throw error;
    }
  };

  const register = async (phone: string, email: string, password: string, firstName: string, lastName?: string): Promise<void> => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      await authService.register({ phone, email, password, firstName, lastName });
      setAuthState(prev => ({ ...prev, loading: false }));
      showToast('Registration successful! Please check your email to verify your account.', 'success');
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: 'Registration failed',
      }));
      throw error;
    }
  };

  // Logout user
  const logout = (): void => {
    authService.logout();
    setAuthState({
      isAuthenticated: false,
      user: null,
      loading: false,
      error: null,
    });
    showToast('You have been logged out', 'info');
  };

  return (
    <AuthContext.Provider
      value={{
        authState,
        login,
        register,
        logout,
        loadUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
