// src/middleware.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rutas públicas que no requieren autenticación
const publicPaths = ['/login', '/register', '/forgot-password'];

// Rutas que requieren autenticación
const protectedPaths = ['/', '/projects', '/components', '/settings'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Por ahora, vamos a verificar el token del localStorage mediante client-side
  // El middleware no puede acceder al localStorage directamente
  // En producción, deberíamos usar httpOnly cookies o session tokens
  
  // Solo redirigir si intentan acceder a rutas protegidas sin estar en login
  if (protectedPaths.some(path => pathname === path || pathname.startsWith(path + '/'))) {
    // Este check se hará del lado del cliente
    return NextResponse.next();
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};