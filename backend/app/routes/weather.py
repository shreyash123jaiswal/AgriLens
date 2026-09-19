"""Weather routes — GET /api/weather"""
from fastapi import APIRouter, Query
from app.services.weather_service import get_weather

router = APIRouter()

@router.get("")
async def weather(
    lat: float = Query(..., description="Latitude"),
    lon: float = Query(..., description="Longitude"),
):
    """Fetch weather data for the given coordinates."""
    return await get_weather(lat, lon)
