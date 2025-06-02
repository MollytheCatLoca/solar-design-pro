#!/usr/bin/env python3
# backend/create_dev_user.py
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal
from app.crud import user as crud_user
from app.schemas import UserCreate

def create_dev_user():
    print("=== Crear Usuario de Desarrollo ===")
    
    # Usuario de desarrollo con credenciales fijas
    DEV_EMAIL = "dev@solardesignpro.com"
    DEV_PASSWORD = "dev123"
    
    db = SessionLocal()
    
    # Verificar si ya existe
    existing_user = crud_user.get_by_email(db, email=DEV_EMAIL)
    if existing_user:
        print(f"✅ El usuario {DEV_EMAIL} ya existe")
    else:
        # Crear el usuario
        user_in = UserCreate(
            email=DEV_EMAIL,
            password=DEV_PASSWORD,
            full_name="Developer",
            is_superuser=True,
            is_active=True
        )
        
        user = crud_user.create(db, obj_in=user_in)
        print(f"✅ Usuario de desarrollo creado: {user.email}")
    
    print(f"\n📧 Email: {DEV_EMAIL}")
    print(f"🔑 Password: {DEV_PASSWORD}")
    print(f"\n⚠️  SOLO USAR EN DESARROLLO LOCAL")
    
    db.close()
    
    # Crear automáticamente el token
    print("\n=== Creando token de desarrollo ===")
    from create_dev_token import create_dev_token
    from app.core import security
    from datetime import timedelta
    
    # Crear token directamente sin pedir password
    access_token = security.create_access_token(
        data={"sub": DEV_EMAIL},
        expires_delta=timedelta(days=30)
    )
    
    # Guardar token
    with open(".dev_token", "w") as f:
        f.write(access_token)
    
    print(f"✅ Token creado y guardado en .dev_token")
    print(f"🔑 Token: {access_token[:50]}...")
    
    # Crear el archivo HTML y api.sh
    os.system("python create_dev_token.py")

if __name__ == "__main__":
    create_dev_user()