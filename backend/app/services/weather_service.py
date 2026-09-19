"""
Weather Service for AgriLens AI.
Primary provider: Open-Meteo (free, no API key required).
Fallback: mock / demo data.
"""
import random
import logging
from datetime import datetime
import httpx

logger = logging.getLogger(__name__)

# Open-Meteo free API endpoint
OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast"

# WMO weather condition codes → labels
WMO_CODES = {
    0: "Clear Sky", 1: "Mainly Clear", 2: "Partly Cloudy", 3: "Overcast",
    45: "Foggy", 48: "Icy Fog",
    51: "Light Drizzle", 53: "Drizzle", 55: "Heavy Drizzle",
    61: "Light Rain", 63: "Rain", 65: "Heavy Rain",
    71: "Light Snow", 73: "Snow", 75: "Heavy Snow",
    80: "Rain Showers", 81: "Heavy Showers", 82: "Violent Showers",
    95: "Thunderstorm", 96: "Thunderstorm with Hail",
}


async def get_weather(lat: float, lon: float) -> dict:
    """
    Fetch weather data for given coordinates.
    Returns normalised weather dict regardless of provider used.
    """
    try:
        data = await _fetch_open_meteo(lat, lon)
        logger.info(f"Weather fetched from Open-Meteo for ({lat}, {lon})")
        return data
    except Exception as e:
        logger.warning(f"Open-Meteo failed ({e}), using demo weather data")
        return _generate_demo_weather(lat)


async def _fetch_open_meteo(lat: float, lon: float) -> dict:
    """Fetch from Open-Meteo free weather API."""
    params = {
        "latitude": lat,
        "longitude": lon,
        "current": "temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m",
        "daily": "temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code",
        "timezone": "auto",
        "forecast_days": 7,
    }
    async with httpx.AsyncClient(timeout=10.0) as client:
        resp = await client.get(OPEN_METEO_URL, params=params)
        resp.raise_for_status()
        raw = resp.json()

    current = raw.get("current", {})
    daily = raw.get("daily", {})

    temperature = current.get("temperature_2m", 28)
    humidity = current.get("relative_humidity_2m", 65)
    rainfall = current.get("precipitation", 0)
    wind = current.get("wind_speed_10m", 10)
    wmo = current.get("weather_code", 1)
    description = WMO_CODES.get(wmo, "Clear")

    # Build 7-day trend
    day_names = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    temps_max = daily.get("temperature_2m_max", [])
    rains = daily.get("precipitation_sum", [])
    trend = []
    for i in range(min(7, len(temps_max))):
        trend.append({
            "day": day_names[i % 7],
            "temp": round(temps_max[i], 1),
            "rain": round(rains[i], 1) if i < len(rains) else 0,
        })

    forecast_rain = round(sum(rains[:7]), 1) if rains else 0

    return {
        "temperature_c": round(temperature, 1),
        "humidity": int(humidity),
        "rainfall_mm": round(rainfall, 1),
        "wind_kph": round(wind, 1),
        "description": description,
        "forecast_rain_mm": forecast_rain,
        "trend": trend,
        "source": "open-meteo",
        "demo": False,
    }


def _generate_demo_weather(lat: float) -> dict:
    """Generate realistic demo weather based on latitude."""
    # Tropical zones (India / SE Asia) → warm and humid
    if -10 <= lat <= 30:
        temp = random.uniform(26, 34)
        humidity = random.randint(60, 82)
        rainfall = random.uniform(5, 25)
        description = random.choice(["Partly Cloudy", "Humid", "Overcast", "Light Rain"])
    else:
        temp = random.uniform(15, 28)
        humidity = random.randint(45, 70)
        rainfall = random.uniform(0, 15)
        description = random.choice(["Mainly Clear", "Partly Cloudy", "Light Drizzle"])

    day_names = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    trend = []
    for i, day in enumerate(day_names):
        trend.append({
            "day": day,
            "temp": round(temp + random.uniform(-3, 3), 1),
            "rain": round(random.uniform(0, 30), 1),
        })

    forecast_rain = round(sum(d["rain"] for d in trend), 1)

    return {
        "temperature_c": round(temp, 1),
        "humidity": humidity,
        "rainfall_mm": round(rainfall, 1),
        "wind_kph": round(random.uniform(8, 18), 1),
        "description": description,
        "forecast_rain_mm": forecast_rain,
        "trend": trend,
        "source": "demo",
        "demo": True,
    }
