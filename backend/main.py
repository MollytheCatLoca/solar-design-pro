from fastapi import FastAPI
from pydantic_settings import BaseSettings, SettingsConfigDict
import os # Aunque no se usa directamente, es bueno tenerlo por si acaso

# --- Configuración ---
class Settings(BaseSettings):
    DATABASE_URL: str
    JWT_SECRET_KEY: str
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int
    FRONTEND_URL: str

    # Especifica que lea desde el archivo .env en el directorio actual (backend/)
    # y que ignore variables extra en el .env que no estén definidas en esta clase
    model_config = SettingsConfigDict(env_file=".env", extra='ignore')

try:
    settings = Settings()
    # Para verificar que se cargó correctamente (puedes comentar estas líneas después)
    print("--- Configuración Cargada ---")
    print(f"DATABASE_URL: {settings.DATABASE_URL[:20]}...") # Muestra solo una parte por seguridad
    print(f"FRONTEND_URL: {settings.FRONTEND_URL}")
    print(f"ALGORITHM: {settings.ALGORITHM}")
    print("-----------------------------")

except Exception as e:
    print(f"!!! Error al cargar la configuración desde .env: {e} !!!")
    # En un caso real, querrías manejar este error de forma más robusta o salir.
    settings = None 


# --- Aplicación FastAPI ---
app = FastAPI(title="SolarDesignPro API - Backend")

@app.get("/")
async def root():
    if settings:
        return {"message": "¡Bienvenido a la API de SolarDesignPro! Configuración cargada correctamente."}
    else:
        return {"message": "¡Bienvenido a la API de SolarDesignPro! ERROR AL CARGAR LA CONFIGURACIÓN."}

# (Más adelante aquí configurarás CORS, routers, conexión a BD, etc.)