#!/bin/bash
# backend/kill_port.sh

# Script para matar procesos en puertos específicos

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Puerto por defecto
DEFAULT_PORT=8001

# Función para matar proceso en un puerto
kill_port() {
    local port=$1
    echo -e "${YELLOW}Buscando procesos en el puerto $port...${NC}"
    
    # Buscar el PID del proceso usando el puerto
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        PID=$(lsof -ti :$port)
    else
        # Linux
        PID=$(lsof -ti :$port)
    fi
    
    if [ -z "$PID" ]; then
        echo -e "${GREEN}No hay procesos ejecutándose en el puerto $port${NC}"
    else
        echo -e "${RED}Proceso encontrado con PID: $PID${NC}"
        echo -e "${YELLOW}Matando proceso...${NC}"
        kill -9 $PID
        
        # Verificar si se mató exitosamente
        sleep 1
        if lsof -ti :$port > /dev/null 2>&1; then
            echo -e "${RED}Error: No se pudo matar el proceso${NC}"
            exit 1
        else
            echo -e "${GREEN}✓ Proceso eliminado exitosamente${NC}"
        fi
    fi
}

# Main script
echo -e "${GREEN}=== Kill Port Script ===${NC}"

# Verificar si se proporcionó un puerto como argumento
if [ $# -eq 0 ]; then
    echo -e "${YELLOW}Uso: ./kill_port.sh [puerto]${NC}"
    echo -e "${YELLOW}Usando puerto por defecto: $DEFAULT_PORT${NC}"
    PORT=$DEFAULT_PORT
else
    PORT=$1
fi

# Validar que el puerto sea un número
if ! [[ "$PORT" =~ ^[0-9]+$ ]]; then
    echo -e "${RED}Error: El puerto debe ser un número${NC}"
    exit 1
fi

# Matar el proceso
kill_port $PORT

# Opción para matar múltiples puertos comunes
if [ "$PORT" = "all" ] || [ "$1" = "--all" ]; then
    echo -e "\n${YELLOW}Limpiando puertos comunes de desarrollo...${NC}"
    for p in 3000 3001 8000 8001 8080 5000 5001; do
        kill_port $p
    done
fi

echo -e "\n${GREEN}¡Listo! Ahora puedes iniciar tu servidor.${NC}"