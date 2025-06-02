# backend/app/api/v1/api.py
from fastapi import APIRouter
from app.routers import (
    auth, users, projects, 
    solar_components, solar_designs,
    weather, financial
)

api_router = APIRouter()

# Autenticación y usuarios
api_router.include_router(auth.router, tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])

# Proyectos
api_router.include_router(projects.router, prefix="/projects", tags=["projects"])

# Solar
api_router.include_router(solar_components.router, prefix="/solar", tags=["solar"])
api_router.include_router(solar_designs.router, prefix="/solar", tags=["designs"])

# Datos meteorológicos
api_router.include_router(weather.router, prefix="/weather", tags=["weather"])

# Análisis financiero
api_router.include_router(financial.router, prefix="/financial", tags=["financial"])