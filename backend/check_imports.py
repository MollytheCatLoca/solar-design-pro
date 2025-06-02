#!/usr/bin/env python3
# backend/check_imports.py

print("=== Verificando imports del main.py ===\n")

imports_to_check = [
    ("FastAPI", "from fastapi import FastAPI"),
    ("CORSMiddleware", "from fastapi.middleware.cors import CORSMiddleware"),
    ("api_router", "from app.api.v1.api import api_router"),
    ("settings", "from app.core.config import settings"),
]

for name, import_statement in imports_to_check:
    try:
        exec(import_statement)
        print(f"✅ {name} - OK")
    except Exception as e:
        print(f"❌ {name} - Error: {e}")

print("\n=== Verificando archivos necesarios ===")
import os

files_to_check = [
    "app/api/v1/api.py",
    "app/deps.py",
    "app/routers/auth.py",
    "app/routers/users.py",
    "app/routers/projects.py",
    "app/core/config.py",
    "app/database.py",
]

for file in files_to_check:
    if os.path.exists(file):
        print(f"✅ {file} existe")
    else:
        print(f"❌ {file} NO EXISTE")