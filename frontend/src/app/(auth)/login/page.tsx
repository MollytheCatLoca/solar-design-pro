// src/app/(auth)/login/page.tsx

import { Suspense } from 'react';
import LoginForm from '@/components/auth/LoginForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Iniciar Sesión - SolarDesignPro',
  description: 'Inicia sesión en tu cuenta de SolarDesignPro',
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <LoginForm />
    </Suspense>
  );
}