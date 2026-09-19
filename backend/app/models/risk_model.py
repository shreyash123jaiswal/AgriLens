"""
Risk Assessment Model for AgriLens AI.
Scores four risk dimensions: drought, flood, crop stress, disease/pest.
Uses calibrated rule-based scoring with agronomic thresholds.
"""
import logging

logger = logging.getLogger(__name__)


def assess_risks(
    weather: dict,
    soil: dict,
    ndvi: float,
    crop: str = "Rice",
    forecast_rain_mm: float = 0,
) -> dict:
    """
    Assess four farm risk dimensions and return a structured risk dict.
    Each risk has: score (0-100), label, explanation.
    """
    temperature = weather.get("temperature_c", 28)
    humidity = weather.get("humidity", 65)
    rainfall = weather.get("rainfall_mm", 10)
    moisture = soil.get("moisture", 55)

    return {
        "drought":      _drought_risk(temperature, rainfall, moisture, forecast_rain_mm, ndvi),
        "flood":        _flood_risk(rainfall, forecast_rain_mm, moisture),
        "crop_stress":  _crop_stress_risk(temperature, humidity, ndvi, moisture),
        "disease_pest": _disease_pest_risk(humidity, temperature, rainfall, ndvi),
    }


def _drought_risk(temp, rain, moisture, forecast_rain, ndvi) -> dict:
    """Higher score = higher drought risk."""
    score = 0
    notes = []

    # Temperature contribution
    if temp > 35:
        score += 30
        notes.append(f"High temperature ({temp}°C) accelerates moisture loss")
    elif temp > 30:
        score += 15
        notes.append(f"Elevated temperature ({temp}°C)")

    # Rainfall contribution
    if rain < 5:
        score += 25
        notes.append("Very low current rainfall")
    elif rain < 15:
        score += 12

    # Soil moisture
    if moisture < 30:
        score += 30
        notes.append(f"Soil moisture critically low ({moisture}%)")
    elif moisture < 45:
        score += 18
        notes.append(f"Soil moisture is low ({moisture}%)")
    else:
        score -= 10  # Good moisture reduces drought risk

    # Forecast rain reduces risk
    if forecast_rain > 30:
        score -= 15
    elif forecast_rain > 15:
        score -= 8

    # NDVI (low NDVI can mean water stress)
    if ndvi < 0.3:
        score += 15

    score = max(0, min(100, score))
    label = "High" if score >= 70 else "Moderate" if score >= 45 else "Low"

    explanation = notes[0] if notes else "Conditions are within acceptable range for drought management."
    if label == "Low" and not notes:
        explanation = f"Soil moisture ({moisture}%) and rainfall are adequate. Drought risk is low for now."

    return {"score": score, "label": label, "explanation": explanation}


def _flood_risk(rain, forecast_rain, moisture) -> dict:
    """Higher score = higher flood/waterlogging risk."""
    score = 0
    notes = []

    if forecast_rain > 80:
        score += 45
        notes.append(f"Very heavy rain forecast ({forecast_rain} mm)")
    elif forecast_rain > 50:
        score += 28
        notes.append(f"Heavy rain forecast ({forecast_rain} mm) may cause waterlogging")
    elif forecast_rain > 25:
        score += 12

    if moisture > 80:
        score += 30
        notes.append("Soil is already saturated")
    elif moisture > 70:
        score += 15

    if rain > 40:
        score += 20
    elif rain > 20:
        score += 10

    score = max(0, min(100, score))
    label = "High" if score >= 70 else "Moderate" if score >= 45 else "Low"

    if not notes:
        notes.append(f"Drainage is adequate. Forecast rain ({forecast_rain} mm) is within manageable range.")

    return {"score": score, "label": label, "explanation": notes[0]}


def _crop_stress_risk(temp, humidity, ndvi, moisture) -> dict:
    """Heat and water stress risk."""
    score = 0
    notes = []

    if temp > 38:
        score += 40
        notes.append(f"Extreme heat ({temp}°C) will cause significant crop stress")
    elif temp > 34:
        score += 22
        notes.append(f"High temperature ({temp}°C) may cause heat stress")
    elif temp > 32:
        score += 10

    if humidity < 40:
        score += 20
        notes.append(f"Low humidity ({humidity}%) increases transpiration stress")
    elif humidity < 50:
        score += 10

    if ndvi < 0.35:
        score += 25
        notes.append(f"Low NDVI ({ndvi}) indicates existing crop stress")
    elif ndvi < 0.5:
        score += 10

    if moisture < 35:
        score += 15

    score = max(0, min(100, score))
    label = "High" if score >= 70 else "Moderate" if score >= 45 else "Low"

    if not notes:
        notes.append(f"Temperature ({temp}°C) and humidity ({humidity}%) are within safe crop growth range.")

    return {"score": score, "label": label, "explanation": notes[0]}


def _disease_pest_risk(humidity, temp, rain, ndvi) -> dict:
    """Disease and pest pressure risk."""
    score = 0
    notes = []

    # High humidity + warm conditions = fungal disease risk
    if humidity > 80 and temp > 25:
        score += 35
        notes.append(f"High humidity ({humidity}%) with warm temperatures ({temp}°C) — elevated fungal disease risk")
    elif humidity > 70 and temp > 22:
        score += 20
        notes.append(f"Moderate humidity ({humidity}%) may encourage fungal pathogens")

    # Heavy rain spreads soil-borne diseases
    if rain > 30:
        score += 20
        notes.append("Recent heavy rainfall increases soil-borne disease spread")
    elif rain > 15:
        score += 10

    # Low NDVI could indicate existing disease/pest damage
    if ndvi < 0.4:
        score += 20
        notes.append("Low NDVI may indicate existing pest or disease damage")
    elif ndvi < 0.55:
        score += 10

    score = max(0, min(100, score))
    label = "High" if score >= 70 else "Moderate" if score >= 45 else "Low"

    if not notes:
        notes.append(f"Current humidity ({humidity}%) and temperature ({temp}°C) are within safe range for disease prevention.")

    return {"score": score, "label": label, "explanation": notes[0]}
