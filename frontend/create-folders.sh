#!/bin/bash

echo "📁 Creando estructura de carpetas..."

# Crear carpetas para el dashboard
mkdir -p src/app/\(dashboard\)
mkdir -p src/app/\(dashboard\)/projects
mkdir -p src/app/\(dashboard\)/projects/new
mkdir -p src/app/\(dashboard\)/projects/\[id\]
mkdir -p src/app/\(dashboard\)/components
mkdir -p src/app/\(dashboard\)/settings

# Crear carpetas para componentes
mkdir -p src/components/layout
mkdir -p src/components/projects
mkdir -p src/components/dashboard

echo "✅ Estructura de carpetas creada!"