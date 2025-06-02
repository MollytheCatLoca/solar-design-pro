# backend/app/crud/__init__.py
from .user import user
from .project import project
from .solar import (
    panel_type, inverter_type, solar_design,
    simulation_scenario, financial_analysis
)

__all__ = [
    "user", "project", "panel_type", "inverter_type",
    "solar_design", "simulation_scenario", "financial_analysis"
]