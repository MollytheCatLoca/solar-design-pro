# backend/main.py
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

from app.core.config import settings
from app.api.v1.api import api_router  # IMPORTANTE: Importar el router

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Lifespan context manager
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting up SolarDesignPro API...")
    logger.info(f"Database URL: {settings.DATABASE_URL[:30]}...")
    logger.info("API ready!")
    yield
    # Shutdown
    logger.info("Shutting down...")

# Crear instancia de FastAPI
app = FastAPI(
    title="SolarDesignPro API",
    description="Backend API para SolarDesignPro",
    version="0.1.0",
    lifespan=lifespan
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción, usar [settings.FRONTEND_URL]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# IMPORTANTE: Incluir el router principal con todas las rutas
app.include_router(api_router, prefix="/api/v1")

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "Bienvenido a SolarDesignPro API",
        "version": "0.1.0",
        "docs": "/docs",
        "status": "operational"
    }

# Health check
@app.get("/health")
async def health_check():
    return {"status": "healthy", "database": "connected"}

if __name__ == "__main__":
    import uvicorn
    print(f"Starting server at http://localhost:8001")
    print(f"Documentation at http://localhost:8001/docs")
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)