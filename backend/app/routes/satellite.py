"""Satellite / NDVI routes — POST /api/satellite/ndvi"""
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from app.services.satellite_service import get_satellite_data

router = APIRouter()


class SatelliteRequest(BaseModel):
    lat: float
    lon: float
    polygon: Optional[list[list[float]]] = None


@router.post("/ndvi")
async def satellite_ndvi(req: SatelliteRequest):
    """Return NDVI vegetation analysis for given coordinates."""
    return await get_satellite_data(req.lat, req.lon, req.polygon)
