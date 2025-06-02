# backend/app/api/v1/api.py
from fastapi import APIRouter
from app.routers import auth, users, projects, solar_components

api_router = APIRouter()

api_router.include_router(auth.router, tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(projects.router, prefix="/projects", tags=["projects"])
api_router.include_router(solar_components.router, prefix="/solar", tags=["solar"])