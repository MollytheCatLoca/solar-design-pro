#!/bin/bash
# Script helper para llamadas a la API con autenticación
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbkBiaXNpbnRlZ3JhY2lvbmVzLmNvbSIsImV4cCI6MTc1MTQ3NDE1MX0.UqEAlTWfS6qTbeHCbbS0SdwmPlq01tdy-uTTql2zoAs"
BASE_URL="http://localhost:8001"

# Si no se pasan argumentos, mostrar ayuda
if [ $# -eq 0 ]; then
    echo "Uso: ./api.sh [endpoint] [método] [datos]"
    echo ""
    echo "Ejemplos:"
    echo "  ./api.sh /users/me                    # GET"
    echo "  ./api.sh /api/v1/solar/panels         # GET" 
    echo "  ./api.sh /api/v1/projects POST '{"name":"Test"}'  # POST con datos"
    exit 1
fi

ENDPOINT=$1
METHOD=${2:-GET}
DATA=$3

if [ "$METHOD" = "GET" ]; then
    curl -s -H "Authorization: Bearer $TOKEN" "$BASE_URL$ENDPOINT" | python -m json.tool
elif [ "$METHOD" = "POST" ] || [ "$METHOD" = "PUT" ]; then
    curl -s -X $METHOD -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "$DATA" "$BASE_URL$ENDPOINT" | python -m json.tool
else
    curl -s -X $METHOD -H "Authorization: Bearer $TOKEN" "$BASE_URL$ENDPOINT" | python -m json.tool
fi
