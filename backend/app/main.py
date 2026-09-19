from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
import logging

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

# Import routers
from app.routes import farm, weather, satellite, soil, prediction, recommendations

app = FastAPI(
    title="AgriLens AI API",
    description="AI-powered geospatial smart agriculture platform — Farm Intelligence API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS — allow React frontend
cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in cors_origins],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(farm.router,            prefix="/api/farms",          tags=["Farm Analysis"])
app.include_router(weather.router,         prefix="/api/weather",        tags=["Weather"])
app.include_router(satellite.router,       prefix="/api/satellite",      tags=["Satellite"])
app.include_router(soil.router,            prefix="/api/soil",           tags=["Soil"])
app.include_router(prediction.router,      prefix="/api/predict",        tags=["ML Predictions"])
app.include_router(recommendations.router, prefix="/api/recommendations", tags=["AI Recommendations"])


@app.get("/", tags=["Root"])
async def root():
    return {
        "message": "AgriLens AI Backend is running!",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/api/health",
    }


@app.get("/api/health", tags=["Root"])
async def health_check():
    """Backend health check endpoint."""
    return {
        "status": "healthy",
        "service": "AgriLens AI",
        "version": "1.0.0",
        "message": "All systems operational",
        "endpoints": {
            "analyze":         "POST /api/farms/analyze",
            "weather":         "GET  /api/weather?lat=&lon=",
            "soil":            "POST /api/soil/analyze",
            "satellite":       "POST /api/satellite/ndvi",
            "crop_prediction": "POST /api/predict/crops",
            "yield_prediction":"POST /api/predict/yield",
            "risk_prediction": "POST /api/predict/risk",
            "recommendations": "POST /api/recommendations",
        },
    }