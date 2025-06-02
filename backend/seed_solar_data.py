#!/usr/bin/env python3
# backend/seed_solar_data.py
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal
from app.models import PanelType, InverterType, SimulationScenario
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def seed_panel_types(db):
    """Agregar algunos tipos de paneles comunes"""
    panels = [
        {
            "manufacturer": "Trina Solar",
            "model": "TSM-DE19M-550",
            "power_watts": 550,
            "efficiency": 0.213,
            "area_m2": 2.584,
            "voc": 49.6,
            "isc": 14.0,
            "vmp": 41.8,
            "imp": 13.16,
            "temp_coeff_pmax": -0.34,
            "cells_in_series": 144,
            "bifacial": False
        },
        {
            "manufacturer": "JinkoSolar",
            "model": "Tiger Pro 72HC-545",
            "power_watts": 545,
            "efficiency": 0.211,
            "area_m2": 2.584,
            "voc": 49.5,
            "isc": 13.9,
            "vmp": 41.7,
            "imp": 13.08,
            "temp_coeff_pmax": -0.35,
            "cells_in_series": 144,
            "bifacial": False
        },
        {
            "manufacturer": "Canadian Solar",
            "model": "HiKu7 CS7L-590MS",
            "power_watts": 590,
            "efficiency": 0.214,
            "area_m2": 2.756,
            "voc": 51.9,
            "isc": 14.45,
            "vmp": 43.6,
            "imp": 13.54,
            "temp_coeff_pmax": -0.34,
            "cells_in_series": 132,
            "bifacial": True
        }
    ]
    
    for panel_data in panels:
        existing = db.query(PanelType).filter(PanelType.model == panel_data["model"]).first()
        if not existing:
            panel = PanelType(**panel_data)
            db.add(panel)
            logger.info(f"Agregado panel: {panel_data['model']}")
        else:
            logger.info(f"Panel ya existe: {panel_data['model']}")
    
    db.commit()


def seed_inverter_types(db):
    """Agregar algunos tipos de inversores comunes"""
    inverters = [
        {
            "manufacturer": "Huawei",
            "model": "SUN2000-100KTL-H2",
            "power_ac_w": 100000,
            "power_dc_max_w": 120000,
            "vdc_max": 1100,
            "vdc_min": 200,
            "vdc_nominal": 600,
            "vac_nominal": 400,
            "efficiency_max": 0.988,
            "efficiency_euro": 0.984,
            "mppt_channels": 10,
            "phases": 3
        },
        {
            "manufacturer": "SMA",
            "model": "Sunny Central 2750-EV",
            "power_ac_w": 2750000,
            "power_dc_max_w": 3300000,
            "vdc_max": 1500,
            "vdc_min": 950,
            "vdc_nominal": 1170,
            "vac_nominal": 660,
            "efficiency_max": 0.987,
            "efficiency_euro": 0.985,
            "mppt_channels": 1,
            "phases": 3
        },
        {
            "manufacturer": "Sungrow",
            "model": "SG250HX",
            "power_ac_w": 250000,
            "power_dc_max_w": 300000,
            "vdc_max": 1500,
            "vdc_min": 500,
            "vdc_nominal": 1050,
            "vac_nominal": 600,
            "efficiency_max": 0.990,
            "efficiency_euro": 0.987,
            "mppt_channels": 12,
            "phases": 3
        }
    ]
    
    for inverter_data in inverters:
        existing = db.query(InverterType).filter(InverterType.model == inverter_data["model"]).first()
        if not existing:
            inverter = InverterType(**inverter_data)
            db.add(inverter)
            logger.info(f"Agregado inversor: {inverter_data['model']}")
        else:
            logger.info(f"Inversor ya existe: {inverter_data['model']}")
    
    db.commit()


def seed_simulation_scenarios(db):
    """Agregar escenarios de simulación"""
    scenarios = [
        {
            "id": "DEFAULT_2024",
            "name": "Escenario por Defecto 2024",
            "description": "Parámetros estándar para proyectos solares en 2024",
            "system_losses": 0.14,
            "annual_degradation": 0.005,
            "soiling_losses": 0.02,
            "discount_rate": 0.08,
            "inflation_rate": 0.03,
            "electricity_price_escalation": 0.02,
            "module_cost": 0.25,  # USD/W
            "inverter_cost": 0.05,  # USD/W
            "bos_cost": 0.15,  # USD/W
            "installation_cost": 0.10,  # USD/W
            "om_cost_per_mw_year": 15000,  # USD/MW/año
            "is_active": True,
            "is_default": True
        },
        {
            "id": "OPTIMISTIC_2024",
            "name": "Escenario Optimista 2024",
            "description": "Parámetros optimistas con menores costos y pérdidas",
            "system_losses": 0.10,
            "annual_degradation": 0.004,
            "soiling_losses": 0.015,
            "discount_rate": 0.06,
            "inflation_rate": 0.025,
            "electricity_price_escalation": 0.03,
            "module_cost": 0.20,
            "inverter_cost": 0.04,
            "bos_cost": 0.12,
            "installation_cost": 0.08,
            "om_cost_per_mw_year": 12000,
            "is_active": True,
            "is_default": False
        },
        {
            "id": "CONSERVATIVE_2024",
            "name": "Escenario Conservador 2024",
            "description": "Parámetros conservadores con mayores costos",
            "system_losses": 0.18,
            "annual_degradation": 0.007,
            "soiling_losses": 0.03,
            "discount_rate": 0.10,
            "inflation_rate": 0.04,
            "electricity_price_escalation": 0.01,
            "module_cost": 0.30,
            "inverter_cost": 0.06,
            "bos_cost": 0.18,
            "installation_cost": 0.12,
            "om_cost_per_mw_year": 20000,
            "is_active": True,
            "is_default": False
        }
    ]
    
    # Primero, asegurarse de que no haya otros escenarios por defecto
    db.query(SimulationScenario).update({SimulationScenario.is_default: False})
    
    for scenario_data in scenarios:
        existing = db.query(SimulationScenario).filter(SimulationScenario.id == scenario_data["id"]).first()
        if not existing:
            scenario = SimulationScenario(**scenario_data)
            db.add(scenario)
            logger.info(f"Agregado escenario: {scenario_data['name']}")
        else:
            logger.info(f"Escenario ya existe: {scenario_data['name']}")
    
    db.commit()


def main():
    logger.info("=== Iniciando seed de datos solares ===")
    
    db = SessionLocal()
    
    try:
        logger.info("\n1. Agregando tipos de paneles...")
        seed_panel_types(db)
        
        logger.info("\n2. Agregando tipos de inversores...")
        seed_inverter_types(db)
        
        logger.info("\n3. Agregando escenarios de simulación...")
        seed_simulation_scenarios(db)
        
        logger.info("\n✅ Seed completado exitosamente!")
        
    except Exception as e:
        logger.error(f"❌ Error durante el seed: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    main()