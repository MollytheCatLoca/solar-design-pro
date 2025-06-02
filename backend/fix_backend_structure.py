#!/usr/bin/env python3
# backend/fix_backend_structure.py
import os
import shutil

print("=== Arreglando estructura del backend ===\n")

# 1. Crear deps.py en app/
deps_content = '''# backend/app/deps.py
from typing import Generator
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.core.config import settings
from app import crud, models, schemas

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/login/access-token")


def get_db() -> Generator:
    """Dependencia para obtener la sesión de BD"""
    try:
        db = SessionLocal()
        yield db
    finally:
        db.close()


def get_current_user(
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)
) -> models.User:
    """Obtener el usuario actual desde el token JWT"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(
            token, settings.JWT_SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = schemas.TokenData(username=username)
    except JWTError:
        raise credentials_exception
    
    user = crud.user.get_by_email(db, email=token_data.username)
    if user is None:
        raise credentials_exception
    return user


def get_current_active_user(
    current_user: models.User = Depends(get_current_user),
) -> models.User:
    """Verificar que el usuario esté activo"""
    if not crud.user.is_active(current_user):
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user


def get_current_active_superuser(
    current_user: models.User = Depends(get_current_user),
) -> models.User:
    """Verificar que el usuario sea superusuario"""
    if not crud.user.is_superuser(current_user):
        raise HTTPException(
            status_code=400, detail="The user doesn\'t have enough privileges"
        )
    return current_user
'''

with open('app/deps.py', 'w') as f:
    f.write(deps_content)
print("✅ Creado app/deps.py")

# 2. Actualizar todos los imports en los routers
routers = ['auth.py', 'users.py', 'projects.py']
for router in routers:
    router_path = f'app/routers/{router}'
    if os.path.exists(router_path):
        with open(router_path, 'r') as f:
            content = f.read()
        
        # Reemplazar el import incorrecto
        content = content.replace('from app.api import deps', 'from app import deps')
        
        with open(router_path, 'w') as f:
            f.write(content)
        
        print(f"✅ Actualizado import en {router}")

# 3. Crear estructura de directorios necesaria
os.makedirs('app/api/v1', exist_ok=True)

# 4. Verificar que api.py existe en el lugar correcto
if not os.path.exists('app/api/v1/api.py'):
    print("❌ No se encontró app/api/v1/api.py")
    print("   Creando el archivo...")
    
    api_content = '''# backend/app/api/v1/api.py
from fastapi import APIRouter
from app.routers import auth, users, projects

api_router = APIRouter()

api_router.include_router(auth.router, tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(projects.router, prefix="/projects", tags=["projects"])
'''
    
    with open('app/api/v1/api.py', 'w') as f:
        f.write(api_content)
    print("✅ Creado app/api/v1/api.py")

print("\n=== Estructura actual ===")
os.system("find app -name '*.py' -type f | sort")

print("\n✅ ¡Listo! Intenta ejecutar: uvicorn main:app --reload")