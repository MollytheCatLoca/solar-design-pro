#!/bin/bash
# backend/fix_models_structure.sh

echo "=== Arreglando estructura de models ==="

# Opción A: Si models.py está en app/ y quieres moverlo a app/models/
if [ -f "app/models.py" ] && [ -d "app/models" ]; then
    echo "Moviendo app/models.py a app/models/"
    mv app/models.py app/models/
    
    # Crear __init__.py correcto
    cat > app/models/__init__.py << 'EOF'
# backend/app/models/__init__.py
from .models import User, Project

__all__ = ["User", "Project"]
EOF
    echo "✓ Estructura arreglada (Opción A)"

# Opción B: Si quieres eliminar el directorio models/ y mantener models.py en app/
elif [ -f "app/models.py" ] && [ -d "app/models" ]; then
    echo "¿Quieres eliminar app/models/ y mantener models.py en app/? (y/n)"
    read -r response
    if [ "$response" = "y" ]; then
        rm -rf app/models/
        echo "✓ Directorio app/models/ eliminado"
    fi

# Opción C: Si models.py ya está en app/models/
elif [ -f "app/models/models.py" ]; then
    echo "models.py ya está en app/models/"
    # Asegurar que __init__.py es correcto
    cat > app/models/__init__.py << 'EOF'
# backend/app/models/__init__.py
from .models import User, Project

__all__ = ["User", "Project"]
EOF
    echo "✓ __init__.py actualizado"
else
    echo "✗ Estructura no reconocida. Por favor verifica manualmente."
    echo "  Archivos encontrados:"
    ls -la app/
    [ -d "app/models" ] && ls -la app/models/
fi

echo "=== Fin ==="