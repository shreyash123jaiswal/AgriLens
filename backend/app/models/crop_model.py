"""
Crop Suitability Model for AgriLens AI.
Loads the trained RandomForestClassifier from ml/saved_models/crop_model.pkl.
Falls back to rule-based scoring if the model file is not found.
"""
import os
import pickle
import logging
import numpy as np

logger = logging.getLogger(__name__)

# Path to saved model (relative to project root)
_candidates = [
    os.path.normpath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "ml", "saved_models", "crop_model.pkl")),
    os.path.normpath(os.path.join(os.path.dirname(__file__), "..", "..", "ml", "saved_models", "crop_model.pkl")),
    os.path.normpath(os.path.join(os.getcwd(), "ml", "saved_models", "crop_model.pkl")),
    os.path.normpath(os.path.join(os.getcwd(), "..", "ml", "saved_models", "crop_model.pkl")),
]
_MODEL_PATH = next((p for p in _candidates if os.path.exists(p)), _candidates[0])

# Global model cache
_ARTIFACT = None


def _load_model():
    global _ARTIFACT
    if _ARTIFACT is not None:
        return _ARTIFACT
    if os.path.exists(_MODEL_PATH):
        with open(_MODEL_PATH, "rb") as f:
            _ARTIFACT = pickle.load(f)
        logger.info(f"Crop model loaded from {_MODEL_PATH} | accuracy={_ARTIFACT.get('accuracy', '?')}")
    else:
        logger.warning(f"Crop model not found at {_MODEL_PATH} — using rule-based fallback")
        _ARTIFACT = None
    return _ARTIFACT


# Crop requirement profiles for rule-based fallback
CROP_REQUIREMENTS = {
    "rice":       {"ph": (5.5, 7.0), "temp": (22, 35), "rain": (10, 50), "moisture": (60, 85), "ndvi_min": 0.3},
    "wheat":      {"ph": (6.0, 7.5), "temp": (15, 28), "rain": (5, 30),  "moisture": (40, 65), "ndvi_min": 0.3},
    "maize":      {"ph": (5.8, 7.0), "temp": (20, 34), "rain": (5, 35),  "moisture": (45, 70), "ndvi_min": 0.25},
    "cotton":     {"ph": (5.8, 8.0), "temp": (25, 38), "rain": (2, 20),  "moisture": (30, 55), "ndvi_min": 0.2},
    "sugarcane":  {"ph": (6.0, 7.5), "temp": (24, 38), "rain": (15, 60), "moisture": (55, 80), "ndvi_min": 0.35},
    "soybean":    {"ph": (6.0, 7.0), "temp": (20, 32), "rain": (8, 35),  "moisture": (45, 70), "ndvi_min": 0.25},
    "pulses":     {"ph": (6.0, 7.5), "temp": (18, 32), "rain": (3, 25),  "moisture": (35, 60), "ndvi_min": 0.2},
    "tomato":     {"ph": (5.5, 7.0), "temp": (20, 32), "rain": (5, 30),  "moisture": (50, 75), "ndvi_min": 0.3},
    "jute":       {"ph": (6.0, 7.5), "temp": (24, 38), "rain": (15, 50), "moisture": (60, 85), "ndvi_min": 0.3},
    "coffee":     {"ph": (5.5, 6.5), "temp": (18, 28), "rain": (15, 50), "moisture": (55, 80), "ndvi_min": 0.4},
    "coconut":    {"ph": (5.5, 7.5), "temp": (25, 38), "rain": (10, 50), "moisture": (50, 75), "ndvi_min": 0.3},
    "banana":     {"ph": (5.5, 7.0), "temp": (24, 35), "rain": (10, 60), "moisture": (60, 85), "ndvi_min": 0.35},
    "mango":      {"ph": (5.5, 7.5), "temp": (24, 38), "rain": (5, 40),  "moisture": (45, 70), "ndvi_min": 0.3},
    "grapes":     {"ph": (5.5, 7.0), "temp": (15, 35), "rain": (2, 20),  "moisture": (35, 60), "ndvi_min": 0.25},
    "watermelon": {"ph": (6.0, 7.0), "temp": (24, 35), "rain": (2, 20),  "moisture": (40, 65), "ndvi_min": 0.2},
    "papaya":     {"ph": (6.0, 7.0), "temp": (25, 38), "rain": (5, 40),  "moisture": (50, 75), "ndvi_min": 0.3},
    "chickpea":   {"ph": (6.0, 8.0), "temp": (15, 30), "rain": (2, 20),  "moisture": (30, 55), "ndvi_min": 0.2},
    "lentil":     {"ph": (6.0, 8.0), "temp": (15, 28), "rain": (2, 18),  "moisture": (30, 55), "ndvi_min": 0.2},
    "blackgram":  {"ph": (5.8, 7.5), "temp": (20, 35), "rain": (5, 25),  "moisture": (40, 65), "ndvi_min": 0.2},
    "mungbean":   {"ph": (6.0, 7.5), "temp": (25, 38), "rain": (5, 25),  "moisture": (40, 65), "ndvi_min": 0.2},
    "mothbeans":  {"ph": (6.0, 8.0), "temp": (25, 40), "rain": (2, 15),  "moisture": (25, 50), "ndvi_min": 0.15},
    "kidneybeans":{"ph": (6.0, 7.5), "temp": (18, 30), "rain": (5, 25),  "moisture": (40, 65), "ndvi_min": 0.25},
    "pigeonpeas": {"ph": (5.5, 7.5), "temp": (18, 38), "rain": (5, 30),  "moisture": (35, 65), "ndvi_min": 0.2},
    "orange":     {"ph": (6.0, 7.5), "temp": (18, 32), "rain": (5, 30),  "moisture": (45, 70), "ndvi_min": 0.3},
    "pomegranate":{"ph": (6.0, 8.0), "temp": (20, 40), "rain": (2, 20),  "moisture": (30, 55), "ndvi_min": 0.2},
    "muskmelon":  {"ph": (6.0, 7.5), "temp": (24, 38), "rain": (2, 20),  "moisture": (35, 60), "ndvi_min": 0.2},
    "apple":      {"ph": (5.5, 7.0), "temp": (10, 25), "rain": (5, 30),  "moisture": (40, 65), "ndvi_min": 0.3},
}

