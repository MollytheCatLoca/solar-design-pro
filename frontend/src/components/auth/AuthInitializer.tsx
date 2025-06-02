// src/components/auth/AuthInitializer.tsx

'use client';

const React = require('react');
import { useAuthStore } from '@/lib/stores/authStore';
import { authApi } from '@/lib/api/auth';

export default function AuthInitializer() {
  const { token, setUser, setLoading, logout } = useAuthStore();

  React.useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const user = await authApi.getMe();
          setUser(user);
        } catch (error) {
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [token, setUser, setLoading, logout]);

  return null;
}