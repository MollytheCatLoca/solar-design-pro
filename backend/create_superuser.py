#!/usr/bin/env python3
# backend/create_superuser.py
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal
from app.crud import user as crud_user
from app.schemas import UserCreate
from getpass import getpass

def create_superuser():
    print("=== Crear Superusuario ===")
    
    email = input("Email: ")
    full_name = input("Nombre completo: ")
    password = getpass("Contraseña: ")
    password_confirm = getpass("Confirmar contraseña: ")
    
    if password != password_confirm:
        print("❌ Las contraseñas no coinciden")
        return
    
    db = SessionLocal()
    
    # Verificar si el usuario ya existe
    existing_user = crud_user.get_by_email(db, email=email)
    if existing_user:
        print(f"❌ El usuario {email} ya existe")
        return
    
    # Crear el superusuario
    user_in = UserCreate(
        email=email,
        password=password,
        full_name=full_name,
        is_superuser=True,
        is_active=True
    )
    
    try:
        user = crud_user.create(db, obj_in=user_in)
        print(f"✅ Superusuario creado exitosamente: {user.email}")
    except Exception as e:
        print(f"❌ Error al crear el usuario: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    create_superuser()