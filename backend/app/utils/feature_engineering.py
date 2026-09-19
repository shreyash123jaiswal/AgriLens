"""
Feature engineering utilities for AgriLens AI ML pipeline.
Converts raw farm data into structured feature vectors for ML models.
"""
import math
from typing import Optional


def compute_polygon_centroid(polygon: list[list[float]]) -> tuple[float, float]:
    """
    Compute the centroid of a polygon given as [[lng, lat], ...].
    Returns (lat, lon).
    """
    if not polygon:
        return (20.5937, 78.9629)  # India center default
    lats = [p[1] for p in polygon]
    lons = [p[0] for p in polygon]
    return (sum(lats) / len(lats), sum(lons) / len(lons))


def compute_polygon_area_hectares(polygon: list[list[float]]) -> float:
    """
    Compute approximate area of polygon (given as [[lng, lat], ...]) in hectares.
    Uses Shoelace formula + lat correction.
    """
    if not polygon or len(polygon) < 3:
        return 0.0
    n = len(polygon)
    area = 0.0
    for i in range(n):
        j = (i + 1) % n
        area += polygon[i][0] * polygon[j][1]
        area -= polygon[j][0] * polygon[i][1]
    area = abs(area) / 2.0
    mid_lat = sum(p[1] for p in polygon) / n
    # Convert degrees² to m² then to hectares
    m_per_deg_lat = 111320
    m_per_deg_lon = 111320 * math.cos(math.radians(mid_lat))
    area_m2 = area * m_per_deg_lat * m_per_deg_lon
    return round(area_m2 / 10000, 4)


def build_crop_features(
    soil: dict,
    weather: dict,
    ndvi: float,
    area_ha: float,
    crop: str,
) -> list[float]:
    """
    Build feature vector for crop suitability model.
    Returns: [ph, nitrogen_num, phosphorus_num, potassium_num,
               moisture, temperature, rainfall, humidity, ndvi, area]
    """
    level_map = {"Low": 1, "Medium": 2, "High": 3, "Very High": 4}
    return [
        float(soil.get("ph", 6.5)),
        float(level_map.get(soil.get("nitrogen", "Medium"), 2)),
        float(level_map.get(soil.get("phosphorus", "Medium"), 2)),
        float(level_map.get(soil.get("potassium", "Medium"), 2)),
        float(soil.get("moisture", 50)),
        float(weather.get("temperature_c", 28)),
        float(weather.get("rainfall_mm", 15)),
        float(weather.get("humidity", 65)),
        float(ndvi),
        float(area_ha),
    ]


def build_yield_features(
    soil: dict,
    weather: dict,
    ndvi: float,
    area_ha: float,
    crop: str,
) -> list[float]:
    """
    Build feature vector for yield prediction model.
    Returns: [ph, moisture, temperature, rainfall, humidity, ndvi, area, n, p, k]
    """
    level_map = {"Low": 1, "Medium": 2, "High": 3, "Very High": 4}
    return [
        float(soil.get("ph", 6.5)),
        float(soil.get("moisture", 50)),
        float(weather.get("temperature_c", 28)),
        float(weather.get("rainfall_mm", 15)),
        float(weather.get("humidity", 65)),
        float(ndvi),
        float(area_ha),
        float(level_map.get(soil.get("nitrogen", "Medium"), 2)),
        float(level_map.get(soil.get("phosphorus", "Medium"), 2)),
        float(level_map.get(soil.get("potassium", "Medium"), 2)),
    ]


def build_risk_features(
    soil: dict,
    weather: dict,
    ndvi: float,
    forecast_rain_mm: float = 0,
) -> list[float]:
    """
    Build feature vector for risk assessment model.
    Returns: [temperature, rainfall, forecast_rain, humidity, moisture, ndvi]
    """
    return [
        float(weather.get("temperature_c", 28)),
        float(weather.get("rainfall_mm", 15)),
        float(forecast_rain_mm),
        float(weather.get("humidity", 65)),
        float(soil.get("moisture", 50)),
        float(ndvi),
    ]


def get_climate_zone(lat: float) -> str:
    """Simple climate zone classification by latitude."""
    if abs(lat) <= 10:
        return "tropical"
    elif abs(lat) <= 23.5:
        return "subtropical"
    elif abs(lat) <= 40:
        return "temperate_warm"
    else:
        return "temperate_cool"


def get_season(lat: float, month: int) -> str:
    """Determine current agricultural season."""
    is_northern = lat >= 0
    if is_northern:
        if month in [6, 7, 8, 9]:
            return "kharif"     # Monsoon crop
        elif month in [11, 12, 1, 2]:
            return "rabi"       # Winter crop
        else:
            return "zaid"       # Summer/short season
    else:
        if month in [12, 1, 2, 3]:
            return "summer"
        elif month in [6, 7, 8]:
            return "winter"
        else:
            return "shoulder"
