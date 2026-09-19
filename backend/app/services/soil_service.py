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

    # Climate-zone and soil region heuristics
    is_black_cotton = (15 <= lat <= 22.8 and 73 <= lon <= 81.5)
    is_arid = (24 <= lat <= 32 and 69 <= lon <= 75.5)
    is_alluvial = (23 <= lat <= 33 and 74 <= lon <= 89)
    is_tropical_south = (8 <= lat <= 18 and 74 <= lon <= 80.5) or (lat < 15)

    # pH and NPK calibration
    if is_black_cotton:
        ph = round(rng.uniform(7.2, 8.2), 1)
        n_num = rng.uniform(75, 115)
        p_num = rng.uniform(35, 52)
        k_num = rng.uniform(18, 30)  # Optimal for Cotton, Soybean, Pulses
        soil_type = "Black Cotton Clay"
        moisture = rng.randint(45, 65)
    elif is_arid:
        ph = round(rng.uniform(7.5, 8.4), 1)
        n_num = rng.uniform(22, 45)
        p_num = rng.uniform(45, 75)
        k_num = rng.uniform(18, 32)  # Optimal for Chickpea, Mothbeans, Pulses
        soil_type = "Arid Sandy Loam"
        moisture = rng.randint(20, 42)
    elif is_alluvial:
        ph = round(rng.uniform(6.5, 7.5), 1)
        n_num = rng.uniform(75, 110)
        p_num = rng.uniform(42, 65)
        k_num = rng.uniform(22, 42)  # Optimal for Rice, Wheat, Maize, Sugarcane, Jute
        soil_type = rng.choice(["Alluvial Loam", "Gangetic Silt Loam", "Clay Loam"])
        moisture = rng.randint(50, 72)
    elif is_tropical_south:
        ph = round(rng.uniform(5.5, 6.7), 1)
        n_num = rng.uniform(25, 55)
        p_num = rng.uniform(18, 42)
        k_num = rng.uniform(26, 46)  # Optimal for Coconut, Banana, Spices, Mango
        soil_type = rng.choice(["Red Laterite", "Coastal Loam", "Red Sandy Loam"])
        moisture = rng.randint(55, 78)
    else:
        ph = round(rng.uniform(6.2, 7.3), 1)
        n_num = rng.uniform(50, 85)
        p_num = rng.uniform(35, 58)
        k_num = rng.uniform(20, 38)
        soil_type = rng.choice(["Loam", "Sandy Loam", "Clay Loam"])
        moisture = rng.randint(40, 65)

    def _get_label(val):
        if val < 40: return "Low"
        if val < 75: return "Medium"
        return "High"

    nitrogen = _get_label(n_num)
    phosphorus = _get_label(p_num)
    potassium = _get_label(k_num)

    # Organic carbon (%)
    oc = round(rng.uniform(0.6, 2.2), 1)

    # Overall soil score (0-100)
    score = _compute_soil_score(ph, nitrogen, phosphorus, potassium, moisture, oc)

    return {
        "ph": ph,
        "nitrogen": nitrogen,
        "phosphorus": phosphorus,
        "potassium": potassium,
        "nitrogen_num": round(n_num, 1),
        "phosphorus_num": round(p_num, 1),
        "potassium_num": round(k_num, 1),
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
