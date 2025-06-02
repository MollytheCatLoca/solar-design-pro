#!/usr/bin/env python3
# backend/debug_server.py
import sys
import os

print("=== Debug del servidor ===\n")

# 1. Verificar imports básicos
try:
    from fastapi import FastAPI
    print("✅ FastAPI importado correctamente")
except Exception as e:
    print(f"❌ Error importando FastAPI: {e}")
    sys.exit(1)

# 2. Verificar la configuración
try:
    from app.core.config import settings
    print("✅ Configuración cargada")
    print(f"   DATABASE_URL: {settings.DATABASE_URL[:30]}...")
    print(f"   FRONTEND_URL: {settings.FRONTEND_URL}")
except Exception as e:
    print(f"❌ Error cargando configuración: {e}")

# 3. Verificar la base de datos
try:
    from app.database import SessionLocal, engine
    print("✅ Conexión a BD configurada")
    
    # Intentar conectar
    db = SessionLocal()
    db.execute("SELECT 1")
    db.close()
    print("✅ Conexión a BD exitosa")
except Exception as e:
    print(f"⚠️  Error con la base de datos: {e}")

# 4. Verificar los modelos
try:
    from app.models import User, Project
    print("✅ Modelos importados correctamente")
except Exception as e:
    print(f"❌ Error importando modelos: {e}")

# 5. Crear una app mínima
print("\n=== Creando servidor mínimo ===")

app = FastAPI(title="Debug Server")

@app.get("/")
def root():
    return {"message": "Debug server funcionando"}

@app.get("/test")
def test():
    return {"status": "ok", "timestamp": str(os.times())}

# 6. Ejecutar
if __name__ == "__main__":
    print("\n🚀 Iniciando servidor de debug en http://localhost:8002")
    print("   Prueba: http://localhost:8002/")
    print("   Prueba: http://localhost:8002/test")
    
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8002, log_level="debug")