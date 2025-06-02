#!/usr/bin/env python3
# backend/list_users.py
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal
from app.models import User

def list_users():
    print("=== Usuarios en la Base de Datos ===\n")
    
    db = SessionLocal()
    
    users = db.query(User).all()
    
    if not users:
        print("❌ No hay usuarios en la base de datos")
    else:
        print(f"Total de usuarios: {len(users)}\n")
        for user in users:
            print(f"ID: {user.id}")
            print(f"Email: '{user.email}'")  # Con comillas para ver espacios
            print(f"Nombre: {user.full_name}")
            print(f"Activo: {'✅' if user.is_active else '❌'}")
            print(f"Superusuario: {'✅' if user.is_superuser else '❌'}")
            print(f"Creado: {user.created_at}")
            print("-" * 40)
    
    db.close()

if __name__ == "__main__":
    list_users()