DISPLAY_NAMES = {
    "rice": "Rice", "wheat": "Wheat", "maize": "Maize", "cotton": "Cotton",
    "sugarcane": "Sugarcane", "soybean": "Soybean", "pulses": "Pulses",
    "tomato": "Tomato", "jute": "Jute", "coffee": "Coffee", "coconut": "Coconut",
    "banana": "Banana", "mango": "Mango", "grapes": "Grapes",
    "watermelon": "Watermelon", "papaya": "Papaya", "chickpea": "Chickpea",
    "lentil": "Lentil", "blackgram": "Black Gram", "mungbean": "Mung Bean",
    "mothbeans": "Moth Beans", "kidneybeans": "Kidney Beans",
    "pigeonpeas": "Pigeon Peas", "orange": "Orange", "pomegranate": "Pomegranate",
    "muskmelon": "Muskmelon", "apple": "Apple",
}


CROP_SEASONS = {
    # Kharif (Monsoon: Jun - Oct)
    "rice": "kharif", "maize": "kharif", "cotton": "kharif", "jute": "kharif",
    "soybean": "kharif", "blackgram": "kharif", "mungbean": "kharif",
    "pigeonpeas": "kharif", "pulses": "kharif", "sugarcane": "annual",
    # Rabi (Winter: Nov - Mar)
    "wheat": "rabi", "chickpea": "rabi", "lentil": "rabi", "kidneybeans": "rabi",
    # Zaid (Summer: Mar - May)
    "watermelon": "zaid", "muskmelon": "zaid",
    # Perennial & Plantation
    "banana": "perennial", "coconut": "perennial", "coffee": "perennial",
    "mango": "perennial", "orange": "perennial", "papaya": "perennial",
    "pomegranate": "perennial", "grapes": "perennial", "tomato": "all",
    "mothbeans": "arid_kharif", "apple": "temperate",
}


def _season_affinity(crop: str, month: int) -> float:
    """Evaluate whether crop is currently in season."""
    s = CROP_SEASONS.get(crop, "all")
    is_kharif = month in [6, 7, 8, 9, 10]
    is_rabi = month in [11, 12, 1, 2, 3]
    is_zaid = month in [4, 5]

    if s in ["perennial", "annual", "all"]:
        return 0.95
    if s == "temperate":
        return 0.2  # Apples require cold winters, temperate high altitude

    if is_kharif:
        if s in ["kharif", "arid_kharif"]:
            return 1.25
        elif s == "zaid":
            return 0.12  # Watermelon and muskmelon strictly out of season during monsoon
        elif s == "rabi":
            return 0.35
    elif is_rabi:
        if s == "rabi":
            return 1.30
        elif s == "zaid":
            return 0.10  # Out of season in winter
        elif s in ["kharif", "arid_kharif"]:
            return 0.30
    elif is_zaid:
        if s == "zaid":
            return 1.35  # Watermelon and muskmelon peak in summer
        elif s == "rabi":
            return 0.40
        elif s in ["kharif", "arid_kharif"]:
            return 0.65
    return 0.8


