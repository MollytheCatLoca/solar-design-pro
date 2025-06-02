# backend/app/schemas/solar_schemas.py
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, ConfigDict


# ========== Panel Type Schemas ==========
class PanelTypeBase(BaseModel):
    manufacturer: str
    model: str
    power_watts: float = Field(..., gt=0, description="Potencia nominal en watts")
    efficiency: float = Field(..., gt=0, le=1, description="Eficiencia (0-1)")
    area_m2: float = Field(..., gt=0, description="Área por panel en m²")
    voc: Optional[float] = None
    isc: Optional[float] = None
    vmp: Optional[float] = None
    imp: Optional[float] = None
    temp_coeff_pmax: Optional[float] = None
    temp_coeff_voc: Optional[float] = None
    temp_coeff_isc: Optional[float] = None
    noct: float = 45
    cells_in_series: int = 60
    bifacial: bool = False
    datasheet_url: Optional[str] = None


class PanelTypeCreate(PanelTypeBase):
    pass


class PanelTypeUpdate(BaseModel):
    power_watts: Optional[float] = None
    efficiency: Optional[float] = None
    datasheet_url: Optional[str] = None


class PanelType(PanelTypeBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    model_config = ConfigDict(from_attributes=True)


# ========== Inverter Type Schemas ==========
class InverterTypeBase(BaseModel):
    manufacturer: str
    model: str
    power_ac_w: float = Field(..., gt=0)
    power_dc_max_w: float = Field(..., gt=0)
    vdc_max: Optional[float] = None
    vdc_min: Optional[float] = None
    vdc_nominal: Optional[float] = None
    vac_nominal: Optional[float] = None
    efficiency_max: Optional[float] = Field(None, gt=0, le=1)
    efficiency_euro: Optional[float] = Field(None, gt=0, le=1)
    efficiency_cec: Optional[float] = Field(None, gt=0, le=1)
    mppt_channels: int = 1
    phases: int = Field(3, ge=1, le=3)
    datasheet_url: Optional[str] = None


class InverterTypeCreate(InverterTypeBase):
    pass


class InverterType(InverterTypeBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    model_config = ConfigDict(from_attributes=True)


# ========== Solar Design Schemas ==========
class SolarDesignBase(BaseModel):
    name: str
    capacity_mw: float = Field(..., gt=0)
    panel_type_id: Optional[int] = None
    inverter_type_id: Optional[int] = None
    tilt_angle: Optional[float] = Field(None, ge=0, le=90)
    azimuth_angle: float = Field(180, ge=0, lt=360)
    row_spacing: Optional[float] = Field(None, gt=0)
    module_orientation: str = Field('portrait', pattern='^(portrait|landscape)$')
    modules_per_string: Optional[int] = Field(None, gt=0)
    strings_per_inverter: Optional[int] = Field(None, gt=0)
    total_inverters: Optional[int] = Field(None, gt=0)
    installation_area: Optional[Dict[str, Any]] = None  # GeoJSON


class SolarDesignCreate(SolarDesignBase):
    project_id: int


class SolarDesignUpdate(BaseModel):
    name: Optional[str] = None
    capacity_mw: Optional[float] = None
    panel_type_id: Optional[int] = None
    inverter_type_id: Optional[int] = None
    tilt_angle: Optional[float] = None
    azimuth_angle: Optional[float] = None
    installation_area: Optional[Dict[str, Any]] = None


class SolarDesign(SolarDesignBase):
    id: int
    project_id: int
    version: int
    status: str
    annual_production_mwh: Optional[float] = None
    capacity_factor: Optional[float] = None
    performance_ratio: Optional[float] = None
    simulation_results: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    simulated_at: Optional[datetime] = None
    
    # Relaciones opcionales
    panel_type: Optional[PanelType] = None
    inverter_type: Optional[InverterType] = None
    
    model_config = ConfigDict(from_attributes=True)


# ========== Simulation Scenario Schemas ==========
class SimulationScenarioBase(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    system_losses: float = 0.14
    annual_degradation: float = 0.005
    soiling_losses: float = 0.02
    discount_rate: float = 0.08
    inflation_rate: float = 0.03
    electricity_price_escalation: float = 0.02
    module_cost: Optional[float] = None
    inverter_cost: Optional[float] = None
    bos_cost: Optional[float] = None
    installation_cost: Optional[float] = None
    om_cost_per_mw_year: Optional[float] = None
    is_active: bool = True
    is_default: bool = False


class SimulationScenarioCreate(SimulationScenarioBase):
    pass


class SimulationScenario(SimulationScenarioBase):
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    model_config = ConfigDict(from_attributes=True)


# ========== Financial Analysis Schemas ==========
class FinancialAnalysisBase(BaseModel):
    design_id: int
    scenario_id: str
    debt_percentage: float = Field(0.7, ge=0, le=1)
    interest_rate: Optional[float] = Field(None, ge=0)
    loan_term_years: Optional[int] = Field(None, gt=0)


class FinancialAnalysisCreate(FinancialAnalysisBase):
    pass


class FinancialAnalysis(FinancialAnalysisBase):
    id: int
    total_investment: Optional[float] = None
    module_cost: Optional[float] = None
    inverter_cost: Optional[float] = None
    bos_cost: Optional[float] = None
    installation_cost: Optional[float] = None
    lcoe: Optional[float] = None
    npv: Optional[float] = None
    irr: Optional[float] = None
    payback_period: Optional[float] = None
    roi: Optional[float] = None
    cash_flows: Optional[List[Dict[str, Any]]] = None
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


# ========== Simulation Request/Response Schemas ==========
class SimulationRequest(BaseModel):
    design_id: int
    scenario_id: Optional[str] = None
    weather_source: str = Field('pvgis', pattern='^(pvgis|nrel|tmy)$')


class SimulationResponse(BaseModel):
    design_id: int
    status: str
    annual_production_mwh: float
    capacity_factor: float
    performance_ratio: float
    monthly_production: Dict[str, float]
    simulation_details: Dict[str, Any]


class DesignWithSimulation(SolarDesign):
    financial_analysis: Optional[FinancialAnalysis] = None