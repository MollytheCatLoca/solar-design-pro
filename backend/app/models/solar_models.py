# backend/app/models/solar_models.py
from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, JSON, Text, Boolean, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base


class PanelType(Base):
    """Tipos de paneles solares disponibles"""
    __tablename__ = "panel_types"
    
    id = Column(Integer, primary_key=True, index=True)
    manufacturer = Column(String, nullable=False)
    model = Column(String, nullable=False, unique=True)
    power_watts = Column(Float, nullable=False)  # Potencia nominal
    efficiency = Column(Float, nullable=False)  # Eficiencia (0-1)
    area_m2 = Column(Float, nullable=False)  # Área por panel
    
    # Parámetros eléctricos
    voc = Column(Float)  # Voltaje circuito abierto
    isc = Column(Float)  # Corriente cortocircuito
    vmp = Column(Float)  # Voltaje punto máximo
    imp = Column(Float)  # Corriente punto máximo
    
    # Coeficientes de temperatura
    temp_coeff_pmax = Column(Float)  # %/°C
    temp_coeff_voc = Column(Float)
    temp_coeff_isc = Column(Float)
    
    # Otros parámetros
    noct = Column(Float, default=45)  # Temperatura nominal de operación
    cells_in_series = Column(Integer, default=60)
    bifacial = Column(Boolean, default=False)
    
    # Metadata
    datasheet_url = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relaciones
    designs = relationship("SolarDesign", back_populates="panel_type")


class InverterType(Base):
    """Tipos de inversores disponibles"""
    __tablename__ = "inverter_types"
    
    id = Column(Integer, primary_key=True, index=True)
    manufacturer = Column(String, nullable=False)
    model = Column(String, nullable=False, unique=True)
    
    # Capacidades
    power_ac_w = Column(Float, nullable=False)  # Potencia AC nominal
    power_dc_max_w = Column(Float, nullable=False)  # Potencia DC máxima
    
    # Voltajes
    vdc_max = Column(Float)  # Voltaje DC máximo
    vdc_min = Column(Float)  # Voltaje DC mínimo (MPPT)
    vdc_nominal = Column(Float)  # Voltaje DC nominal
    vac_nominal = Column(Float)  # Voltaje AC nominal
    
    # Eficiencia
    efficiency_max = Column(Float)  # Eficiencia máxima
    efficiency_euro = Column(Float)  # Eficiencia europea
    efficiency_cec = Column(Float)  # Eficiencia CEC
    
    # Otros parámetros
    mppt_channels = Column(Integer, default=1)
    phases = Column(Integer, default=3)  # 1 o 3 fases
    
    # Metadata
    datasheet_url = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relaciones
    designs = relationship("SolarDesign", back_populates="inverter_type")


class SolarDesign(Base):
    """Diseño de sistema solar para un proyecto"""
    __tablename__ = "solar_designs"
    
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    name = Column(String, nullable=False)
    version = Column(Integer, default=1)
    
    # Configuración del sistema
    capacity_mw = Column(Float, nullable=False)
    panel_type_id = Column(Integer, ForeignKey("panel_types.id"))
    inverter_type_id = Column(Integer, ForeignKey("inverter_types.id"))
    
    # Configuración de montaje
    tilt_angle = Column(Float)  # Ángulo de inclinación
    azimuth_angle = Column(Float, default=180)  # Orientación (180 = sur)
    row_spacing = Column(Float)  # Espaciado entre filas
    module_orientation = Column(String, default='portrait')  # portrait/landscape
    
    # Configuración eléctrica
    modules_per_string = Column(Integer)
    strings_per_inverter = Column(Integer)
    total_inverters = Column(Integer)
    
    # Área de instalación (polígono GeoJSON)
    installation_area = Column(JSON)  # Polígono en formato GeoJSON
    
    # Resultados de simulación
    simulation_results = Column(JSON)  # Almacena resultados detallados
    annual_production_mwh = Column(Float)
    capacity_factor = Column(Float)
    performance_ratio = Column(Float)
    
    # Estado
    status = Column(String, default='draft')  # draft, simulated, approved
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    simulated_at = Column(DateTime(timezone=True))
    
    # Relaciones
    project = relationship("Project", back_populates="designs")
    panel_type = relationship("PanelType", back_populates="designs")
    inverter_type = relationship("InverterType", back_populates="designs")
    financial_analyses = relationship("FinancialAnalysis", back_populates="design")


