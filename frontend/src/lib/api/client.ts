// src/lib/api/client.ts

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { toast } from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

// Crear instancia de Axios
export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor para agregar token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Obtener token del localStorage
    const token = localStorage.getItem('token');
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor para manejar errores
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<any>) => {
    const message = error.response?.data?.detail || 'Ha ocurrido un error';
    
    // Si el error es 401, limpiar token y redirigir a login
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // Solo redirigir si no estamos ya en la página de login
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    
    // Mostrar error con toast (excepto 401 en login)
    if (!(error.response?.status === 401 && window.location.pathname.includes('/login'))) {
      toast.error(typeof message === 'string' ? message : 'Error en la solicitud');
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;