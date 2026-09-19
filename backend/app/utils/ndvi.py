"""
NDVI utility functions for AgriLens AI
"""
import math
import random
from datetime import datetime, timedelta


def calculate_ndvi(nir: float, red: float) -> float:
    """
    Standard NDVI formula: (NIR - Red) / (NIR + Red)
    Returns value in range [-1, 1].
    """
    denom = nir + red
    if denom == 0:
        return 0.0
    return round((nir - red) / denom, 4)


def ndvi_health_label(ndvi: float) -> str:
    """Classify NDVI value into a human-readable health label."""
    if ndvi >= 0.8:
        return "Dense / Very Healthy"
    elif ndvi >= 0.6:
        return "Healthy"
    elif ndvi >= 0.4:
        return "Moderate"
    elif ndvi >= 0.2:
        return "Sparse / Stressed"
    else:
        return "Bare / Severely Stressed"


def generate_ndvi_time_series(
    base_ndvi: float,
    months: int = 6,
    season: str = "kharif",
) -> list[dict]:
    """
    Generate a realistic NDVI time-series for demo purposes.
    Simulates crop growth curve: slow start → peak → harvest decline.
    """
    month_names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                   "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

    # Start from 6 months ago
    now = datetime.now()
    start_month = (now.month - months) % 12
    results = []

    for i in range(months):
        month_idx = (start_month + i) % 12
        # Growth curve: sigmoid-like
        t = i / (months - 1)  # 0 → 1
        growth = math.sin(t * math.pi)  # peak at midseason
        ndvi = base_ndvi * 0.5 + base_ndvi * 0.5 * growth
        # Add small noise
        ndvi += random.uniform(-0.03, 0.03)
        ndvi = round(max(0.1, min(0.95, ndvi)), 2)
        results.append({"month": month_names[month_idx], "ndvi": ndvi})

    return results


def estimate_ndvi_from_coords(lat: float, lon: float) -> float:
    """
    Estimate a plausible NDVI value based on geographic coordinates.
    Uses simplified climate zone heuristics for demo mode.
    """
    # Tropical/equatorial band → higher vegetation
    if -10 <= lat <= 25 and 65 <= lon <= 100:
        base = random.uniform(0.55, 0.78)  # South/Southeast Asia agricultural zones
    elif 25 <= lat <= 40:
        base = random.uniform(0.40, 0.65)  # Drier subtropics
    elif -10 <= lat <= 10:
        base = random.uniform(0.60, 0.85)  # Tropical
    else:
        base = random.uniform(0.35, 0.60)

    return round(base, 2)
