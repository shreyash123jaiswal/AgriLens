"""
ML Prediction routes:
  POST /api/predict/crops  — crop suitability
  POST /api/predict/yield  — yield prediction
  POST /api/predict/risk   — risk assessment
"""
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional

from app.models.crop_model import rank_crops
from app.models.yield_model import predict_yield
from app.models.risk_model import assess_risks

router = APIRouter()


class CropRequest(BaseModel):
    soil: dict
    weather: dict
    ndvi: float = 0.55
    area_ha: float = 1.0
    top_n: int = 5


class YieldRequest(BaseModel):
    crop: str = "Rice"
    soil: dict
    weather: dict
    ndvi: float = 0.55
    area_ha: float = 1.0


class RiskRequest(BaseModel):
    weather: dict
    soil: dict
    ndvi: float = 0.55
    crop: str = "Rice"
    forecast_rain_mm: float = 0.0


@router.post("/crops")
async def predict_crops(req: CropRequest):
    """Rank all crops by suitability score."""
    features = {
        **req.soil,
        "temperature_c": req.weather.get("temperature_c", 28),
        "rainfall_mm": req.weather.get("rainfall_mm", 15),
        "humidity": req.weather.get("humidity", 65),
        "ndvi": req.ndvi,
        "area_ha": req.area_ha,
    }
    return {"crops": rank_crops(features, top_n=req.top_n)}


@router.post("/yield")
async def predict_yield_endpoint(req: YieldRequest):
    """Predict yield in tonnes/hectare."""
    return predict_yield(req.crop, req.soil, req.weather, req.ndvi, req.area_ha)


@router.post("/risk")
async def predict_risk(req: RiskRequest):
    """Assess farm risk across four dimensions."""
    return assess_risks(req.weather, req.soil, req.ndvi, req.crop, req.forecast_rain_mm)
