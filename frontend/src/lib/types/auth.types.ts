// src/lib/types/auth.types.ts

export interface User {
  id: number;
  email: string;
  full_name: string | null;
  is_active: boolean;
  is_superuser: boolean;
  created_at: string;
  updated_at: string | null;
}

export interface LoginCredentials {
  username: string; // El backend espera 'username' aunque sea email
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  full_name: string;
  is_superuser?: boolean;
  is_active?: boolean;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface ApiError {
  detail: string | { msg: string; type: string }[];
}