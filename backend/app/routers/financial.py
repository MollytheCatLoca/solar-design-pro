# backend/app/routers/financial.py
from typing import Any, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import crud, models, schemas, deps

router = APIRouter()


@router.post("/designs/{design_id}/financial-analysis", response_model=schemas.FinancialAnalysis)
def create_financial_analysis(
    *,
    db: Session = Depends(deps.get_db),
    design_id: int,
    analysis_in: schemas.FinancialAnalysisCreate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Create a basic financial analysis for a design.
    
    This calculates:
    - Total investment (CAPEX)
    - LCOE (Levelized Cost of Energy)
    - Simple payback period
    - NPV and IRR (if electricity price provided)
    """
    # Obtener el diseño
    design = crud.solar_design.get(db=db, id=design_id)
    if not design:
        raise HTTPException(status_code=404, detail="Design not found")
    
    # Verificar permisos
    project = crud.project.get(db=db, id=design.project_id)
    if project.owner_id != current_user.id and not crud.user.is_superuser(current_user):
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    # Verificar que el diseño esté simulado
    if not design.annual_production_mwh:
        raise HTTPException(
            status_code=400,
            detail="Design must be simulated before financial analysis"
        )
    
    # Obtener componentes
    if not design.panel_type_id or not design.inverter_type_id:
        raise HTTPException(status_code=400, detail="Design must have components selected")
    
    panel = crud.panel_type.get(db=db, id=design.panel_type_id)
    inverter = crud.inverter_type.get(db=db, id=design.inverter_type_id)
    
    # Obtener escenario
    if analysis_in.scenario_id:
        scenario = crud.simulation_scenario.get(db=db, id=analysis_in.scenario_id)
    else:
        scenario = crud.simulation_scenario.get_default(db)
    
    if not scenario:
        raise HTTPException(status_code=404, detail="Simulation scenario not found")
    
    # Calcular CAPEX
    capacity_mw = design.capacity_mw
    
    module_cost = capacity_mw * 1_000_000 * (scenario.module_cost or 0.25)
    inverter_cost = capacity_mw * 1_000_000 * (scenario.inverter_cost or 0.05)
    bos_cost = capacity_mw * 1_000_000 * (scenario.bos_cost or 0.15)
    installation_cost = capacity_mw * 1_000_000 * (scenario.installation_cost or 0.10)
    
    total_investment = module_cost + inverter_cost + bos_cost + installation_cost
    
    # Calcular costos O&M anuales
    annual_om_cost = capacity_mw * (scenario.om_cost_per_mw_year or 15000)
    
    # Calcular LCOE simplificado
    # LCOE = (CAPEX + NPV(OPEX)) / NPV(Energía)
    project_lifetime = 25
    discount_rate = scenario.discount_rate or 0.08
    degradation_rate = scenario.annual_degradation or 0.005
    
    # NPV de la energía producida
    total_energy_npv = 0
    for year in range(1, project_lifetime + 1):
        annual_energy = design.annual_production_mwh * ((1 - degradation_rate) ** (year - 1))
        discount_factor = 1 / ((1 + discount_rate) ** year)
        total_energy_npv += annual_energy * discount_factor
    
    # NPV de los costos O&M
    total_om_npv = 0
    for year in range(1, project_lifetime + 1):
        om_cost_year = annual_om_cost * ((1 + (scenario.inflation_rate or 0.03)) ** (year - 1))
        discount_factor = 1 / ((1 + discount_rate) ** year)
        total_om_npv += om_cost_year * discount_factor
    
    # LCOE en USD/MWh
    lcoe = (total_investment + total_om_npv) / (total_energy_npv * 1000)  # Convertir a MWh
    
    # Flujos de caja simplificados (sin precio de electricidad definido)
    cash_flows = []
    cash_flows.append({
        "year": 0,
        "investment": -total_investment,
        "revenue": 0,
        "opex": 0,
        "net_cash_flow": -total_investment,
        "cumulative_cash_flow": -total_investment
    })
    
    cumulative = -total_investment
    for year in range(1, project_lifetime + 1):
        annual_energy = design.annual_production_mwh * ((1 - degradation_rate) ** (year - 1))
        om_cost_year = annual_om_cost * ((1 + (scenario.inflation_rate or 0.03)) ** (year - 1))
        
        # Por ahora, no calculamos revenue sin precio de electricidad
        net_cash_flow = -om_cost_year
        cumulative += net_cash_flow
        
        cash_flows.append({
            "year": year,
            "investment": 0,
            "revenue": 0,
            "opex": -om_cost_year,
            "energy_mwh": annual_energy,
            "net_cash_flow": net_cash_flow,
            "cumulative_cash_flow": cumulative
        })
    
    # Crear análisis financiero
    results = {
        "total_investment": total_investment,
        "module_cost": module_cost,
        "inverter_cost": inverter_cost,
        "bos_cost": bos_cost,
        "installation_cost": installation_cost,
        "lcoe": lcoe,
        "npv": None,  # Requiere precio de electricidad
        "irr": None,  # Requiere precio de electricidad
        "payback_period": None,  # Requiere precio de electricidad
        "roi": None,  # Requiere precio de electricidad
        "cash_flows": cash_flows
    }
    
    financial_analysis = crud.financial_analysis.create(
        db=db,
        obj_in=analysis_in,
        results=results
    )
    
    return financial_analysis


@router.get("/designs/{design_id}/financial-analysis", response_model=schemas.FinancialAnalysis)
def get_latest_financial_analysis(
    *,
    db: Session = Depends(deps.get_db),
    design_id: int,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get the latest financial analysis for a design.
    """
    # Verificar permisos a través del diseño
    design = crud.solar_design.get(db=db, id=design_id)
    if not design:
        raise HTTPException(status_code=404, detail="Design not found")
    
    project = crud.project.get(db=db, id=design.project_id)
    if project.owner_id != current_user.id and not crud.user.is_superuser(current_user):
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    # Obtener el análisis más reciente
    analysis = crud.financial_analysis.get_by_design(db=db, design_id=design_id)
    if not analysis:
        raise HTTPException(status_code=404, detail="No financial analysis found for this design")
    
    return analysis


@router.get("/capex-estimate", response_model=dict)
def estimate_capex(
    *,
    capacity_mw: float,
    scenario_id: Optional[str] = None,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Quick CAPEX estimation based on capacity and scenario.
    """
    # Obtener escenario
    if scenario_id:
        scenario = crud.simulation_scenario.get(db=db, id=scenario_id)
    else:
        scenario = crud.simulation_scenario.get_default(db)
    
    if not scenario:
        raise HTTPException(status_code=404, detail="Simulation scenario not found")
    
    # Calcular costos
    module_cost = capacity_mw * 1_000_000 * (scenario.module_cost or 0.25)
    inverter_cost = capacity_mw * 1_000_000 * (scenario.inverter_cost or 0.05)
    bos_cost = capacity_mw * 1_000_000 * (scenario.bos_cost or 0.15)
    installation_cost = capacity_mw * 1_000_000 * (scenario.installation_cost or 0.10)
    total = module_cost + inverter_cost + bos_cost + installation_cost
    
    return {
        "capacity_mw": capacity_mw,
        "scenario": scenario.name,
        "breakdown": {
            "modules": module_cost,
            "inverters": inverter_cost,
            "bos": bos_cost,
            "installation": installation_cost
        },
        "total_capex": total,
        "capex_per_watt": total / (capacity_mw * 1_000_000)
    }