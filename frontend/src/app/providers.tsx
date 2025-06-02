// src/app/providers.tsx

'use client';

const React = require('react');
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'sonner';
import AuthInitializer from '@/components/auth/AuthInitializer';

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minuto
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client= { queryClient } >
    <AuthInitializer />
  { children }
  <Toaster 
        position="top-right"
  richColors
  closeButton
    />
    <ReactQueryDevtools initialIsOpen={ false } />
      </QueryClientProvider>
  );
}