def _regional_affinity(crop: str, lat: float, lon: float) -> float:
    """Agronomic suitability multiplier based on geographic coordinates."""
    m = 1.0
    # Punjab / Haryana / Indo-Gangetic Plains
    if lat >= 24.5 and 73.0 <= lon <= 88.0:
        if crop in ["wheat", "rice", "maize", "sugarcane", "cotton", "jute", "pulses"]:
            m *= 1.4
        if crop in ["apple", "coconut", "coffee"]:
            m *= 0.05
    # Maharashtra / Deccan / Central India (Black cotton soil tract)
    elif 15.0 <= lat <= 24.0 and 72.0 <= lon <= 82.0:
        if crop in ["cotton", "soybean", "sugarcane", "pigeonpeas", "blackgram", "maize", "pomegranate", "pulses"]:
            m *= 1.4
        if crop in ["apple", "coconut", "jute"]:
            m *= 0.05
    # South India / Coastal (Tamil Nadu, Kerala, Coastal Karnataka, AP)
    elif lat < 16.0 or (lat <= 19.0 and (lon <= 75.0 or lon >= 80.0)):
        if crop in ["coconut", "rice", "banana", "coffee", "mango", "pulses"]:
            m *= 1.4
        if crop in ["wheat", "apple"]:
            m *= 0.05
    # Arid Western Zone (Rajasthan, North Gujarat)
    elif 23.5 <= lat <= 30.5 and 69.0 <= lon <= 75.5:
        if crop in ["chickpea", "mothbeans", "lentil", "pomegranate", "cotton", "pulses"]:
            m *= 1.4
        if crop in ["rice", "jute", "apple", "coconut"]:
            m *= 0.05
    # Eastern Delta (West Bengal, Assam, Odisha)
    elif lon >= 85.0:
        if crop in ["rice", "jute", "maize", "banana"]:
            m *= 1.4
        if crop in ["apple", "cotton", "wheat"]:
            m *= 0.05
    return m


def _rule_score(crop_key: str, features: dict) -> int:
    req = CROP_REQUIREMENTS.get(crop_key, {})
    ph = features.get("ph", 6.5)
    temp = features.get("temperature_c", 28)
    rain = features.get("rainfall_mm", 15)
    moisture = features.get("moisture", 55)
    ndvi = features.get("ndvi", 0.5)

    score = 0
    ph_min, ph_max = req.get("ph", (6.0, 7.5))
    score += 25 if ph_min <= ph <= ph_max else 15 if abs(ph - (ph_min + ph_max) / 2) < 1.0 else 5
    t_min, t_max = req.get("temp", (20, 35))
    score += 25 if t_min <= temp <= t_max else 15 if abs(temp - (t_min + t_max) / 2) < 4 else 5
    r_min, r_max = req.get("rain", (5, 30))
    score += 20 if r_min <= rain <= r_max else 12
    m_min, m_max = req.get("moisture", (40, 70))
    score += 20 if m_min <= moisture <= m_max else 12
    ndvi_min = req.get("ndvi_min", 0.2)
    score += 10 if ndvi >= ndvi_min + 0.2 else 7 if ndvi >= ndvi_min else 2
    return min(100, max(0, score))


