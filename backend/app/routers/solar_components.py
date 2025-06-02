# backend/app/routers/solar_components.py
from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import crud, models, schemas
from app import deps

router = APIRouter()


# ========== Panel Types Endpoints ==========
@router.get("/panels", response_model=List[schemas.PanelType])
def read_panel_types(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve panel types.
    """
    panels = crud.panel_type.get_multi(db, skip=skip, limit=limit)
    return panels


@router.get("/panels/{panel_id}", response_model=schemas.PanelType)
def read_panel_type(
    *,
    db: Session = Depends(deps.get_db),
    panel_id: int,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get panel type by ID.
    """
    panel = crud.panel_type.get(db=db, id=panel_id)
    if not panel:
        raise HTTPException(status_code=404, detail="Panel type not found")
    return panel


@router.post("/panels", response_model=schemas.PanelType)
def create_panel_type(
    *,
    db: Session = Depends(deps.get_db),
    panel_in: schemas.PanelTypeCreate,
    current_user: models.User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Create new panel type (admin only).
    """
    # Check if model already exists
    panel = crud.panel_type.get_by_model(db, model=panel_in.model)
    if panel:
        raise HTTPException(
            status_code=400,
            detail="Panel model already exists"
        )
    panel = crud.panel_type.create(db=db, obj_in=panel_in)
    return panel


# ========== Inverter Types Endpoints ==========
@router.get("/inverters", response_model=List[schemas.InverterType])
def read_inverter_types(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve inverter types.
    """
    inverters = crud.inverter_type.get_multi(db, skip=skip, limit=limit)
    return inverters


@router.get("/inverters/{inverter_id}", response_model=schemas.InverterType)
def read_inverter_type(
    *,
    db: Session = Depends(deps.get_db),
    inverter_id: int,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get inverter type by ID.
    """
    inverter = crud.inverter_type.get(db=db, id=inverter_id)
    if not inverter:
        raise HTTPException(status_code=404, detail="Inverter type not found")
    return inverter


@router.post("/inverters", response_model=schemas.InverterType)
def create_inverter_type(
    *,
    db: Session = Depends(deps.get_db),
    inverter_in: schemas.InverterTypeCreate,
    current_user: models.User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Create new inverter type (admin only).
    """
    inverter = crud.inverter_type.create(db=db, obj_in=inverter_in)
    return inverter


# ========== Simulation Scenarios Endpoints ==========
@router.get("/scenarios", response_model=List[schemas.SimulationScenario])
def read_simulation_scenarios(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve active simulation scenarios.
    """
    scenarios = crud.simulation_scenario.get_multi_active(db, skip=skip, limit=limit)
    return scenarios


@router.get("/scenarios/default", response_model=schemas.SimulationScenario)
def read_default_scenario(
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get default simulation scenario.
    """
    scenario = crud.simulation_scenario.get_default(db)
    if not scenario:
        raise HTTPException(status_code=404, detail="No default scenario found")
    return scenario


@router.post("/scenarios", response_model=schemas.SimulationScenario)
def create_scenario(
    *,
    db: Session = Depends(deps.get_db),
    scenario_in: schemas.SimulationScenarioCreate,
    current_user: models.User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Create new simulation scenario (admin only).
    """
    scenario = crud.simulation_scenario.create(db=db, obj_in=scenario_in)
    return scenario