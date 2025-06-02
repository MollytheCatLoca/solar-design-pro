# backend/app/crud/solar.py
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_
from sqlalchemy.sql import func
from app.models import (
    PanelType, InverterType, SolarDesign, 
    SimulationScenario, FinancialAnalysis
)
from app.schemas import (
    PanelTypeCreate, PanelTypeUpdate,
    InverterTypeCreate,
    SolarDesignCreate, SolarDesignUpdate,
    SimulationScenarioCreate,
    FinancialAnalysisCreate
)


class CRUDPanelType:
    def get(self, db: Session, id: int) -> Optional[PanelType]:
        return db.query(PanelType).filter(PanelType.id == id).first()
    
    def get_by_model(self, db: Session, *, model: str) -> Optional[PanelType]:
        return db.query(PanelType).filter(PanelType.model == model).first()
    
    def get_multi(
        self, db: Session, *, skip: int = 0, limit: int = 100
    ) -> List[PanelType]:
        return db.query(PanelType).offset(skip).limit(limit).all()
    
    def create(self, db: Session, *, obj_in: PanelTypeCreate) -> PanelType:
        db_obj = PanelType(**obj_in.model_dump())
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def update(
        self, db: Session, *, db_obj: PanelType, obj_in: PanelTypeUpdate
    ) -> PanelType:
        update_data = obj_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_obj, field, value)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj


class CRUDInverterType:
    def get(self, db: Session, id: int) -> Optional[InverterType]:
        return db.query(InverterType).filter(InverterType.id == id).first()
    
    def get_multi(
        self, db: Session, *, skip: int = 0, limit: int = 100
    ) -> List[InverterType]:
        return db.query(InverterType).offset(skip).limit(limit).all()
    
    def create(self, db: Session, *, obj_in: InverterTypeCreate) -> InverterType:
        db_obj = InverterType(**obj_in.model_dump())
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj


class CRUDSolarDesign:
    def get(self, db: Session, id: int) -> Optional[SolarDesign]:
        return db.query(SolarDesign).filter(SolarDesign.id == id).first()
    
    def get_multi_by_project(
        self, db: Session, *, project_id: int, skip: int = 0, limit: int = 100
    ) -> List[SolarDesign]:
        return (
            db.query(SolarDesign)
            .filter(SolarDesign.project_id == project_id)
            .offset(skip)
            .limit(limit)
            .all()
        )
    
    def create(
        self, db: Session, *, obj_in: SolarDesignCreate
    ) -> SolarDesign:
        # Obtener la última versión para este proyecto
        last_version = (
            db.query(SolarDesign.version)
            .filter(SolarDesign.project_id == obj_in.project_id)
            .order_by(SolarDesign.version.desc())
            .first()
        )
        
        version = 1 if not last_version else last_version[0] + 1
        
        db_obj = SolarDesign(
            **obj_in.model_dump(),
            version=version
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def update(
        self, db: Session, *, db_obj: SolarDesign, obj_in: SolarDesignUpdate
    ) -> SolarDesign:
        update_data = obj_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_obj, field, value)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def update_simulation_results(
        self, 
        db: Session, 
        *, 
        design_id: int, 
        results: dict
    ) -> Optional[SolarDesign]:
        design = self.get(db, design_id)
        if not design:
            return None
        
        design.simulation_results = results
        design.annual_production_mwh = results.get('annual_production_mwh')
        design.capacity_factor = results.get('capacity_factor')
        design.performance_ratio = results.get('performance_ratio')
        design.simulated_at = func.now()
        design.status = 'simulated'
        
        db.add(design)
        db.commit()
        db.refresh(design)
        return design


class CRUDSimulationScenario:
    def get(self, db: Session, id: str) -> Optional[SimulationScenario]:
        return db.query(SimulationScenario).filter(SimulationScenario.id == id).first()
    
    def get_default(self, db: Session) -> Optional[SimulationScenario]:
        return db.query(SimulationScenario).filter(
            and_(
                SimulationScenario.is_default == True,
                SimulationScenario.is_active == True
            )
        ).first()
    
    def get_multi_active(
        self, db: Session, *, skip: int = 0, limit: int = 100
    ) -> List[SimulationScenario]:
        return (
            db.query(SimulationScenario)
            .filter(SimulationScenario.is_active == True)
            .offset(skip)
            .limit(limit)
            .all()
        )
    
    def create(
        self, db: Session, *, obj_in: SimulationScenarioCreate
    ) -> SimulationScenario:
        # Si es default, quitar default de otros
        if obj_in.is_default:
            db.query(SimulationScenario).update({SimulationScenario.is_default: False})
        
        db_obj = SimulationScenario(**obj_in.model_dump())
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj


class CRUDFinancialAnalysis:
    def get_by_design(
        self, db: Session, *, design_id: int
    ) -> Optional[FinancialAnalysis]:
        return (
            db.query(FinancialAnalysis)
            .filter(FinancialAnalysis.design_id == design_id)
            .order_by(FinancialAnalysis.created_at.desc())
            .first()
        )
    
    def create(
        self, db: Session, *, obj_in: FinancialAnalysisCreate, results: dict
    ) -> FinancialAnalysis:
        db_obj = FinancialAnalysis(
            **obj_in.model_dump(),
            **results
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj


# Instancias de CRUD
panel_type = CRUDPanelType()
inverter_type = CRUDInverterType()
solar_design = CRUDSolarDesign()
simulation_scenario = CRUDSimulationScenario()
financial_analysis = CRUDFinancialAnalysis()