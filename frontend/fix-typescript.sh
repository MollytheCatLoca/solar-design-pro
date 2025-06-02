#!/bin/bash

echo "🔧 Arreglando la configuración de TypeScript..."

# Verificar si TypeScript está instalado
if [ ! -d "node_modules/typescript" ]; then
    echo "📦 Instalando TypeScript..."
    npm install --save-dev typescript@latest
fi

# Verificar la ruta de TypeScript
TS_PATH=$(pwd)/node_modules/typescript/lib

echo "📍 TypeScript path: $TS_PATH"

# Crear/actualizar la configuración de VS Code
mkdir -p .vscode

cat > .vscode/settings.json << EOF
{
  "typescript.tsdk": "./node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "typescript.preferences.includePackageJsonAutoImports": "on",
  "typescript.updateImportsOnFileMove.enabled": "always",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "typescript.validate.enable": true,
  "javascript.validate.enable": false
}
EOF

echo "✅ Configuración actualizada"
echo ""
echo "🔄 Ahora en VS Code:"
echo "1. Presiona Cmd+Shift+P"
echo "2. Busca 'TypeScript: Select TypeScript Version'"
echo "3. Selecciona 'Use Workspace Version'"
echo ""
echo "O simplemente reinicia VS Code"