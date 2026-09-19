from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base
from app.routes import auth, projects, sites, analytics

# Create database tables automatically
Base.metadata.create_all(bind=engine)

# Auto-seed if database is brand new (e.g. freshly deployed to Render / Neon)
try:
    from app.database import SessionLocal
    from app.models.models import Project
    from app.seed.seed_data import seed
    _db = SessionLocal()
    if _db.query(Project).count() == 0:
        seed()
    _db.close()
except Exception as _e:
    print(f"Auto-seed check: {_e}")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Full-Stack Geospatial Analytics Platform for Carbon & Biodiversity Projects",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(projects.router, prefix=settings.API_V1_STR)
app.include_router(sites.router, prefix=settings.API_V1_STR)
app.include_router(analytics.router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "message": "Welcome to EcoAtlas API",
        "docs": "/docs",
        "version": settings.VERSION,
        "status": "online"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}
