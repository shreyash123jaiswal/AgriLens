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
    location_name: Optional[str] = Field(default=None, max_length=200)
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
        # In agronomy and the crop suitability dataset, rainfall is seasonal/monthly cumulative (50-250mm).
        # Open-Meteo provides forecast_rain_mm (7-day sum) and rainfall_mm (current 1-hour).
        # We extrapolate to monthly rainfall and calibrate with regional climatic norms.
        forecast_7d = float(weather.get("forecast_rain_mm", 0))
        now_month = now.month
        is_monsoon = now_month in [6, 7, 8, 9]
        is_winter = now_month in [11, 12, 1, 2]

        if is_monsoon:
            base_rain = 190.0 if (8 <= lat <= 20 and 72 <= lon <= 77) or lon >= 85 else 125.0
        elif is_winter:
            base_rain = 55.0 if lat > 27 else 35.0
        else:
            base_rain = 45.0

        if forecast_7d > 0:
            seasonal_rain = round(0.4 * base_rain + 0.6 * (forecast_7d * 4.0), 1)
        else:
            seasonal_rain = base_rain

        features = {
            "ph": soil.get("ph", 6.5),
            "nitrogen": soil.get("nitrogen", "Medium"),
            "phosphorus": soil.get("phosphorus", "Medium"),
            "potassium": soil.get("potassium", "Medium"),
            "nitrogen_num": soil.get("nitrogen_num", 70.0),
            "phosphorus_num": soil.get("phosphorus_num", 50.0),
            "potassium_num": soil.get("potassium_num", 45.0),
            "moisture": soil.get("moisture", 55),
            "temperature_c": weather.get("temperature_c", 28),
            "rainfall_mm": seasonal_rain,
            "humidity": weather.get("humidity", 65),
            "ndvi": ndvi,
            "area_ha": area_ha,
            "lat": lat,
            "lon": lon,
            "month": now_month,
            "season": season,
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
        is_fallback_mock = weather.get("demo", False) and not req.polygon and not req.center

        place_label = (req.location_name or "").strip()
        loc_str = f"{place_label} ({lat:.3f}°N, {lon:.3f}°E)" if place_label else f"({lat:.3f}°N, {lon:.3f}°E)"

        return {
            "demo": is_fallback_mock,
            "farm": {
                "name": req.farm_name,
                "place_name": place_label or "Selected Farm",
                "location": loc_str,
                "coordinates": f"{lat:.3f}°N, {lon:.3f}°E",
                "area_hectares": round(area_ha, 2),
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
