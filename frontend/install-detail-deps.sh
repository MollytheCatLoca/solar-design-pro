#!/bin/bash

echo "📦 Instalando componentes UI para página de detalle..."

# Table para la lista de diseños
npx shadcn@latest add table -y

# Badge para estados
npx shadcn@latest add badge -y

echo "✅ ¡Componentes instalados!"
echo ""
echo "📋 Estructura de carpetas necesaria:"
echo "src/app/(dashboard)/projects/[id]/page.tsx"
echo ""
echo "Crea la carpeta [id] con:"
echo "mkdir -p 'src/app/(dashboard)/projects/[id]'"