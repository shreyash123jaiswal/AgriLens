"""
Satellite / Vegetation Analysis Service for AgriLens AI.
Primary: Sentinel-2 / Google Earth Engine (when credentials available).
Fallback: Demo NDVI time-series generated from coordinate heuristics.
"""
import logging
from app.utils.ndvi import (
    estimate_ndvi_from_coords,
    generate_ndvi_time_series,
    ndvi_health_label,
)

logger = logging.getLogger(__name__)


async def get_satellite_data(lat: float, lon: float, polygon: list = None) -> dict:
    """
    Return satellite/vegetation analysis for the given location.
    Currently uses demo NDVI generator. Swap get_live_ndvi() in when GEE is available.
    """
    try:
        return await _get_demo_ndvi(lat, lon)
    except Exception as e:
        logger.error(f"Satellite service error: {e}")
        return _fallback_satellite()


async def _get_demo_ndvi(lat: float, lon: float) -> dict:
    """Generate a realistic NDVI profile based on coordinates."""
    ndvi_current = estimate_ndvi_from_coords(lat, lon)
    trend = generate_ndvi_time_series(base_ndvi=ndvi_current, months=6)

    return {
        "ndvi_current": ndvi_current,
        "ndvi_trend": trend,
        "vegetation_status": ndvi_health_label(ndvi_current),
        "source": "demo",
        "demo": True,
    }


def _fallback_satellite() -> dict:
    return {
        "ndvi_current": 0.60,
        "ndvi_trend": [
            {"month": "Apr", "ndvi": 0.40},
            {"month": "May", "ndvi": 0.52},
            {"month": "Jun", "ndvi": 0.58},
            {"month": "Jul", "ndvi": 0.62},
            {"month": "Aug", "ndvi": 0.60},
            {"month": "Sep", "ndvi": 0.55},
        ],
        "vegetation_status": "Moderate",
        "source": "demo",
        "demo": True,
    }
