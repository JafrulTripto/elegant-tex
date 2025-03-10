import api from './api';
import { User } from '../types';
import { ApiResponse } from '../types';
import { MessageResponse } from '../types';

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
  }
};

export default userService;
