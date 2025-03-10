import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiError, JwtResponse, TokenRefreshResponse } from '../types';
import { API_BASE_URL } from '../config/env';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token storage keys
const TOKEN_KEY = 'auth-token';
const REFRESH_TOKEN_KEY = 'auth-refresh-token';

// Helper functions for token management
export const getToken = (): string | null => localStorage.getItem(TOKEN_KEY);
export const setToken = (token: string): void => localStorage.setItem(TOKEN_KEY, token);
export const removeToken = (): void => localStorage.removeItem(TOKEN_KEY);

export const getRefreshToken = (): string | null => localStorage.getItem(REFRESH_TOKEN_KEY);
export const setRefreshToken = (token: string): void => localStorage.setItem(REFRESH_TOKEN_KEY, token);
export const removeRefreshToken = (): void => localStorage.removeItem(REFRESH_TOKEN_KEY);

export const saveTokens = (response: JwtResponse): void => {  
  setToken(response.accessToken );
  setRefreshToken(response.refreshToken);
};

export const clearTokens = (): void => {
  removeToken();
  removeRefreshToken();
};

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling token refresh
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;
    
    // If error is 401 and not already retrying
    if (error.response?.status === 401 && originalRequest && !(originalRequest as any)._retry) {
      (originalRequest as any)._retry = true;
      
      try {
        const refreshToken = getRefreshToken();
        if (!refreshToken) {
          // No refresh token available, logout user
          clearTokens();
          return Promise.reject(error);
        }
        
        // Try to refresh the token
        const response = await axios.post<TokenRefreshResponse>(
          `${API_BASE_URL}/auth/refreshtoken`,
          { refreshToken }
        );
        
        // Save new tokens
        setToken(response.data.accessToken);
        setRefreshToken(response.data.refreshToken);
        
        // Retry the original request with new token
        if (originalRequest.headers) {
          originalRequest.headers['Authorization'] = `Bearer ${response.data.accessToken}`;
        }
        
        return axios(originalRequest);
      } catch (refreshError) {
        // If refresh token is invalid, logout user
        clearTokens();
        return Promise.reject(refreshError);
      }
    }
    
    // Format error response
    const apiError: ApiError = {
      status: error.response?.status || 500,
      message: ((error.response?.data as any)?.message) || error.message || 'An unexpected error occurred',
      details: ((error.response?.data as any)?.details) || '',
    };
    
    return Promise.reject(apiError);
  }
);

export default api;
