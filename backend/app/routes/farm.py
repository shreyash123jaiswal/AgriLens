"""
Farm Analysis Route — POST /api/farms/analyze
Orchestrates all services and ML models to produce a complete farm intelligence report.
"""
import logging
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

from app.services.weather_service import get_weather
from app.services.soil_service import get_soil_data
from app.services.satellite_service import get_satellite_data
from app.services.ai_service import generate_recommendations
from app.models.crop_model import rank_crops
from app.models.yield_model import predict_yield
from app.models.risk_model import assess_risks
from app.utils.feature_engineering import (
    compute_polygon_centroid,
    compute_polygon_area_hectares,
    get_season,
)
from app.utils.ndvi import ndvi_health_label

logger = logging.getLogger(__name__)
router = APIRouter()


class FarmAnalysisRequest(BaseModel):
    farm_name: str = Field(default="My Farm", max_length=100)
    crop: str = Field(default="Rice", max_length=50)
    polygon: list[list[float]] = Field(default=[])   # [[lng, lat], ...]
    center: Optional[list[float]] = None              # [lat, lon]

class AreaRequest(BaseModel):
    polygon: list[list[float]]


@router.post("/analyze")
async def analyze_farm(req: FarmAnalysisRequest):
    """
    Full farm analysis endpoint.
    Returns: health, weather, soil, satellite, crops, yield, risks, recommendations.
    """
    try:
        # 1. Determine coordinates
        if req.center and len(req.center) == 2:
            lat, lon = req.center[0], req.center[1]
        elif req.polygon:
            lat, lon = compute_polygon_centroid(req.polygon)
        else:
            # Default: central India
            lat, lon = 20.5937, 78.9629

        area_ha = compute_polygon_area_hectares(req.polygon) if req.polygon else 2.0
        area_ha = max(0.1, area_ha)  # Minimum 0.1 ha

        now = datetime.now()
        season = get_season(lat, now.month)

        logger.info(f"Analyzing farm '{req.farm_name}' at ({lat:.4f}, {lon:.4f}), {area_ha:.2f} ha")

        # 2. Fetch data in parallel
        import asyncio
        weather_task = get_weather(lat, lon)
        satellite_task = get_satellite_data(lat, lon, req.polygon)
        weather, satellite = await asyncio.gather(weather_task, satellite_task)

        # Soil is synchronous
        soil = get_soil_data(lat, lon, area_ha)

        ndvi = satellite.get("ndvi_current", 0.55)

        # 3. Build feature dict for ML models
        features = {
            "ph": soil.get("ph", 6.5),
            "nitrogen": soil.get("nitrogen", "Medium"),
            "phosphorus": soil.get("phosphorus", "Medium"),
            "potassium": soil.get("potassium", "Medium"),
            "moisture": soil.get("moisture", 55),
            "temperature_c": weather.get("temperature_c", 28),
            "rainfall_mm": weather.get("rainfall_mm", 15),
            "humidity": weather.get("humidity", 65),
            "ndvi": ndvi,
            "area_ha": area_ha,
        }

        # 4. Run ML models
        crops = rank_crops(features, top_n=5)
        yield_result = predict_yield(req.crop, soil, weather, ndvi, area_ha)
        risks = assess_risks(
            weather, soil, ndvi, req.crop,
            forecast_rain_mm=weather.get("forecast_rain_mm", 0)
        )

        # 5. Compute overall health score
        ndvi_score = min(100, int(ndvi * 130))
        soil_score = soil.get("score", 70)
        risk_penalty = (
            risks["drought"]["score"] + risks["crop_stress"]["score"]
        ) / 2
        health_score = int((ndvi_score * 0.35 + soil_score * 0.40 + (100 - risk_penalty) * 0.25))
        health_score = max(0, min(100, health_score))

        # 6. AI recommendations
        recommendations = await generate_recommendations(
            farm_name=req.farm_name,
            crop=req.crop,
            weather=weather,
            soil=soil,
            satellite=satellite,
            risks=risks,
            yield_data=yield_result,
        )

        # 7. Assemble response
        # Overall analysis is Live when real coordinates/weather and ML models execute.
        # Sub-components (soil/satellite) retain their individual demo tags for transparency.
        is_fallback_mock = weather.get("demo", False) and not req.polygon and not req.center

        return {
            "demo": is_fallback_mock,
            "farm": {
                "name": req.farm_name,
                "area_hectares": round(area_ha, 2),
                "location": f"({lat:.3f}°N, {lon:.3f}°E)",
                "polygon": req.polygon,
                "crop": req.crop,
                "season": season,
                "analyzed_at": now.isoformat(),
            },
            "health": {
                "score": health_score,
                "ndvi": ndvi,
                "soil_score": soil_score,
                "label": "Good" if health_score >= 75 else "Fair" if health_score >= 50 else "Poor",
            },
            "weather": weather,
            "soil": soil,
            "satellite": satellite,
            "crops": crops,
            "yield": yield_result,
            "risks": risks,
            "recommendations": recommendations,
        }

    except Exception as e:
        logger.error(f"Farm analysis error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@router.post("/area")
async def calculate_area(req: AreaRequest):
    """Calculate farm area from polygon."""
    area = compute_polygon_area_hectares(req.polygon)
    return {"area_hectares": area}
