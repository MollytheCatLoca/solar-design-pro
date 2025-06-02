# backend/main_working.py
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
import logging

from app.database import SessionLocal, engine
from app.core.config import settings
from app.core import security
from app import crud, schemas, models

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Crear instancia de FastAPI
app = FastAPI(
    title="SolarDesignPro API",
    description="Backend API para SolarDesignPro",
    version="0.1.0",
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción, usar [settings.FRONTEND_URL]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependencia para obtener DB
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "Bienvenido a SolarDesignPro API",
        "version": "0.1.0",
        "docs": "/docs",
        "status": "operational"
    }

# Health check
@app.get("/health")
async def health_check():
    return {"status": "healthy", "database": "connected"}

# Login endpoint
@app.post("/token", response_model=schemas.Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = crud.user.authenticate(
        db, email=form_data.username, password=form_data.password
    )
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

# Register endpoint
@app.post("/register", response_model=schemas.User)
async def register(
    user_in: schemas.UserCreate,
    db: Session = Depends(get_db)
):
    user = crud.user.get_by_email(db, email=user_in.email)
    if user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )
    user = crud.user.create(db, obj_in=user_in)
    return user

# Get current user
async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> models.User:
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = security.jwt.decode(
            token, settings.JWT_SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except Exception:
        raise credentials_exception
    
    user = crud.user.get_by_email(db, email=username)
    if user is None:
        raise credentials_exception
    return user

# Me endpoint
@app.get("/users/me", response_model=schemas.User)
async def read_users_me(current_user: models.User = Depends(get_current_user)):
    return current_user

# Projects endpoints
@app.get("/projects", response_model=list[schemas.Project])
async def list_projects(
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    projects = crud.project.get_multi_by_owner(
        db=db, owner_id=current_user.id, skip=skip, limit=limit
    )
    return projects

@app.post("/projects", response_model=schemas.Project)
async def create_project(
    project_in: schemas.ProjectCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = crud.project.create_with_owner(
        db=db, obj_in=project_in, owner_id=current_user.id
    )
    return project

# Startup event
@app.on_event("startup")
async def startup_event():
    logger.info("Starting up SolarDesignPro API...")
    logger.info(f"Database URL: {settings.DATABASE_URL[:30]}...")
    logger.info("API ready!")

if __name__ == "__main__":
    import uvicorn
    print(f"Starting server at http://localhost:8001")
    print(f"Documentation at http://localhost:8001/docs")
    uvicorn.run(app, host="0.0.0.0", port=8001, reload=True)