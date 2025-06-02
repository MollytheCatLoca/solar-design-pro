#!/bin/bash

echo "🧩 Instalando componentes UI faltantes..."

# Instalar dropdown-menu para el Navbar
echo "📦 Instalando dropdown-menu..."
npx shadcn@latest add dropdown-menu -y

# Instalar avatar para el user menu
echo "📦 Instalando avatar..."
npx shadcn@latest add avatar -y

# Instalar skeleton para loading states
echo "📦 Instalando skeleton..."
npx shadcn@latest add skeleton -y

# Crear el archivo de utilidades si no existe
echo "🔧 Verificando archivo de utilidades..."
if [ ! -f "src/lib/utils.ts" ]; then
  mkdir -p src/lib
  cat > src/lib/utils.ts << 'EOF'
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
EOF
  echo "✅ Archivo utils.ts creado"
fi

echo "✅ ¡Componentes instalados!"