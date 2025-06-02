# backend/app/schemas/__init__.py
from .schemas import (
    UserBase, UserCreate, UserUpdate, User, UserInDB,
    ProjectBase, ProjectCreate, ProjectUpdate, Project,
    Token, TokenData
)
from .solar_schemas import (
    PanelType, PanelTypeCreate, PanelTypeUpdate,
    InverterType, InverterTypeCreate,
    SolarDesign, SolarDesignCreate, SolarDesignUpdate,
    SimulationScenario, SimulationScenarioCreate,
    FinancialAnalysis, FinancialAnalysisCreate,
    SimulationRequest, SimulationResponse, DesignWithSimulation
)

__all__ = [
    # User schemas
    "UserBase", "UserCreate", "UserUpdate", "User", "UserInDB",
    # Project schemas
    "ProjectBase", "ProjectCreate", "ProjectUpdate", "Project",
    # Auth schemas
    "Token", "TokenData",
    # Solar schemas
    "PanelType", "PanelTypeCreate", "PanelTypeUpdate",
    "InverterType", "InverterTypeCreate",
    "SolarDesign", "SolarDesignCreate", "SolarDesignUpdate",
    "SimulationScenario", "SimulationScenarioCreate",
    "FinancialAnalysis", "FinancialAnalysisCreate",
    "SimulationRequest", "SimulationResponse", "DesignWithSimulation"
]