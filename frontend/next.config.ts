// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // !! ADVERTENCIA !!
    // Permite builds aunque haya errores de TypeScript
    // Solo para desarrollo, corregir antes de producción
    ignoreBuildErrors: true,
  },
  eslint: {
    // Ignora errores de ESLint durante el build
    ignoreDuringBuilds: true,
  },
  // Configuración experimental para React 19
  experimental: {
    // Habilita las características de React 19
    reactCompiler: false,
  },
};

export default nextConfig;