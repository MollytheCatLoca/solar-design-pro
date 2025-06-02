#!/usr/bin/env python3
# backend/create_dev_token.py
"""
Crea un token de desarrollo de larga duración
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from datetime import timedelta, datetime
from app.database import SessionLocal
from app.crud import user as crud_user
from app.core import security
from jose import jwt

def check_existing_token():
    """Verifica si ya existe un token válido"""
    if os.path.exists(".dev_token"):
        with open(".dev_token", "r") as f:
            token = f.read().strip()
        
        try:
            # Decodificar para verificar si aún es válido
            payload = jwt.decode(
                token, 
                security.settings.JWT_SECRET_KEY, 
                algorithms=[security.settings.ALGORITHM]
            )
            exp = datetime.fromtimestamp(payload['exp'])
            now = datetime.now()
            
            if exp > now:
                days_left = (exp - now).days
                print(f"✅ Ya tienes un token válido por {days_left} días más")
                print(f"🔑 Token: {token[:50]}...")
                return token
            else:
                print("⚠️  El token existente ha expirado")
        except:
            print("⚠️  El token existente no es válido")
    
    return None

def create_dev_token():
    print("=== Token de Desarrollo para SolarDesignPro ===\n")
    
    # Verificar si ya existe un token válido
    existing_token = check_existing_token()
    if existing_token:
        use_existing = input("\n¿Usar el token existente? (S/n): ").lower()
        if use_existing != 'n':
            return existing_token
    
    email = input("\nEmail (admin@bisintegraciones.com): ") or "admin@bisintegraciones.com"
    
    db = SessionLocal()
    
    # Obtener usuario
    user = crud_user.get_by_email(db, email=email)
    if not user:
        print(f"❌ Usuario {email} no encontrado")
        return None
    
    # Crear token de larga duración (30 días)
    access_token = security.create_access_token(
        data={"sub": user.email},
        expires_delta=timedelta(days=30)
    )
    
    # Guardar en archivo
    with open(".dev_token", "w") as f:
        f.write(access_token)
    
    # Crear script helper para curl
    with open("api.sh", "w") as f:
        f.write(f"""#!/bin/bash
# Script helper para llamadas a la API con autenticación
TOKEN="{access_token}"
BASE_URL="http://localhost:8001"

# Si no se pasan argumentos, mostrar ayuda
if [ $# -eq 0 ]; then
    echo "Uso: ./api.sh [endpoint] [método] [datos]"
    echo ""
    echo "Ejemplos:"
    echo "  ./api.sh /users/me                    # GET"
    echo "  ./api.sh /api/v1/solar/panels         # GET" 
    echo "  ./api.sh /api/v1/projects POST '{{"name":"Test"}}'  # POST con datos"
    exit 1
fi

ENDPOINT=$1
METHOD=${{2:-GET}}
DATA=$3

if [ "$METHOD" = "GET" ]; then
    curl -s -H "Authorization: Bearer $TOKEN" "$BASE_URL$ENDPOINT" | python -m json.tool
elif [ "$METHOD" = "POST" ] || [ "$METHOD" = "PUT" ]; then
    curl -s -X $METHOD -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "$DATA" "$BASE_URL$ENDPOINT" | python -m json.tool
else
    curl -s -X $METHOD -H "Authorization: Bearer $TOKEN" "$BASE_URL$ENDPOINT" | python -m json.tool
fi
""")
    os.chmod("api.sh", 0o755)
    
    # Crear también un archivo HTML para copiar fácil el token
    with open("dev_token.html", "w") as f:
        f.write(f"""<!DOCTYPE html>
<html>
<head>
    <title>Dev Token - SolarDesignPro</title>
    <style>
        body {{ font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }}
        .container {{ max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }}
        .token-box {{ background: #f0f0f0; padding: 15px; border-radius: 5px; word-break: break-all; margin: 20px 0; }}
        button {{ background: #4CAF50; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; }}
        button:hover {{ background: #45a049; }}
        .success {{ color: green; display: none; }}
        code {{ background: #e0e0e0; padding: 2px 6px; border-radius: 3px; }}
    </style>
</head>
<body>
    <div class="container">
        <h1>🔐 Token de Desarrollo - SolarDesignPro</h1>
        <p>Este token es válido por <strong>30 días</strong> desde su creación.</p>
        
        <h3>Tu Token:</h3>
        <div class="token-box" id="token">{access_token}</div>
        <button onclick="copyToken()">📋 Copiar Token</button>
        <span class="success" id="success">✅ ¡Copiado!</span>
        
        <h3>Cómo usar:</h3>
        <ol>
            <li>Abre <a href="http://localhost:8001/docs" target="_blank">http://localhost:8001/docs</a></li>
            <li>Click en el botón <strong>Authorize</strong> 🔒</li>
            <li>Pega el token y click en <strong>Authorize</strong></li>
        </ol>
        
        <h3>Para usar con el script helper:</h3>
        <pre><code>./api.sh /users/me
./api.sh /api/v1/solar/panels
./api.sh /api/v1/projects</code></pre>
    </div>
    
    <script>
        function copyToken() {{
            const token = document.getElementById('token').innerText;
            navigator.clipboard.writeText(token).then(() => {{
                document.getElementById('success').style.display = 'inline';
                setTimeout(() => {{
                    document.getElementById('success').style.display = 'none';
                }}, 2000);
            }});
        }}
    </script>
</body>
</html>""")
    
    print(f"\n✅ Token creado exitosamente!")
    print(f"📝 Archivos creados:")
    print(f"   - .dev_token (el token)")
    print(f"   - api.sh (script helper para curl)")
    print(f"   - dev_token.html (para copiar fácil)")
    print(f"\n⏰ Válido por 30 días (hasta {(datetime.now() + timedelta(days=30)).strftime('%Y-%m-%d')})")
    print(f"\n🌐 Abre dev_token.html en tu navegador para copiar fácil el token")
    print(f"\n🚀 Ejemplos de uso:")
    print(f"   ./api.sh /users/me")
    print(f"   ./api.sh /api/v1/solar/panels")
    
    db.close()
    return access_token

if __name__ == "__main__":
    create_dev_token()
    
    # Abrir automáticamente el HTML
    import webbrowser
    import platform
    
    try:
        file_path = os.path.abspath("dev_token.html")
        if platform.system() == 'Darwin':  # macOS
            os.system(f'open {file_path}')
        elif platform.system() == 'Windows':
            os.startfile(file_path)
        else:  # Linux
            webbrowser.open(f'file://{file_path}')
    except:
        pass