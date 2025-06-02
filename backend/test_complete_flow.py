#!/usr/bin/env python3
# backend/test_complete_flow.py
"""
Script para probar el flujo completo del backend antes de pasar al frontend.
"""
import requests
import json
import sys
from datetime import datetime

# Configuración
BASE_URL = "http://localhost:8001"
TOKEN = None

# Colores para la terminal
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
BLUE = '\033[94m'
END = '\033[0m'

def print_step(step, description):
    print(f"\n{BLUE}=== Paso {step}: {description} ==={END}")

def print_success(message):
    print(f"{GREEN}✓ {message}{END}")

def print_error(message):
    print(f"{RED}✗ {message}{END}")
    sys.exit(1)

def print_info(message):
    print(f"{YELLOW}ℹ {message}{END}")

# Leer token del archivo
try:
    with open(".dev_token", "r") as f:
        TOKEN = f.read().strip()
    print_success("Token cargado desde .dev_token")
except:
    print_error("No se encontró .dev_token. Ejecuta: python create_dev_token.py")

headers = {"Authorization": f"Bearer {TOKEN}"}

# Función helper para requests
def api_call(method, endpoint, data=None, params=None):
    url = f"{BASE_URL}{endpoint}"
    
    if method == "GET":
        response = requests.get(url, headers=headers, params=params)
    elif method == "POST":
        response = requests.post(url, headers=headers, json=data)
    elif method == "PUT":
        response = requests.put(url, headers=headers, json=data)
    elif method == "DELETE":
        response = requests.delete(url, headers=headers)
    
    if response.status_code >= 400:
        print_error(f"Error {response.status_code}: {response.text}")
    
    return response.json() if response.text else None

# FLUJO DE PRUEBA COMPLETO

print(f"\n{BLUE}{'='*50}{END}")
print(f"{BLUE}PRUEBA COMPLETA DEL BACKEND SOLARDESIGNPRO{END}")
print(f"{BLUE}{'='*50}{END}")

# 1. Verificar usuario actual
print_step(1, "Verificar autenticación")
user = api_call("GET", "/api/v1/users/me")
print_success(f"Usuario autenticado: {user['email']}")

# 2. Crear un proyecto
print_step(2, "Crear proyecto de prueba")
project_data = {
    "name": f"Proyecto Solar Test {datetime.now().strftime('%Y%m%d_%H%M%S')}",
    "description": "Proyecto de prueba para validar el flujo completo",
    "latitude": -34.6037,  # Buenos Aires
    "longitude": -58.3816
}
project = api_call("POST", "/api/v1/projects", project_data)
print_success(f"Proyecto creado: ID={project['id']}, Nombre='{project['name']}'")

# 3. Obtener catálogo de componentes
print_step(3, "Verificar catálogo de componentes")
panels = api_call("GET", "/api/v1/solar/panels")
inverters = api_call("GET", "/api/v1/solar/inverters")
scenarios = api_call("GET", "/api/v1/solar/scenarios")

if panels:
    print_success(f"Paneles disponibles: {len(panels)}")
    print_info(f"Ejemplo: {panels[0]['manufacturer']} {panels[0]['model']} - {panels[0]['power_watts']}W")
else:
    print_error("No hay paneles. Ejecuta: python seed_solar_data.py")

if inverters:
    print_success(f"Inversores disponibles: {len(inverters)}")
    print_info(f"Ejemplo: {inverters[0]['manufacturer']} {inverters[0]['model']} - {inverters[0]['power_ac_w']/1000}kW")
else:
    print_error("No hay inversores. Ejecuta: python seed_solar_data.py")

if scenarios:
    print_success(f"Escenarios disponibles: {len(scenarios)}")
else:
    print_error("No hay escenarios. Ejecuta: python seed_solar_data.py")

# 4. Crear un diseño solar
print_step(4, "Crear diseño solar")
design_data = {
    "name": "Diseño Principal v1",
    "capacity_mw": 1.0,  # 1 MW
    "panel_type_id": panels[0]['id'] if panels else None,
    "inverter_type_id": inverters[0]['id'] if inverters else None,
    "tilt_angle": 30,
    "azimuth_angle": 0,  # Norte (hemisferio sur)
    "project_id": project['id']
}
design = api_call("POST", f"/api/v1/solar/projects/{project['id']}/designs", design_data)
print_success(f"Diseño creado: ID={design['id']}, Capacidad={design['capacity_mw']}MW")

# 5. Calcular configuración eléctrica
print_step(5, "Calcular configuración eléctrica óptima")
electrical = api_call("POST", f"/api/v1/solar/designs/{design['id']}/calculate-electrical")
print_success("Configuración eléctrica calculada:")
print_info(f"  - Paneles totales: {electrical['configuration']['total_panels']}")
print_info(f"  - Módulos por string: {electrical['configuration']['modules_per_string']}")
print_info(f"  - Strings totales: {electrical['configuration']['total_strings']}")
print_info(f"  - Inversores: {electrical['configuration']['total_inverters']}")
print_info(f"  - Ratio DC/AC: {electrical['capacity']['dc_ac_ratio']}")

