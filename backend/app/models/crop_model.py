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


def _rule_score(crop_key: str, features: dict) -> int:
    req = CROP_REQUIREMENTS.get(crop_key, {})
    ph, temp, rain, moisture, ndvi = (
        features.get("ph", 6.5),
        features.get("temperature_c", 28),
        features.get("rainfall_mm", 15),
        features.get("moisture", 55),
        features.get("ndvi", 0.5),
    )
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
    req = CROP_REQUIREMENTS.get(crop_key, {})
    reasons = []
    ph, temp, moisture = features.get("ph", 6.5), features.get("temperature_c", 28), features.get("moisture", 55)
    ph_min, ph_max = req.get("ph", (6.0, 7.5))
    t_min, t_max = req.get("temp", (20, 35))
    m_min, m_max = req.get("moisture", (40, 70))
    if ph_min <= ph <= ph_max:
        reasons.append(f"Soil pH ({ph}) is optimal")
    if t_min <= temp <= t_max:
        reasons.append(f"Temperature ({temp}°C) is in ideal range")
    if m_min <= moisture <= m_max:
        reasons.append("Soil moisture within recommended range")
    if features.get("nitrogen") in ["Medium", "High"]:
        reasons.append("Adequate nitrogen available")
    return reasons[:3] or ["Conditions partially match crop requirements"]


def rank_crops(features: dict, top_n: int = 5) -> list[dict]:
    """
    Rank crops by suitability using the trained ML model (if available)
    or rule-based scoring as fallback.
    """
    artifact = _load_model()

    if artifact:
        # Use trained RandomForest to get probability for each class
        model   = artifact["model"]
        scaler  = artifact["scaler"]
        classes = artifact["classes"]  # lowercase crop names

        # Build feature vector: N, P, K, temperature, humidity, ph, rainfall
        # Map from our feature dict
        level_map = {"Low": 30, "Medium": 60, "High": 90, "Very High": 110}
        feat_vec = np.array([[
            float(level_map.get(features.get("nitrogen",  "Medium"), 60)),
            float(level_map.get(features.get("phosphorus","Medium"), 60)),
            float(level_map.get(features.get("potassium", "Medium"), 60)),
            float(features.get("temperature_c", 28)),
            float(features.get("humidity", 65)),
            float(features.get("ph", 6.5)),
            float(features.get("rainfall_mm", 15)),
        ]])
        feat_scaled = scaler.transform(feat_vec)
        probs = model.predict_proba(feat_scaled)[0]  # probability per class

        results = []
        for crop_key, prob in zip(classes, probs):
            score = int(round(prob * 100))
            # Clamp: minimum 5 so nothing shows as 0
            score = max(5, score)
            name = DISPLAY_NAMES.get(crop_key, crop_key.title())
            reasons = _crop_reasons(crop_key, features)
            results.append({"name": name, "score": score, "reasons": reasons})

        results.sort(key=lambda x: x["score"], reverse=True)
        # Normalize top crop to appear strong
        if results:
            top = results[0]["score"]
            if top < 40:
                # Scale up so top is at least 75
                scale = 75 / max(top, 1)
                for r in results:
                    r["score"] = min(100, int(r["score"] * scale))
        return results[:top_n]

    # Fallback: rule-based
    results = []
    for crop_key in CROP_REQUIREMENTS:
        score = _rule_score(crop_key, features)
        name = DISPLAY_NAMES.get(crop_key, crop_key.title())
        reasons = _crop_reasons(crop_key, features)
        results.append({"name": name, "score": score, "reasons": reasons})
    results.sort(key=lambda x: x["score"], reverse=True)
    return results[:top_n]
