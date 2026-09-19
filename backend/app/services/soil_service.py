"""
Soil Service for AgriLens AI.
Generates realistic soil profiles from coordinates using rule-based heuristics.
Designed to be swapped out for ISDA Soil Africa, SoilGrids, or other APIs.
"""
import random
import logging
import math

logger = logging.getLogger(__name__)


def get_soil_data(lat: float, lon: float, area_ha: float = 1.0) -> dict:
    """
    Return a soil profile for the given coordinates.
    Currently uses a deterministic-ish demo model based on geographic heuristics.
    Label is always 'demo' so the UI shows the demo indicator.
    """
    try:
        return _generate_soil_profile(lat, lon, area_ha)
    except Exception as e:
        logger.error(f"Soil service error: {e}")
        return _fallback_soil()


def _generate_soil_profile(lat: float, lon: float, area_ha: float) -> dict:
    """
    Rule-based soil profile generator.
    Uses lat/lon to derive plausible soil characteristics.
    """
    # Seed random with hash of coordinates for reproducibility
    seed = int(abs(lat * 1000 + lon * 100)) % 10000
    rng = random.Random(seed)

    # Climate-zone heuristics
    is_tropical = abs(lat) <= 23.5
    is_arid = (15 <= lat <= 35 and 40 <= lon <= 70)  # Middle East / NW India arid
    is_alluvial = (20 <= lat <= 32 and 70 <= lon <= 88)  # Indo-Gangetic plain

    # pH
    if is_alluvial:
        ph = round(rng.uniform(6.2, 7.2), 1)
    elif is_arid:
        ph = round(rng.uniform(7.2, 8.5), 1)
    elif is_tropical:
        ph = round(rng.uniform(5.5, 6.8), 1)
    else:
        ph = round(rng.uniform(5.8, 7.0), 1)

    # Nitrogen
    if is_alluvial:
        nitrogen = rng.choice(["Medium", "Medium", "High"])
    elif is_arid:
        nitrogen = rng.choice(["Low", "Low", "Medium"])
    else:
        nitrogen = rng.choice(["Low", "Medium", "Medium", "High"])

    # Phosphorus
    phosphorus = rng.choice(["Low", "Medium", "Medium", "High", "High"])

    # Potassium
    potassium = rng.choice(["Medium", "Medium", "High", "High"])

    # Moisture (%)
    if is_arid:
        moisture = rng.randint(25, 45)
    elif is_tropical:
        moisture = rng.randint(50, 75)
    else:
        moisture = rng.randint(40, 65)

    # Organic carbon (%)
    oc = round(rng.uniform(0.5, 2.5), 1)

    # Soil type
    soil_types_alluvial = ["Clay Loam", "Silt Loam", "Loamy Sand"]
    soil_types_tropical = ["Red Laterite", "Black Cotton", "Sandy Loam"]
    soil_types_general  = ["Clay Loam", "Sandy Loam", "Silty Clay", "Loam"]

    if is_alluvial:
        soil_type = rng.choice(soil_types_alluvial)
    elif is_tropical:
        soil_type = rng.choice(soil_types_tropical)
    else:
        soil_type = rng.choice(soil_types_general)

    # Overall soil score (0-100)
    score = _compute_soil_score(ph, nitrogen, phosphorus, potassium, moisture, oc)

    return {
        "ph": ph,
        "nitrogen": nitrogen,
        "phosphorus": phosphorus,
        "potassium": potassium,
        "moisture": moisture,
        "organic_carbon": oc,
        "soil_type": soil_type,
        "score": score,
        "source": "demo",
        "demo": True,
    }


def _compute_soil_score(ph, nitrogen, phosphorus, potassium, moisture, oc) -> int:
    """Compute a 0-100 soil health score from individual parameters."""
    level_map = {"Low": 1, "Medium": 2, "High": 3, "Very High": 3.5}
    score = 0

    # pH (optimal 6.0-7.5 for most crops)
    if 6.0 <= ph <= 7.5:
        score += 25
    elif 5.5 <= ph <= 8.0:
        score += 15
    else:
        score += 5

    # Nutrients (each up to ~18 pts)
    n_val = level_map.get(nitrogen, 2)
    p_val = level_map.get(phosphorus, 2)
    k_val = level_map.get(potassium, 2)
    score += min(18, int(n_val / 3.5 * 18))
    score += min(12, int(p_val / 3.5 * 12))
    score += min(10, int(k_val / 3.5 * 10))

    # Moisture (optimal 45-70%)
    if 45 <= moisture <= 70:
        score += 20
    elif 35 <= moisture <= 80:
        score += 12
    else:
        score += 5

    # Organic carbon (higher = better, up to 10 pts)
    score += min(10, int(oc / 2.5 * 10))

    return min(100, max(0, score))


def _fallback_soil() -> dict:
    return {
        "ph": 6.5, "nitrogen": "Medium", "phosphorus": "Medium",
        "potassium": "Medium", "moisture": 55, "organic_carbon": 1.5,
        "soil_type": "Loam", "score": 70, "source": "demo", "demo": True,
    }
