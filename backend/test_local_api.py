#!/usr/bin/env python3
# backend/test_local_api.py
import requests

print("=== Probando API local ===\n")

# Test root
try:
    response = requests.get("http://localhost:8001/")
    print(f"Root endpoint: {response.status_code}")
    print(f"Response: {response.json()}\n")
except Exception as e:
    print(f"Error: {e}\n")

# Test health
try:
    response = requests.get("http://localhost:8001/health")
    print(f"Health endpoint: {response.status_code}")
    print(f"Response: {response.json()}\n")
except Exception as e:
    print(f"Error: {e}\n")

# Test docs
try:
    response = requests.get("http://localhost:8001/docs")
    print(f"Docs endpoint: {response.status_code}")
    print(f"Docs disponibles en: http://localhost:8001/docs\n")
except Exception as e:
    print(f"Error: {e}\n")

print("✅ Si ves respuestas 200, el servidor está funcionando correctamente!")
print("🌐 Abre http://localhost:8001/docs en tu navegador")