import api from './api';
import { 
  JwtResponse, 
  LoginRequest, 
  SignupRequest, 
  TokenRefreshRequest, 
  TokenRefreshResponse,
  EmailVerificationRequest,
  ResendVerificationRequest,
  MessageResponse
} from '../types';
import { saveTokens, clearTokens } from './api';

class AuthService {
  /**
   * Login user with username and password
   */
  async login(loginRequest: LoginRequest): Promise<JwtResponse> {
    const response = await api.post<JwtResponse>('/auth/login', loginRequest);
    saveTokens(response.data);
    return response.data;
  }

  /**
   * Register a new user
   */
  async register(signupRequest: SignupRequest): Promise<MessageResponse> {
    const response = await api.post<MessageResponse>('/auth/register', signupRequest);
    return response.data;
  }

  /**
   * Logout user by clearing tokens
   */
  logout(): void {
    clearTokens();
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(request: TokenRefreshRequest): Promise<TokenRefreshResponse> {
    const response = await api.post<TokenRefreshResponse>('/auth/refresh-token', request);
    return response.data;
  }

  /**
   * Verify email with verification token
   */
  async verifyEmail(request: EmailVerificationRequest): Promise<MessageResponse> {
    const response = await api.post<MessageResponse>('/auth/verify-email', request);
    return response.data;
  }

  /**
   * Resend verification email
   */
  async resendVerification(request: ResendVerificationRequest): Promise<MessageResponse> {
    const response = await api.post<MessageResponse>('/auth/resend-verification', request);
    return response.data;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = localStorage.getItem('auth-token');
    return !!token;
  }
}

export default new AuthService();
