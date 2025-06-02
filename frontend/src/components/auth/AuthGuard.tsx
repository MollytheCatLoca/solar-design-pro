// src/components/auth/AuthGuard.tsx

'use client';

const React = require('react');
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/authStore';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading, token } = useAuthStore();

  React.useEffect(() => {
    if (!isLoading && !isAuthenticated && !token) {
      const loginUrl = `/login${pathname !== '/' ? `?from=${pathname}` : ''}`;
      router.push(loginUrl);
    }
  }, [isAuthenticated, isLoading, token, router, pathname]);

  if (isLoading) {
    return (
      <div className= "flex h-screen items-center justify-center" >
      <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
        </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{ children } </>;
}