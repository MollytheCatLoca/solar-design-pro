# backend/app/routers/weather.py
from typing import Any, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
import httpx
from datetime import datetime, timedelta
from app import deps, models, schemas
from app.database import SessionLocal

router = APIRouter()


@router.get("/location", response_model=dict)
async def get_weather_data(
    *,
    latitude: float = Query(..., ge=-90, le=90, description="Latitude"),
    longitude: float = Query(..., ge=-180, le=180, description="Longitude"),
    source: str = Query("pvgis", regex="^(pvgis|openmeteo)$", description="Weather data source"),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get weather data for a specific location.
    
    Sources:
    - pvgis: JRC PVGIS service (European Commission)
    - openmeteo: Open-Meteo API (alternative)
    """
    db = SessionLocal()
    
    # Verificar si tenemos datos en caché
    existing = db.query(models.WeatherData).filter(
        models.WeatherData.latitude == round(latitude, 3),
        models.WeatherData.longitude == round(longitude, 3),
        models.WeatherData.source == source,
        models.WeatherData.expires_at > datetime.utcnow()
    ).first()
    
    if existing:
        db.close()
        return {
            "source": existing.source,
            "location": {
                "latitude": existing.latitude,
                "longitude": existing.longitude
            },
            "cached": True,
            "data": existing.weather_data
        }
    
    # Obtener nuevos datos
    weather_data = await fetch_weather_data(latitude, longitude, source)
    
    if weather_data:
        # Guardar en caché
        new_weather = models.WeatherData(
            latitude=round(latitude, 3),
            longitude=round(longitude, 3),
            weather_data=weather_data,
            source=source,
            year=datetime.now().year,
            expires_at=datetime.utcnow() + timedelta(days=30)
        )
        db.add(new_weather)
        db.commit()
        
        result = {
            "source": source,
            "location": {
                "latitude": latitude,
                "longitude": longitude
            },
            "cached": False,
            "data": weather_data
        }
        db.close()
        return result
    
    db.close()
    raise HTTPException(status_code=503, detail="Weather service unavailable")


async def fetch_weather_data(lat: float, lon: float, source: str) -> Optional[dict]:
    """
    Fetch weather data from external sources.
    """
    async with httpx.AsyncClient(timeout=30.0) as client:
        if source == "pvgis":
            # PVGIS API v5.2
            url = "https://re.jrc.ec.europa.eu/api/v5_2/tmy"
            params = {
                "lat": lat,
                "lon": lon,
                "outputformat": "json",
                "browser": 0
            }
            
            try:
                response = await client.get(url, params=params)
                response.raise_for_status()
                
                data = response.json()
                
                # Procesar datos de PVGIS
                hourly_data = data.get("outputs", {}).get("tmy_hourly", [])
                
                # Extraer arrays de 8760 valores
                ghi = []
                dni = []
                dhi = []
                temp_air = []
                wind_speed = []
                
                for hour in hourly_data:
                    ghi.append(hour.get("G(h)", 0))  # Global horizontal
                    dni.append(hour.get("Gb(n)", 0))  # Direct normal
                    dhi.append(hour.get("Gd(h)", 0))  # Diffuse horizontal
                    temp_air.append(hour.get("T2m", 20))  # Temperature 2m
                    wind_speed.append(hour.get("WS10m", 2))  # Wind speed 10m
                
                return {
                    "ghi": ghi,
                    "dni": dni,
                    "dhi": dhi,
                    "temp_air": temp_air,
                    "wind_speed": wind_speed,
                    "metadata": {
                        "source": "PVGIS-SARAH2",
                        "resolution": "hourly",
                        "years": data.get("inputs", {}).get("meteo_data", {}).get("year_min", "2005-2020")
                    }
                }
                
            except Exception as e:
                print(f"Error fetching PVGIS data: {e}")
                return None
                
        elif source == "openmeteo":
            # Open-Meteo API (alternativa gratuita)
            url = "https://archive-api.open-meteo.com/v1/archive"
            
            # Obtener datos del año anterior completo
            last_year = datetime.now().year - 1
            params = {
                "latitude": lat,
                "longitude": lon,
                "start_date": f"{last_year}-01-01",
                "end_date": f"{last_year}-12-31",
                "hourly": "temperature_2m,windspeed_10m,direct_radiation,diffuse_radiation,direct_normal_irradiance",
                "timezone": "GMT"
            }
            
            try:
                response = await client.get(url, params=params)
                response.raise_for_status()
                
                data = response.json()
                hourly = data.get("hourly", {})
                
                # Calcular GHI = DNI * cos(zenith) + DHI
                # Simplificación: GHI ≈ direct_radiation + diffuse_radiation
                ghi = []
                for i in range(len(hourly.get("time", []))):
                    direct = hourly["direct_radiation"][i] or 0
                    diffuse = hourly["diffuse_radiation"][i] or 0
                    ghi.append(direct + diffuse)
                
                return {
                    "ghi": ghi,
                    "dni": hourly.get("direct_normal_irradiance", []),
                    "dhi": hourly.get("diffuse_radiation", []),
                    "temp_air": hourly.get("temperature_2m", []),
                    "wind_speed": hourly.get("windspeed_10m", []),
                    "metadata": {
                        "source": "Open-Meteo",
                        "resolution": "hourly",
                        "year": last_year
                    }
                }
                
            except Exception as e:
                print(f"Error fetching Open-Meteo data: {e}")
                return None
    
    return None


@router.get("/test/{project_id}", response_model=dict)
async def test_weather_for_project(
    *,
    db: Session = Depends(deps.get_db),
    project_id: int,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Test weather data retrieval for a project location.
    """
    # Obtener proyecto
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Verificar permisos
    if project.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    if not project.latitude or not project.longitude:
        raise HTTPException(status_code=400, detail="Project has no location defined")
    
    # Obtener datos meteorológicos
    weather_data = await get_weather_data(
        latitude=project.latitude,
        longitude=project.longitude,
        source="pvgis",
        current_user=current_user
    )
    
    # Calcular estadísticas básicas
    if weather_data and "data" in weather_data:
        data = weather_data["data"]
        ghi_annual = sum(data.get("ghi", [])) / 1000  # kWh/m²/año
        avg_temp = sum(data.get("temp_air", [])) / len(data.get("temp_air", [1]))
        
        weather_data["statistics"] = {
            "annual_ghi_kwh_m2": round(ghi_annual, 1),
            "average_temperature_c": round(avg_temp, 1),
            "peak_sun_hours": round(ghi_annual / 365, 2)
        }
    
    return weather_data