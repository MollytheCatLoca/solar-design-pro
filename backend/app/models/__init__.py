# backend/app/models/__init__.py
from .models import User, Project
from .solar_models import (
    PanelType, 
    InverterType, 
    SolarDesign, 
    WeatherData, 
    SimulationScenario,
    FinancialAnalysis
)

__all__ = [
    "User", 
    "Project",
    "PanelType",
    "InverterType", 
    "SolarDesign",
    "WeatherData",
    "SimulationScenario",
    "FinancialAnalysis"
]