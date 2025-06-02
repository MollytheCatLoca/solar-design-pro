# backend/app/core/config.py
from pydantic_settings import BaseSettings, SettingsConfigDict
import os

class Settings(BaseSettings):
    DATABASE_URL: str
    JWT_SECRET_KEY: str
    ALGORITHM: str = "HS256" # Valor por defecto si no está en .env
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30 # Valor por defecto
    FRONTEND_URL: str

    # Le dice a Pydantic dónde encontrar el archivo .env
    # La ruta es relativa al directorio desde donde se ejecuta uvicorn (backend/)
    model_config = SettingsConfigDict(env_file=".env", extra='ignore')

settings = Settings()

# Para verificar al inicio (puedes comentar después de confirmar)
# print("--- Configuración Cargada desde core/config.py ---")
# print(f"DATABASE_URL: {settings.DATABASE_URL[:20]}...")
# print(f"FRONTEND_URL: {settings.FRONTEND_URL}")
# print("-------------------------------------------------")