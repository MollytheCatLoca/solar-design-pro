#!/bin/bash

echo "📦 Instalando dependencias para gestión de proyectos..."

# Instalar date-fns para formateo de fechas
npm install --legacy-peer-deps date-fns

# Instalar componentes de shadcn necesarios
echo "🧩 Instalando componentes UI..."

# Dialog para el modal
npx shadcn@latest add dialog -y

# Alert Dialog para confirmación de eliminar
npx shadcn@latest add alert-dialog -y

# Textarea para descripción
npx shadcn@latest add textarea -y

# Badge (útil para estados)
npx shadcn@latest add badge -y

echo "✅ ¡Dependencias instaladas!"
echo ""
echo "📋 Próximos pasos:"
echo "1. Copia los archivos de componentes a sus ubicaciones"
echo "2. Reinicia el servidor de desarrollo"
echo "3. Ve a /projects para ver la lista de proyectos"