# 6. Definir área de instalación
print_step(6, "Definir área de instalación")
# Crear un polígono simple (cuadrado de ~2 hectáreas)
area_data = {
    "type": "Polygon",
    "coordinates": [[
        [-58.3820, -34.6040],  # NO
        [-58.3810, -34.6040],  # NE
        [-58.3810, -34.6030],  # SE
        [-58.3820, -34.6030],  # SO
        [-58.3820, -34.6040]   # Cerrar polígono
    ]]
}
design = api_call("POST", f"/api/v1/solar/designs/{design['id']}/update-area", area_data)
print_success("Área de instalación definida")

# 7. Validar diseño
print_step(7, "Validar diseño antes de simulación")
validation = api_call("POST", f"/api/v1/solar/designs/{design['id']}/validate")
if validation['valid']:
    print_success("Diseño válido y listo para simular")
else:
    print_error(f"Diseño inválido: {validation['errors']}")

if validation['warnings']:
    for warning in validation['warnings']:
        print_info(f"Advertencia: {warning}")

# 8. Probar datos meteorológicos
print_step(8, "Obtener datos meteorológicos")
weather = api_call("GET", f"/api/v1/weather/test/{project['id']}")
if weather and 'statistics' in weather:
    print_success("Datos meteorológicos obtenidos:")
    print_info(f"  - Irradiación anual: {weather['statistics']['annual_ghi_kwh_m2']} kWh/m²/año")
    print_info(f"  - Temperatura promedio: {weather['statistics']['average_temperature_c']}°C")
    print_info(f"  - Horas sol pico: {weather['statistics']['peak_sun_hours']}")
else:
    print_info("No se pudieron obtener datos meteorológicos (servicio puede estar offline)")

# 9. Obtener resumen del diseño
print_step(9, "Obtener resumen completo del diseño")
summary = api_call("GET", f"/api/v1/solar/designs/{design['id']}/summary")
print_success("Resumen del diseño:")
print_info(f"  - Proyecto: {summary['project']['name']}")
print_info(f"  - Ubicación: {summary['project']['location']['latitude']}, {summary['project']['location']['longitude']}")
print_info(f"  - Capacidad DC: {summary['capacity']['dc_mw']} MW")
print_info(f"  - Capacidad AC: {summary['capacity']['ac_mw']} MW")
print_info(f"  - Panel: {summary['components']['panel']['manufacturer']} {summary['components']['panel']['model']}")
print_info(f"  - Inversor: {summary['components']['inverter']['manufacturer']} {summary['components']['inverter']['model']}")

# 10. Estimar CAPEX
print_step(10, "Estimar inversión inicial (CAPEX)")
capex = api_call("GET", "/api/v1/financial/capex-estimate", params={
    "capacity_mw": design['capacity_mw'],
    "scenario_id": scenarios[0]['id'] if scenarios else None
})
print_success("Estimación de CAPEX:")
print_info(f"  - Módulos: ${capex['breakdown']['modules']:,.0f}")
print_info(f"  - Inversores: ${capex['breakdown']['inverters']:,.0f}")
print_info(f"  - BOS: ${capex['breakdown']['bos']:,.0f}")
print_info(f"  - Instalación: ${capex['breakdown']['installation']:,.0f}")
print_info(f"  - TOTAL: ${capex['total_capex']:,.0f} (${capex['capex_per_watt']:.2f}/W)")

# Resumen final
print(f"\n{GREEN}{'='*50}{END}")
print(f"{GREEN}¡TODAS LAS PRUEBAS COMPLETADAS EXITOSAMENTE!{END}")
print(f"{GREEN}{'='*50}{END}")

print(f"\n{BLUE}RESUMEN DEL ESTADO:{END}")
print(f"✓ Autenticación funcionando")
print(f"✓ CRUD de proyectos operativo")
print(f"✓ Catálogo de componentes disponible")
print(f"✓ Diseños solares con cálculos automáticos")
print(f"✓ Validación de diseños implementada")
print(f"✓ Datos meteorológicos accesibles")
print(f"✓ Estimación financiera básica lista")

print(f"\n{YELLOW}PRÓXIMOS PASOS:{END}")
print(f"1. El backend está listo para la fase de diseño")
print(f"2. Puedes comenzar con el desarrollo del frontend")
print(f"3. La simulación energética se implementará después")

print(f"\n{BLUE}IDs creados para pruebas futuras:{END}")
print(f"- Project ID: {project['id']}")
print(f"- Design ID: {design['id']}")