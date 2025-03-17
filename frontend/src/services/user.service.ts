import api from './api';
import { User, ApiResponse, MessageResponse, UserFilterParams, Page } from '../types';

export const userService = {
  getCurrentUser: async () => {
    return api.get<User>('/users/me');
  },
  
  uploadProfileImage: async (userId: number, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    return api.post<User>(`/users/${userId}/profile-image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  getUserById: async (id: number) => {
    return api.get<ApiResponse<User>>(`/users/${id}`);
  },
  
  getAllUsers: async () => {
    return api.get<User[]>('/users');
  },
  
  updateUser: async (id: number, userData: Partial<User>) => {
    return api.put<ApiResponse<User>>(`/users/${id}`, userData);
  },
  
  deleteUser: async (id: number) => {
    return api.delete<ApiResponse<void>>(`/users/${id}`);
  },
  
  assignRoles: async (id: number, roles: string[]) => {
    return api.post<ApiResponse<User>>(`/users/${id}/roles`, roles);
  },
  
  verifyAccount: async (id: number) => {
    return api.post<ApiResponse<void>>(`/users/${id}/verify`);
  },
  
  changePassword: async (currentPassword: string, newPassword: string) => {
    return api.post<MessageResponse>('/users/change-password', {
      currentPassword,
      newPassword
    });
  },
  
  searchUsers: async (params: UserFilterParams) => {
    const queryParams = new URLSearchParams();
    
    if (params.search) queryParams.append('search', params.search);
    if (params.emailVerified !== undefined) queryParams.append('emailVerified', params.emailVerified.toString());
    if (params.accountVerified !== undefined) queryParams.append('accountVerified', params.accountVerified.toString());
    if (params.roles && params.roles.length > 0) {
      params.roles.forEach(role => queryParams.append('roles', role));
    }
    if (params.page !== undefined) queryParams.append('page', params.page.toString());
    if (params.size !== undefined) queryParams.append('size', params.size.toString());
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortDir) queryParams.append('sortDir', params.sortDir);
    
    return api.get<ApiResponse<Page<User>>>(`/users/search?${queryParams.toString()}`);
  }
};

export default userService;
