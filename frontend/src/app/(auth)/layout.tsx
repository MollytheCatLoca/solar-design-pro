// src/app/(auth)/layout.tsx

import { Sun } from 'lucide-react';
import Link from 'next/link';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <Link href="/" className="inline-flex items-center space-x-2">
            <Sun className="h-8 w-8 text-amber-600" />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              SolarDesignPro
            </span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8">
          {/* Logo y título central */}
          <div className="text-center">
            <Sun className="mx-auto h-12 w-12 text-amber-600" />
            <h1 className="mt-4 text-3xl font-bold text-gray-900 dark:text-white">
              SolarDesignPro
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Diseña sistemas fotovoltaicos profesionales
            </p>
          </div>

          {/* Form container */}
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="absolute bottom-0 left-0 right-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            © 2024 SolarDesignPro. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}