def _crop_reasons(crop_key: str, features: dict) -> list[str]:
    reasons = []
    month = int(features.get("month", 9))
    ph = features.get("ph", 6.5)
    temp = features.get("temperature_c", 28)
    s = CROP_SEASONS.get(crop_key, "all")

    if s == "kharif" and month in [6, 7, 8, 9, 10]:
        reasons.append("Optimal Kharif monsoon season staple")
    elif s == "rabi" and month in [11, 12, 1, 2, 3]:
        reasons.append("Prime Rabi winter cropping season match")
    elif s == "zaid" and month in [4, 5]:
        reasons.append("Ideal for summer Zaid cropping cycle")
    elif s == "perennial":
        reasons.append("Perennial crop well suited for multi-year cultivation")

    req = CROP_REQUIREMENTS.get(crop_key, {})
    ph_min, ph_max = req.get("ph", (6.0, 7.5))
    t_min, t_max = req.get("temp", (20, 35))
    if ph_min <= ph <= ph_max:
        reasons.append(f"Soil pH ({ph}) is within optimal absorption range")
    if t_min <= temp <= t_max:
        reasons.append(f"Temperature ({temp}°C) is in optimal growth window")

    if features.get("nitrogen") in ["Medium", "High"]:
        reasons.append("Adequate soil nitrogen fertility available")

    return reasons[:3] or ["Agronomic parameters support crop cultivation"]


def rank_crops(features: dict, top_n: int = 5) -> list[dict]:
    """
    Rank crops by suitability using trained ML probabilities combined with
    agronomic seasonality and regional agro-climatic filters.
    """
    artifact = _load_model()
    lat = float(features.get("lat", 20.5937))
    lon = float(features.get("lon", 78.9629))
    month = int(features.get("month", 9))

    candidate_scores = {}

    if artifact:
        model = artifact["model"]
        scaler = artifact["scaler"]
        classes = artifact["classes"]

        def _parse_num(val, default, level_map):
            if isinstance(val, (int, float)):
                return float(val)
            if isinstance(val, str) and val in level_map:
                return float(level_map[val])
            try:
                return float(val)
            except (ValueError, TypeError):
                return default

        n_val = _parse_num(features.get("nitrogen_num", features.get("nitrogen")), 65.0, {"Low": 30, "Medium": 65, "High": 95, "Very High": 115})
        p_val = _parse_num(features.get("phosphorus_num", features.get("phosphorus")), 50.0, {"Low": 25, "Medium": 50, "High": 75, "Very High": 90})
        k_val = _parse_num(features.get("potassium_num", features.get("potassium")), 45.0, {"Low": 25, "Medium": 45, "High": 70, "Very High": 85})

        feat_vec = np.array([[
            n_val,
            p_val,
            k_val,
            float(features.get("temperature_c", 28)),
            float(features.get("humidity", 65)),
            float(features.get("ph", 6.5)),
            float(features.get("rainfall_mm", 80)),
        ]])
        feat_scaled = scaler.transform(feat_vec)
        probs = model.predict_proba(feat_scaled)[0]

        for crop_key, prob in zip(classes, probs):
            rule_s = _rule_score(crop_key, features)
            # In a 22-class model, prob=0.20 is very strong (>4.4x uniform prior of 4.5%)
            ml_s = min(100.0, prob * 280.0)
            combined = (ml_s * 0.50) + (rule_s * 0.50)
            s_aff = _season_affinity(crop_key, month)
            r_aff = _regional_affinity(crop_key, lat, lon)
            candidate_scores[crop_key] = combined * s_aff * r_aff

    # Evaluate any additional crops in CROP_REQUIREMENTS not in ML classes (e.g. wheat, sugarcane, soybean)
    for crop_key in CROP_REQUIREMENTS:
        if crop_key not in candidate_scores:
            rule_s = _rule_score(crop_key, features)
            s_aff = _season_affinity(crop_key, month)
            r_aff = _regional_affinity(crop_key, lat, lon)
            candidate_scores[crop_key] = rule_s * 0.85 * s_aff * r_aff

    scored_list = []
    for crop_key, raw_score in candidate_scores.items():
        name = DISPLAY_NAMES.get(crop_key, crop_key.title())
        reasons = _crop_reasons(crop_key, features)
        scored_list.append({"key": crop_key, "name": name, "raw_score": raw_score, "reasons": reasons})

    scored_list.sort(key=lambda x: x["raw_score"], reverse=True)

    # Scale scores gracefully so the top crop is in 86-94% range
    results = []
    if scored_list and scored_list[0]["raw_score"] > 0:
        top_raw = scored_list[0]["raw_score"]
        scale = 90.0 / top_raw
        for item in scored_list[:top_n]:
            final_score = int(round(item["raw_score"] * scale))
            final_score = max(20, min(96, final_score))
            results.append({
                "name": item["name"],
                "score": final_score,
                "reasons": item["reasons"],
            })
    else:
        for item in scored_list[:top_n]:
            results.append({
                "name": item["name"],
                "score": 75,
                "reasons": item["reasons"],
            })

    return results
