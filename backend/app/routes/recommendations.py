"""
AI Recommendations route — POST /api/recommendations
"""
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from app.services.ai_service import generate_recommendations

router = APIRouter()


class RecommendationRequest(BaseModel):
    farm_name: str = "My Farm"
    crop: str = "Rice"
    weather: dict
    soil: dict
    satellite: dict
    risks: dict
    yield_data: dict


@router.post("")
async def get_recommendations(req: RecommendationRequest):
    """Generate AI-powered farm recommendations."""
    recs = await generate_recommendations(
        farm_name=req.farm_name,
        crop=req.crop,
        weather=req.weather,
        soil=req.soil,
        satellite=req.satellite,
        risks=req.risks,
        yield_data=req.yield_data,
    )
    return {
        "recommendations": recs,
        "disclaimer": "AI recommendations are decision-support estimates and should be validated with local agricultural experts.",
    }
