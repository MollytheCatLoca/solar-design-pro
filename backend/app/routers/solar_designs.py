# backend/app/routers/solar_designs.py
from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Body
from sqlalchemy.orm import Session
from app import crud, models, schemas
from app import deps

router = APIRouter()


# ========== Solar Designs Endpoints ==========
@router.get("/projects/{project_id}/designs", response_model=List[schemas.SolarDesign])
def read_project_designs(
    *,
    db: Session = Depends(deps.get_db),
    project_id: int,
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve all designs for a specific project.
    """
    # Verificar que el usuario tenga acceso al proyecto
    project = crud.project.get(db=db, id=project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if project.owner_id != current_user.id and not crud.user.is_superuser(current_user):
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    designs = crud.solar_design.get_multi_by_project(
        db=db, project_id=project_id, skip=skip, limit=limit
    )
    return designs


@router.post("/projects/{project_id}/designs", response_model=schemas.SolarDesign)
def create_design(
    *,
    db: Session = Depends(deps.get_db),
    project_id: int,
    design_in: schemas.SolarDesignCreate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Create new solar design for a project.
    """
    # Verificar que el usuario tenga acceso al proyecto
    project = crud.project.get(db=db, id=project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if project.owner_id != current_user.id and not crud.user.is_superuser(current_user):
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    # Asegurar que el project_id en el body coincida
    design_in.project_id = project_id
    
    # Verificar que el panel y el inversor existan si se especifican
    if design_in.panel_type_id:
        panel = crud.panel_type.get(db=db, id=design_in.panel_type_id)
        if not panel:
            raise HTTPException(status_code=404, detail="Panel type not found")
    
    if design_in.inverter_type_id:
        inverter = crud.inverter_type.get(db=db, id=design_in.inverter_type_id)
        if not inverter:
            raise HTTPException(status_code=404, detail="Inverter type not found")
    
    design = crud.solar_design.create(db=db, obj_in=design_in)
    return design


@router.get("/designs/{design_id}", response_model=schemas.SolarDesign)
def read_design(
    *,
    db: Session = Depends(deps.get_db),
    design_id: int,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get solar design by ID with full details.
    """
    design = crud.solar_design.get(db=db, id=design_id)
    if not design:
        raise HTTPException(status_code=404, detail="Design not found")
    
    # Verificar permisos a través del proyecto
    project = crud.project.get(db=db, id=design.project_id)
    if project.owner_id != current_user.id and not crud.user.is_superuser(current_user):
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    return design


@router.put("/designs/{design_id}", response_model=schemas.SolarDesign)
def update_design(
    *,
    db: Session = Depends(deps.get_db),
    design_id: int,
    design_in: schemas.SolarDesignUpdate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Update a solar design.
    """
    design = crud.solar_design.get(db=db, id=design_id)
    if not design:
        raise HTTPException(status_code=404, detail="Design not found")
    
    # Verificar permisos
    project = crud.project.get(db=db, id=design.project_id)
    if project.owner_id != current_user.id and not crud.user.is_superuser(current_user):
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    # Verificar que el panel y el inversor existan si se actualizan
    if design_in.panel_type_id is not None:
        panel = crud.panel_type.get(db=db, id=design_in.panel_type_id)
        if not panel:
            raise HTTPException(status_code=404, detail="Panel type not found")
    
    if design_in.inverter_type_id is not None:
        inverter = crud.inverter_type.get(db=db, id=design_in.inverter_type_id)
        if not inverter:
            raise HTTPException(status_code=404, detail="Inverter type not found")
    
    design = crud.solar_design.update(db=db, db_obj=design, obj_in=design_in)
    return design


@router.delete("/designs/{design_id}")
def delete_design(
    *,
    db: Session = Depends(deps.get_db),
    design_id: int,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Delete a solar design.
    """
    design = crud.solar_design.get(db=db, id=design_id)
    if not design:
        raise HTTPException(status_code=404, detail="Design not found")
    
    # Verificar permisos
    project = crud.project.get(db=db, id=design.project_id)
    if project.owner_id != current_user.id and not crud.user.is_superuser(current_user):
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    # Verificar si tiene análisis financieros asociados
    if design.financial_analyses:
        raise HTTPException(
            status_code=400,
            detail="Cannot delete design with financial analyses. Delete analyses first."
        )
    
    db.delete(design)
    db.commit()
    return {"message": "Design deleted successfully"}


@router.post("/designs/{design_id}/clone", response_model=schemas.SolarDesign)
def clone_design(
    *,
    db: Session = Depends(deps.get_db),
    design_id: int,
    new_name: str = Query(..., description="Name for the cloned design"),
    target_project_id: Optional[int] = Query(None, description="Target project ID (if different)"),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Clone an existing solar design to the same or different project.
    """
    # Obtener el diseño original
    original_design = crud.solar_design.get(db=db, id=design_id)
    if not original_design:
        raise HTTPException(status_code=404, detail="Design not found")
    
    # Verificar permisos en el diseño original
    project = crud.project.get(db=db, id=original_design.project_id)
    if project.owner_id != current_user.id and not crud.user.is_superuser(current_user):
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    # Si se especifica un proyecto destino diferente, verificar permisos
    if target_project_id and target_project_id != original_design.project_id:
        target_project = crud.project.get(db=db, id=target_project_id)
        if not target_project:
            raise HTTPException(status_code=404, detail="Target project not found")
        if target_project.owner_id != current_user.id and not crud.user.is_superuser(current_user):
            raise HTTPException(status_code=403, detail="Not enough permissions on target project")
        project_id = target_project_id
    else:
        project_id = original_design.project_id
    
    # Crear copia del diseño
    design_data = schemas.SolarDesignCreate(
        project_id=project_id,
        name=new_name,
        capacity_mw=original_design.capacity_mw,
        panel_type_id=original_design.panel_type_id,
        inverter_type_id=original_design.inverter_type_id,
        tilt_angle=original_design.tilt_angle,
        azimuth_angle=original_design.azimuth_angle,
        row_spacing=original_design.row_spacing,
        module_orientation=original_design.module_orientation,
        modules_per_string=original_design.modules_per_string,
        strings_per_inverter=original_design.strings_per_inverter,
        total_inverters=original_design.total_inverters,
        installation_area=original_design.installation_area
    )
    
    new_design = crud.solar_design.create(db=db, obj_in=design_data)
    return new_design


# ========== Cálculos auxiliares ==========
@router.post("/designs/{design_id}/calculate-electrical", response_model=dict)
def calculate_electrical_configuration(
    *,
    db: Session = Depends(deps.get_db),
    design_id: int,
    target_dc_ac_ratio: float = Query(1.25, ge=1.0, le=2.0, description="Target DC/AC ratio"),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Calculate optimal electrical configuration (strings, inverters) for a design.
    
    This endpoint calculates:
    - Optimal number of modules per string based on voltage constraints
    - Number of strings and inverters needed
    - Actual DC/AC ratio achieved
    """
    design = crud.solar_design.get(db=db, id=design_id)
    if not design:
        raise HTTPException(status_code=404, detail="Design not found")
    
    # Verificar permisos
    project = crud.project.get(db=db, id=design.project_id)
    if project.owner_id != current_user.id and not crud.user.is_superuser(current_user):
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    # Verificar que tenga panel e inversor
    if not design.panel_type_id or not design.inverter_type_id:
        raise HTTPException(
            status_code=400, 
            detail="Design must have panel and inverter types selected"
        )
    
    panel = crud.panel_type.get(db=db, id=design.panel_type_id)
    inverter = crud.inverter_type.get(db=db, id=design.inverter_type_id)
    
    # Cálculos básicos
    total_panels = int(design.capacity_mw * 1_000_000 / panel.power_watts)
    
    # Calcular módulos por string basado en voltajes
    # Considerar temperatura mínima (-10°C) para Voc máximo
    temp_min = -10
    temp_coeff_voc = panel.temp_coeff_voc or -0.0029  # Valor típico si no está definido
    voc_at_min_temp = panel.voc * (1 + temp_coeff_voc * (temp_min - 25))
    
    # Considerar temperatura máxima (70°C célula) para Vmp mínimo
    temp_max = 70
    temp_coeff_vmp = panel.temp_coeff_pmax or -0.0034  # Valor típico
    vmp_at_max_temp = panel.vmp * (1 + temp_coeff_vmp * (temp_max - 25))
    
    # Calcular límites de módulos por string
    max_modules_per_string = int(inverter.vdc_max / voc_at_min_temp * 0.98)  # 2% margen
    min_modules_per_string = int(inverter.vdc_min / vmp_at_max_temp * 1.02) + 1  # 2% margen
    
    # Usar el valor especificado o calcular el óptimo
    if design.modules_per_string:
        modules_per_string = design.modules_per_string
        # Validar que esté en rango
        if modules_per_string > max_modules_per_string:
            modules_per_string = max_modules_per_string
        elif modules_per_string < min_modules_per_string:
            modules_per_string = min_modules_per_string
    else:
        # Buscar el valor óptimo cercano a 20-24 módulos
        target_modules = 22
        modules_per_string = max(min_modules_per_string, 
                                min(max_modules_per_string, target_modules))
    
    # Calcular strings totales
    total_strings = total_panels // modules_per_string
    panels_used = total_strings * modules_per_string
    
    # Calcular inversores necesarios basado en el ratio DC/AC objetivo
    ac_capacity_needed = (panels_used * panel.power_watts) / target_dc_ac_ratio
    total_inverters = max(1, int(ac_capacity_needed / inverter.power_ac_w + 0.5))
    
    # Calcular strings por inversor
    strings_per_inverter = total_strings // total_inverters
    if strings_per_inverter == 0:
        strings_per_inverter = 1
        total_inverters = total_strings
    
    # Verificar límites de MPPT
    if inverter.mppt_channels and strings_per_inverter > inverter.mppt_channels * 4:
        # Asumiendo máximo 4 strings por MPPT
        strings_per_inverter = inverter.mppt_channels * 4
        total_inverters = max(1, total_strings // strings_per_inverter)
    
    # Calcular capacidades finales
    actual_dc_capacity = panels_used * panel.power_watts / 1_000_000
    actual_ac_capacity = total_inverters * inverter.power_ac_w / 1_000_000
    actual_dc_ac_ratio = actual_dc_capacity / actual_ac_capacity if actual_ac_capacity > 0 else 0
    
    # Calcular pérdidas por clipping estimadas
    clipping_losses = 0
    if actual_dc_ac_ratio > 1.5:
        clipping_losses = (actual_dc_ac_ratio - 1.5) * 2  # Aproximación simple
    
    # Actualizar el diseño con los cálculos
    update_data = schemas.SolarDesignUpdate(
        modules_per_string=modules_per_string,
        strings_per_inverter=strings_per_inverter,
        total_inverters=total_inverters
    )
    
    crud.solar_design.update(db=db, db_obj=design, obj_in=update_data)
    
    return {
        "configuration": {
            "total_panels": total_panels,
            "panels_used": panels_used,
            "panels_unused": total_panels - panels_used,
            "modules_per_string": modules_per_string,
            "total_strings": total_strings,
            "strings_per_inverter": strings_per_inverter,
            "total_inverters": total_inverters,
            "strings_per_mppt": strings_per_inverter / inverter.mppt_channels if inverter.mppt_channels else None
        },
        "capacity": {
            "dc_capacity_mw": actual_dc_capacity,
            "ac_capacity_mw": actual_ac_capacity,
            "dc_ac_ratio": round(actual_dc_ac_ratio, 2),
            "target_dc_ac_ratio": target_dc_ac_ratio
        },
        "voltage_limits": {
            "min_modules_per_string": min_modules_per_string,
            "max_modules_per_string": max_modules_per_string,
            "string_voc_min_temp": round(modules_per_string * voc_at_min_temp, 1),
            "string_vmp_max_temp": round(modules_per_string * vmp_at_max_temp, 1),
            "inverter_vdc_range": f"{inverter.vdc_min}-{inverter.vdc_max}V"
        },
        "warnings": []
    }


@router.post("/designs/{design_id}/update-area", response_model=schemas.SolarDesign)
def update_installation_area(
    *,
    db: Session = Depends(deps.get_db),
    design_id: int,
    area_geojson: dict = Body(..., description="Installation area as GeoJSON polygon"),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Update the installation area polygon for a design.
    
    Expected GeoJSON format:
    {
        "type": "Polygon",
        "coordinates": [[[lng, lat], [lng, lat], ...]]
    }
    """
    design = crud.solar_design.get(db=db, id=design_id)
    if not design:
        raise HTTPException(status_code=404, detail="Design not found")
    
    # Verificar permisos
    project = crud.project.get(db=db, id=design.project_id)
    if project.owner_id != current_user.id and not crud.user.is_superuser(current_user):
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    # Validar formato GeoJSON básico
    if area_geojson.get("type") != "Polygon":
        raise HTTPException(status_code=400, detail="Area must be a GeoJSON Polygon")
    
    if "coordinates" not in area_geojson:
        raise HTTPException(status_code=400, detail="Missing coordinates in GeoJSON")
    
    # Actualizar área
    update_data = schemas.SolarDesignUpdate(installation_area=area_geojson)
    design = crud.solar_design.update(db=db, db_obj=design, obj_in=update_data)
    
    return design


# ========== Validaciones ==========
@router.post("/designs/{design_id}/validate", response_model=dict)
def validate_design(
    *,
    db: Session = Depends(deps.get_db),
    design_id: int,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Validate a solar design configuration.
    
    Checks for:
    - Component compatibility
    - Electrical configuration validity
    - Required fields for simulation
    """
    design = crud.solar_design.get(db=db, id=design_id)
    if not design:
        raise HTTPException(status_code=404, detail="Design not found")
    
    # Verificar permisos
    project = crud.project.get(db=db, id=design.project_id)
    if project.owner_id != current_user.id and not crud.user.is_superuser(current_user):
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    errors = []
    warnings = []
    info = []
    
    # Validar componentes
    if not design.panel_type_id:
        errors.append("No panel type selected")
    if not design.inverter_type_id:
        errors.append("No inverter type selected")
    
    # Validar área de instalación
    if not design.installation_area:
        warnings.append("No installation area defined - required for shading analysis")
    
    # Validar configuración eléctrica si hay componentes
    if design.panel_type_id and design.inverter_type_id:
        panel = crud.panel_type.get(db=db, id=design.panel_type_id)
        inverter = crud.inverter_type.get(db=db, id=design.inverter_type_id)
        
        if design.modules_per_string:
            # Verificar voltajes con temperaturas extremas
            temp_min = -10
            temp_max = 70
            
            # Voltage checks
            temp_coeff_voc = panel.temp_coeff_voc or -0.0029
            voc_at_min_temp = panel.voc * (1 + temp_coeff_voc * (temp_min - 25))
            string_voc = design.modules_per_string * voc_at_min_temp
            
            temp_coeff_vmp = panel.temp_coeff_pmax or -0.0034
            vmp_at_max_temp = panel.vmp * (1 + temp_coeff_vmp * (temp_max - 25))
            string_vmp = design.modules_per_string * vmp_at_max_temp
            
            if string_voc > inverter.vdc_max:
                errors.append(
                    f"String voltage at minimum temperature ({string_voc:.1f}V) "
                    f"exceeds inverter maximum ({inverter.vdc_max}V)"
                )
            if string_vmp < inverter.vdc_min:
                errors.append(
                    f"String voltage at maximum temperature ({string_vmp:.1f}V) "
                    f"is below inverter minimum ({inverter.vdc_min}V)"
                )
            
            # Power checks
            if design.total_inverters:
                total_dc_power = design.capacity_mw * 1_000_000
                total_ac_power = design.total_inverters * inverter.power_ac_w
                dc_ac_ratio = total_dc_power / total_ac_power if total_ac_power > 0 else 0
                
                if dc_ac_ratio > 1.6:
                    warnings.append(
                        f"High DC/AC ratio ({dc_ac_ratio:.2f}) may result in "
                        "significant clipping losses"
                    )
                elif dc_ac_ratio < 1.1:
                    warnings.append(
                        f"Low DC/AC ratio ({dc_ac_ratio:.2f}) may result in "
                        "underutilized inverter capacity"
                    )
        else:
            warnings.append("Electrical configuration not calculated")
    
    # Validar ángulos
    if design.tilt_angle is not None:
        if design.tilt_angle < 0 or design.tilt_angle > 90:
            errors.append("Tilt angle must be between 0 and 90 degrees")
        elif abs(project.latitude or 0) > 23.5 and design.tilt_angle == 0:
            warnings.append(
                "Zero tilt angle may not be optimal for this latitude"
            )
    else:
        warnings.append("No tilt angle specified")
    
    if design.azimuth_angle is not None:
        if design.azimuth_angle < 0 or design.azimuth_angle >= 360:
            errors.append("Azimuth angle must be between 0 and 359 degrees")
        # Hemisferio sur: óptimo es norte (0°)
        # Hemisferio norte: óptimo es sur (180°)
        if project.latitude:
            optimal_azimuth = 0 if project.latitude < 0 else 180
            azimuth_deviation = abs(design.azimuth_angle - optimal_azimuth)
            if azimuth_deviation > 45 and azimuth_deviation < 315:
                info.append(
                    f"Azimuth angle deviates significantly from optimal "
                    f"({optimal_azimuth}° for this hemisphere)"
                )
    else:
        warnings.append("No azimuth angle specified")
    
    # Información adicional
    if design.panel_type_id and design.capacity_mw:
        panel = crud.panel_type.get(db=db, id=design.panel_type_id)
        total_panels = int(design.capacity_mw * 1_000_000 / panel.power_watts)
        area_needed = total_panels * panel.area_m2
        info.append(f"Estimated area needed: {area_needed:,.0f} m² ({area_needed/10000:.2f} hectares)")
    
    # Estado de simulación
    ready_to_simulate = len(errors) == 0 and design.panel_type_id and design.inverter_type_id
    
    return {
        "valid": len(errors) == 0,
        "ready_to_simulate": ready_to_simulate,
        "errors": errors,
        "warnings": warnings,
        "info": info,
        "status": design.status,
        "design_summary": {
            "name": design.name,
            "capacity_mw": design.capacity_mw,
            "panel_selected": bool(design.panel_type_id),
            "inverter_selected": bool(design.inverter_type_id),
            "area_defined": bool(design.installation_area),
            "electrical_configured": bool(design.modules_per_string)
        }
    }


# ========== Resumen del diseño ==========
@router.get("/designs/{design_id}/summary", response_model=dict)
def get_design_summary(
    *,
    db: Session = Depends(deps.get_db),
    design_id: int,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get a comprehensive summary of the design including calculations.
    """
    design = crud.solar_design.get(db=db, id=design_id)
    if not design:
        raise HTTPException(status_code=404, detail="Design not found")
    
    # Verificar permisos
    project = crud.project.get(db=db, id=design.project_id)
    if project.owner_id != current_user.id and not crud.user.is_superuser(current_user):
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    summary = {
        "design": {
            "id": design.id,
            "name": design.name,
            "version": design.version,
            "status": design.status,
            "created_at": design.created_at,
            "updated_at": design.updated_at
        },
        "project": {
            "id": project.id,
            "name": project.name,
            "location": {
                "latitude": project.latitude,
                "longitude": project.longitude
            }
        },
        "capacity": {
            "dc_mw": design.capacity_mw,
            "ac_mw": None,
            "dc_ac_ratio": None
        },
        "components": {},
        "configuration": {
            "tilt_angle": design.tilt_angle,
            "azimuth_angle": design.azimuth_angle,
            "row_spacing": design.row_spacing,
            "module_orientation": design.module_orientation
        },
        "electrical": {},
        "area": {
            "defined": bool(design.installation_area),
            "estimated_m2": None
        },
        "simulation": {
            "completed": bool(design.simulation_results),
            "annual_production_mwh": design.annual_production_mwh,
            "capacity_factor": design.capacity_factor,
            "performance_ratio": design.performance_ratio
        }
    }
    
    # Agregar detalles de componentes si existen
    if design.panel_type_id:
        panel = crud.panel_type.get(db=db, id=design.panel_type_id)
        total_panels = int(design.capacity_mw * 1_000_000 / panel.power_watts)
        summary["components"]["panel"] = {
            "manufacturer": panel.manufacturer,
            "model": panel.model,
            "power_w": panel.power_watts,
            "quantity": total_panels,
            "total_area_m2": total_panels * panel.area_m2
        }
        summary["area"]["estimated_m2"] = total_panels * panel.area_m2
    
    if design.inverter_type_id:
        inverter = crud.inverter_type.get(db=db, id=design.inverter_type_id)
        summary["components"]["inverter"] = {
            "manufacturer": inverter.manufacturer,
            "model": inverter.model,
            "power_ac_w": inverter.power_ac_w,
            "quantity": design.total_inverters or 0
        }
        
        if design.total_inverters:
            ac_capacity = design.total_inverters * inverter.power_ac_w / 1_000_000
            summary["capacity"]["ac_mw"] = ac_capacity
            summary["capacity"]["dc_ac_ratio"] = round(design.capacity_mw / ac_capacity, 2)
    
    # Agregar configuración eléctrica si existe
    if design.modules_per_string:
        summary["electrical"] = {
            "modules_per_string": design.modules_per_string,
            "strings_per_inverter": design.strings_per_inverter,
            "total_strings": (total_panels // design.modules_per_string 
                            if 'total_panels' in locals() else None)
        }
    
    return summary