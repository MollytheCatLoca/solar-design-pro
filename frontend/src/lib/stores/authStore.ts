// src/lib/stores/authStore.ts

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { User } from '@/lib/types/auth.types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: true,

        setUser: (user) => set({ 
          user, 
          isAuthenticated: !!user 
        }),

        setToken: (token) => {
          if (token) {
            localStorage.setItem('token', token);
          } else {
            localStorage.removeItem('token');
          }
          set({ token });
        },

        setLoading: (isLoading) => set({ isLoading }),

        logout: () => {
          localStorage.removeItem('token');
          set({ 
            user: null, 
            token: null, 
            isAuthenticated: false 
          });
        },

        hydrate: () => {
          const token = localStorage.getItem('token');
          if (token) {
            set({ token, isLoading: true });
          } else {
            set({ isLoading: false });
          }
        },
      }),
      {
        name: 'auth-storage',
        partialize: (state) => ({ 
          // Solo persistir estos campos
          user: state.user,
          token: state.token,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    )
  )
);