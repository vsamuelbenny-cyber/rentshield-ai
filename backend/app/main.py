from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.database import init_db, SessionLocal
from app.services.seeder import seed_database_if_empty
from app.api.routes_analysis import router as analysis_router
from app.api.routes_listings import router as listings_router
from app.api.routes_dashboard import router as dashboard_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize tables and seed demo data
    init_db()
    db = SessionLocal()
    try:
        seed_database_if_empty(db)
    finally:
        db.close()
    yield
    # Shutdown logic if any

app = FastAPI(
    title="RentShield AI API",
    description="Rental Scam & Fake Listing Detection Engine",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static file serving for uploads
app.mount("/uploads", StaticFiles(directory=str(settings.upload_dir)), name="uploads")

# Include API Routers
app.include_router(analysis_router)
app.include_router(listings_router)
app.include_router(dashboard_router)

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "app": settings.app_name,
        "environment": settings.environment,
        "database": "sqlite_ready",
        "image_engine": "pillow_imagehash_phash"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