class WeatherData(Base):
    """Cache de datos meteorológicos"""
    __tablename__ = "weather_data"
    
    id = Column(Integer, primary_key=True, index=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    
    # Datos meteorológicos (formato JSON con arrays de 8760 valores)
    weather_data = Column(JSON, nullable=False)  # {ghi, dni, dhi, temp_air, wind_speed}
    
    # Metadata
    source = Column(String)  # 'jrc', 'pvgis', 'nrel', etc.
    year = Column(Integer)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    expires_at = Column(DateTime(timezone=True))  # Para manejo de caché
    
    # Índice único para lat/lon
    __table_args__ = (
        Index('idx_weather_location', 'latitude', 'longitude', unique=True),
    )


class SimulationScenario(Base):
    """Escenarios de simulación con diferentes parámetros"""
    __tablename__ = "simulation_scenarios"
    
    id = Column(String, primary_key=True)  # Ej: 'BASE_1', 'OPTIMISTIC_2024'
    name = Column(String, nullable=False)
    description = Column(Text)
    
    # Parámetros técnicos
    system_losses = Column(Float, default=0.14)  # Pérdidas del sistema (14%)
    annual_degradation = Column(Float, default=0.005)  # Degradación anual (0.5%)
    soiling_losses = Column(Float, default=0.02)  # Pérdidas por suciedad
    
    # Parámetros financieros
    discount_rate = Column(Float, default=0.08)  # Tasa de descuento
    inflation_rate = Column(Float, default=0.03)  # Inflación anual
    electricity_price_escalation = Column(Float, default=0.02)  # Escalación precio electricidad
    
    # Parámetros de costos (USD/W)
    module_cost = Column(Float)
    inverter_cost = Column(Float)
    bos_cost = Column(Float)  # Balance of System
    installation_cost = Column(Float)
    
    # O&M
    om_cost_per_mw_year = Column(Float)  # USD/MW/año
    
    # Estado
    is_active = Column(Boolean, default=True)
    is_default = Column(Boolean, default=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class FinancialAnalysis(Base):
    """Análisis financiero de un diseño"""
    __tablename__ = "financial_analyses"
    
    id = Column(Integer, primary_key=True, index=True)
    design_id = Column(Integer, ForeignKey("solar_designs.id"), nullable=False)
    scenario_id = Column(String, ForeignKey("simulation_scenarios.id"), nullable=False)
    
    # Costos iniciales
    total_investment = Column(Float)
    module_cost = Column(Float)
    inverter_cost = Column(Float)
    bos_cost = Column(Float)
    installation_cost = Column(Float)
    
    # Financiamiento
    debt_percentage = Column(Float, default=0.7)  # 70% deuda
    interest_rate = Column(Float)
    loan_term_years = Column(Integer)
    
    # Resultados financieros
    lcoe = Column(Float)  # USD/kWh
    npv = Column(Float)  # Valor Presente Neto
    irr = Column(Float)  # Tasa Interna de Retorno
    payback_period = Column(Float)  # Años
    roi = Column(Float)  # Return on Investment %
    
    # Flujos de caja anuales (JSON)
    cash_flows = Column(JSON)  # Array con flujos año por año
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relaciones
    design = relationship("SolarDesign", back_populates="financial_analyses")
    scenario = relationship("SimulationScenario")


# Actualizar el modelo Project para incluir la relación
from . import Project
Project.designs = relationship("SolarDesign", back_populates="project")