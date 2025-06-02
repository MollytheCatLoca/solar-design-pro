// src/lib/api/auth.ts

import apiClient from './client';
import { AuthResponse, LoginCredentials, RegisterData, User } from '@/lib/types/auth.types';

export const authApi = {
  // Login
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const formData = new FormData();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);
    
    const { data } = await apiClient.post<AuthResponse>(
      '/api/v1/login/access-token',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    
    return data;
  },

  // Register
  register: async (userData: RegisterData): Promise<User> => {
    const { data } = await apiClient.post<User>('/api/v1/register', userData);
    return data;
  },

  // Get current user
  getMe: async (): Promise<User> => {
    const { data } = await apiClient.get<User>('/api/v1/users/me');
    return data;
  },

  // Update profile
  updateMe: async (userData: Partial<User>): Promise<User> => {
    const { data } = await apiClient.put<User>('/api/v1/users/me', userData);
    return data;
  },
};