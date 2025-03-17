// User related types
export interface User {
  id: number;
  phone: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profileImageId?: number;
  roles: string[];
  accountVerified: boolean;
  emailVerified: boolean;
}

export interface Role {
  id: number;
  name: string;
  permissions?: Permission[];
}

export interface Permission {
  id: number;
  name: string;
}

// Authentication related types
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface SignupRequest {
  phone: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  roles?: string[];
}

export interface JwtResponse {
  accessToken: string;
  refreshToken: string;
  type: string;
  id: number;
  username: string;
  email: string;
  roles: string[];
}

export interface TokenRefreshRequest {
  refreshToken: string;
}

export interface TokenRefreshResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
}

export interface EmailVerificationRequest {
  token: string;
}

export interface ResendVerificationRequest {
  email: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

// API response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

export interface MessageResponse {
  message: string;
}

// Error types
export interface ApiError {
  status: number;
  message: string;
  details?: string;
}

// Pagination types
export interface Page<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

// User filter types
export interface UserFilterParams {
  search?: string;
  emailVerified?: boolean;
  accountVerified?: boolean;
  roles?: string[];
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: string;
}
