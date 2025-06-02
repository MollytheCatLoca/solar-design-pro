#!/usr/bin/env python3
# backend/fix_imports.py

import os

# Arreglar app/models/models.py
models_file = 'app/models/models.py'
if os.path.exists(models_file):
    print(f"Arreglando {models_file}...")
    
    with open(models_file, 'r') as f:
        content = f.read()
    
    # Reemplazar la importación incorrecta
    content = content.replace(
        'from .database import Base',
        'from ..database import Base'
    )
    
    with open(models_file, 'w') as f:
        f.write(content)
    
    print("✓ Archivo arreglado")
else:
    print(f"✗ No se encontró {models_file}")

print("\nVerificando importaciones...")

# Verificar que todo funcione
try:
    from app.database import Base
    print("✓ app.database importado correctamente")
    
    from app.models import User, Project
    print("✓ User y Project importados correctamente")
    
    print(f"\nTablas registradas: {list(Base.metadata.tables.keys())}")
    print("\n¡Todo listo! Ahora puedes ejecutar alembic revision --autogenerate")
    
except Exception as e:
    print(f"✗ Error: {e}")
    print("\nRevisa manualmente los archivos")