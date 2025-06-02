// src/lib/hooks/useAuth.ts

const React = require('react');
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuthStore } from '@/lib/stores/authStore';
import { authApi } from '@/lib/api/auth';
import { LoginCredentials, RegisterData } from '@/lib/types/auth.types';

export const useAuth = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const {
    user,
    token,
    isAuthenticated,
    isLoading,
    setUser,
    setToken,
    setLoading,
    logout: logoutStore,
    hydrate
  } = useAuthStore();

  // Hidratar el store al montar
  React.useEffect(() => {
    hydrate();
  }, [hydrate]);

  // Query para obtener usuario actual
  const { data: userData, refetch: refetchUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: authApi.getMe,
    enabled: !!token && !user,
    retry: false,
  });

  // Efecto para actualizar el usuario cuando se obtiene
  React.useEffect(() => {
    if (userData) {
      setUser(userData);
      setLoading(false);
    }
  }, [userData, setUser, setLoading]);

  // Efecto para manejar errores de autenticación
  React.useEffect(() => {
    if (token && !user && !isLoading) {
      refetchUser().catch(() => {
        logoutStore();
        setLoading(false);
      });
    }
  }, [token, user, isLoading, refetchUser, logoutStore, setLoading]);

  // Mutation para login
  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: async (data) => {
      setToken(data.access_token);
      toast.success('¡Bienvenido!');

      // Obtener datos del usuario
      try {
        const userData = await authApi.getMe();
        setUser(userData);
        // Invalidar queries relacionadas
        queryClient.invalidateQueries({ queryKey: ['currentUser'] });
        router.push('/dashboard');
      } catch (error) {
        toast.error('Error al obtener datos del usuario');
      }
    },
    onError: (error: any) => {
      const message = error.response?.data?.detail || 'Credenciales inválidas';
      toast.error(message);
    },
  });

  // Mutation para registro
  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: async (data) => {
      toast.success('¡Cuenta creada exitosamente!');

      // Redirigir a login para que ingrese su password
      router.push('/login?registered=true');
    },
    onError: (error: any) => {
      const message = error.response?.data?.detail || 'Error al crear la cuenta';
      toast.error(message);
    },
  });

  // Función de logout
  const logout = () => {
    logoutStore();
    queryClient.clear();
    toast.success('Sesión cerrada');
    router.push('/login');
  };

  // Función de login
  const login = async (credentials: LoginCredentials) => {
    return loginMutation.mutateAsync(credentials);
  };

  // Función de registro
  const register = async (data: RegisterData) => {
    return registerMutation.mutateAsync(data);
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    loginMutation,
    registerMutation,
    refetchUser,
  };
};