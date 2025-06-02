// src/app/(auth)/register/page.tsx

import { Suspense } from 'react';
import RegisterForm from '@/components/auth/RegisterForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Crear Cuenta - SolarDesignPro',
  description: 'Crea tu cuenta en SolarDesignPro',
};

export default function RegisterPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <RegisterForm />
    </Suspense>
  );
}