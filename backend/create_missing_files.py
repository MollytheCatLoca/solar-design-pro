#!/usr/bin/env python3
# backend/create_missing_files.py
import os

def create_file(path, content):
    """Crear archivo si no existe"""
    if not os.path.exists(path):
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, 'w') as f:
            f.write(content)
        print(f"✅ Creado: {path}")
    else:
        print(f"⏭️  Ya existe: {path}")

# Estructura de archivos necesarios
files = {
    "app/__init__.py": '# backend/app/__init__.py\n"""SolarDesignPro Backend Application"""\n\n__version__ = "0.1.0"',
    
    "app/api/__init__.py": "# backend/app/api/__init__.py",
    
    "app/api/v1/__init__.py": "# backend/app/api/v1/__init__.py",
    
    "app/routers/__init__.py": "# backend/app/routers/__init__.py",
    
    "app/crud/__init__.py": """# backend/app/crud/__init__.py
from .user import user
from .project import project

__all__ = ["user", "project"]""",
    
    "app/schemas/__init__.py": """# backend/app/schemas/__init__.py
from .schemas import (
    UserBase, UserCreate, UserUpdate, User, UserInDB,
    ProjectBase, ProjectCreate, ProjectUpdate, Project,
    Token, TokenData
)

__all__ = [
    "UserBase", "UserCreate", "UserUpdate", "User", "UserInDB",
    "ProjectBase", "ProjectCreate", "ProjectUpdate", "Project",
    "Token", "TokenData"
]""",
}

print("=== Creando archivos faltantes ===\n")

for filepath, content in files.items():
    create_file(filepath, content)

print("\n=== Verificando importaciones ===")

try:
    from app.core.config import settings
    print("✅ app.core.config importado correctamente")
except Exception as e:
    print(f"❌ Error importando app.core.config: {e}")

try:
    from app.database import SessionLocal, Base
    print("✅ app.database importado correctamente")
except Exception as e:
    print(f"❌ Error importando app.database: {e}")

print("\n=== Estructura de archivos ===")
os.system("find app -name '*.py' -type f | sort")

print("\n¡Listo! Intenta ejecutar uvicorn nuevamente.")