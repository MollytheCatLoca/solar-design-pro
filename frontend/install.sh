#!/bin/bash

# Script para instalar las dependencias correctas para Next.js 15 con React 19

echo "🚀 Instalando dependencias para SolarDesignPro Frontend..."

# Limpiar cache de npm
npm cache clean --force

# Instalar dependencias con --legacy-peer-deps para React 19
echo "📦 Instalando dependencias principales..."
npm install --legacy-peer-deps \
  @hookform/resolvers@^3.3.4 \
  @tanstack/react-query@^5.17.19 \
  @tanstack/react-query-devtools@^5.17.19 \
  axios@^1.6.5 \
  lucide-react@latest \
  react-hook-form@^7.48.2 \
  react-hot-toast@^2.4.1 \
  zod@^3.22.4 \
  zustand@^4.4.7 \
  class-variance-authority@^0.7.0 \
  clsx@^2.1.0 \
  tailwind-merge@^2.2.0 \
  tailwindcss-animate@^1.0.7

echo "🎨 Configurando shadcn..."

# Instalar componentes base de shadcn (nueva sintaxis)
npx shadcn@latest init -y

# Instalar componentes específicos de shadcn
echo "📦 Instalando componentes de UI..."
npx shadcn@latest add button -y
npx shadcn@latest add card -y
npx shadcn@latest add input -y
npx shadcn@latest add label -y

echo "✅ Instalación completada!"
echo "📝 Ahora crea el archivo .env.local con las variables de entorno"
echo "🎯 Luego ejecuta: npm run dev"