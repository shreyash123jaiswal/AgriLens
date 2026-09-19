"""Soil analysis routes — POST /api/soil/analyze"""
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from app.services.soil_service import get_soil_data

router = APIRouter()


class SoilRequest(BaseModel):
    lat: float
    lon: float
    area_ha: Optional[float] = 1.0


@router.post("/analyze")
async def soil_analyze(req: SoilRequest):
    """Return soil profile for the given coordinates."""
    return get_soil_data(req.lat, req.lon, req.area_ha or 1.0)
