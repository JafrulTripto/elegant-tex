import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { User, Role } from '../types';
import userService from '../services/user.service';
import api from '../services/api';

interface UseUserDataProps {
  initialFetch?: boolean;
}

interface UseUserDataReturn {
  users: User[];
  roles: Role[];
  loading: boolean;
  error: string | null;
  success: string | null;
  totalPages: number;
  totalElements: number;
  fetchUsers: () => Promise<void>;
  createUser: (userData: UserFormData) => Promise<void>;
  updateUser: (userId: number, userData: UserFormData) => Promise<void>;
  deleteUser: (userId: number) => Promise<void>;
  verifyUser: (userId: number) => Promise<void>;
  clearMessages: () => void;
}

export interface UserFormData {
  phone: string;
  email: string;
  firstName: string;
  lastName: string;
  roleIds: string[];
  accountVerified: boolean;
  password?: string;
}

export const useUserData = (
  filterParams: any,
  { initialFetch = true }: UseUserDataProps = {}
): UseUserDataReturn => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalElements, setTotalElements] = useState<number>(0);

  // Fetch roles
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setLoading(true);
        const rolesResponse = await api.get('/roles');
        setRoles(Array.isArray(rolesResponse.data) ? rolesResponse.data : []);
        setLoading(false);
      } catch (err) {
        setLoading(false);
        if (axios.isAxiosError(err)) {
          setError(err.message || 'Failed to fetch roles');
        } else {
          const errorMessage = (err as Error)?.message ?? 'Failed to fetch roles';
          setError(errorMessage);
        }
      }
    };
    
    fetchRoles();
  }, []);

  // Fetch users
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      
      const response = await userService.searchUsers(filterParams);
      
      if (response.data) {
        const responseData = response.data as any;
        
        if (responseData.content) {
          setUsers(responseData.content);
          setTotalPages(responseData.totalPages);
          setTotalElements(responseData.totalElements || 0);
        } else if (responseData.data && responseData.data.content) {
          setUsers(responseData.data.content);
          setTotalPages(responseData.data.totalPages);
          setTotalElements(responseData.data.totalElements || 0);
        } else {
          setUsers([]);
          setTotalPages(1);
        }
      } else {
        setUsers([]);
        setTotalPages(1);
      }
      
      setLoading(false);
    } catch (err) {
      setLoading(false);
      if (axios.isAxiosError(err)) {
        setError(err.message || 'Failed to fetch users');
      } else {
        const errorMessage = (err as Error)?.message ?? 'Failed to fetch users';
        setError(errorMessage);
      }
    }
  }, [filterParams]);

  // Initial fetch
  useEffect(() => {
    if (initialFetch) {
      fetchUsers();
    }
  }, [fetchUsers, initialFetch]);

  // Create user
  const createUser = async (userData: UserFormData) => {
    try {
      setLoading(true);
      
      await api.post('/auth/register', {
        phone: userData.phone,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        roles: userData.roleIds,
        password: userData.password
      });
      
      setSuccess('User created successfully');
      await fetchUsers();
      setLoading(false);
    } catch (err) {
      setLoading(false);
      if (axios.isAxiosError(err)) {
        setError(err.message || 'Failed to create user');
      } else {
        const errorMessage = (err as Error)?.message ?? 'Failed to create user';
        setError(errorMessage);
      }
      throw err;
    }
  };

  // Update user
  const updateUser = async (userId: number, userData: UserFormData) => {
    try {
      setLoading(true);
      
      await api.put(`/users/${userId}`, {
        phone: userData.phone,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        roles: userData.roleIds,
        accountVerified: userData.accountVerified
      });
      
      setSuccess('User updated successfully');
      await fetchUsers();
      setLoading(false);
    } catch (err) {
      setLoading(false);
      if (axios.isAxiosError(err)) {
        setError(err.message || 'Failed to update user');
      } else {
        const errorMessage = (err as Error)?.message ?? 'Failed to update user';
        setError(errorMessage);
      }
      throw err;
    }
  };

  // Delete user
  const deleteUser = async (userId: number) => {
    try {
      setLoading(true);
      
      await api.delete(`/users/${userId}`);
      
      setSuccess('User deleted successfully');
      await fetchUsers();
      setLoading(false);
    } catch (err) {
      setLoading(false);
      if (axios.isAxiosError(err)) {
        setError(err.message || 'Failed to delete user');
      } else {
        const errorMessage = (err as Error)?.message ?? 'Failed to delete user';
        setError(errorMessage);
      }
    }
  };

  // Verify user
  const verifyUser = async (userId: number) => {
    try {
      setLoading(true);
      
      await api.post(`/users/${userId}/verify`);
      
      setSuccess('User verified successfully');
      await fetchUsers();
      setLoading(false);
    } catch (err) {
      setLoading(false);
      if (axios.isAxiosError(err)) {
        setError(err.message || 'Failed to verify user');
      } else {
        const errorMessage = (err as Error)?.message ?? 'Failed to verify user';
        setError(errorMessage);
      }
    }
  };

  // Clear messages
  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  return {
    users,
    roles,
    loading,
    error,
    success,
    totalPages,
    totalElements,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    verifyUser,
    clearMessages
  };
};
