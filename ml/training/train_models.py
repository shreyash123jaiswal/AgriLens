"""
AgriLens AI — ML Training Pipeline
====================================
Trains 3 models using real datasets:
  1. Crop Suitability  →  RandomForestClassifier  (crop_recommendation.csv)
  2. Yield Prediction  →  XGBoost Regressor       (crop_yield_data.csv)
  3. Risk Assessment   →  Rule-calibrated (no supervised labels — uses domain thresholds)

Run from the project root:
    python ml/training/train_models.py

Saves trained models to:  ml/saved_models/
These are then loaded by the FastAPI backend at startup.
"""

import os
import sys
import pickle
import warnings
import json
warnings.filterwarnings("ignore")

# ─── Paths ────────────────────────────────────────────────────────────────────
ROOT        = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DATASETS    = os.path.join(ROOT, "ml", "datasets")
SAVED       = os.path.join(ROOT, "ml", "saved_models")
os.makedirs(SAVED, exist_ok=True)

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier, GradientBoostingRegressor
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score, classification_report,
    mean_absolute_error, mean_squared_error, r2_score,
)
try:
    import xgboost as xgb
    HAS_XGB = True
except ImportError:
    HAS_XGB = False
    print("[WARN] XGBoost not found — using GradientBoostingRegressor fallback")


# ══════════════════════════════════════════════════════════════════════════════
#  MODEL 1 — CROP SUITABILITY  (RandomForestClassifier)
# ══════════════════════════════════════════════════════════════════════════════
def train_crop_model():
    print("\n" + "═" * 60)
    print("  MODEL 1 — Crop Suitability  (RandomForest)")
    print("═" * 60)

    path = os.path.join(DATASETS, "crop_recommendation.csv")
    df = pd.read_csv(path)
    print(f"  Loaded {len(df):,} rows | Columns: {list(df.columns)}")

    # Features: N, P, K, temperature, humidity, ph, rainfall
    FEATURES = ["N", "P", "K", "temperature", "humidity", "ph", "rainfall"]
    TARGET   = "label"

    # Drop rows with nulls
    df = df.dropna(subset=FEATURES + [TARGET])

    X = df[FEATURES].values
    y = df[TARGET].str.lower().str.strip().values

    # Encode labels
    le = LabelEncoder()
    y_enc = le.fit_transform(y)
    classes = list(le.classes_)
    print(f"  Crops ({len(classes)}): {classes}")

    # Scale features
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    # Train / test split
    X_train, X_test, y_train, y_test = train_test_split(
        X_scaled, y_enc, test_size=0.2, random_state=42, stratify=y_enc
    )

    # Train
    model = RandomForestClassifier(
        n_estimators=200,
        max_depth=12,
        min_samples_split=4,
        random_state=42,
        n_jobs=-1,
    )
    model.fit(X_train, y_train)

    # Evaluate
    y_pred = model.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    print(f"\n  Test Accuracy : {acc * 100:.2f}%")
    print(f"  Test Samples  : {len(y_test)}")

    # Feature importance
    importances = dict(zip(FEATURES, model.feature_importances_.round(4)))
    print(f"  Feature Importance: {importances}")

    # Save
    artifact = {
        "model":    model,
        "scaler":   scaler,
        "encoder":  le,
        "features": FEATURES,
        "classes":  classes,
        "accuracy": round(acc, 4),
    }
    out = os.path.join(SAVED, "crop_model.pkl")
    with open(out, "wb") as f:
        pickle.dump(artifact, f)
    print(f"\n  ✅ Saved → {out}")
    return artifact


# ══════════════════════════════════════════════════════════════════════════════
#  MODEL 2 — YIELD PREDICTION  (XGBoost / GradientBoosting Regressor)
# ══════════════════════════════════════════════════════════════════════════════
def train_yield_model():
    print("\n" + "═" * 60)
    print("  MODEL 2 — Yield Prediction  (XGBoost Regressor)")
    print("═" * 60)

    path = os.path.join(DATASETS, "crop_yield_data.csv")
    df = pd.read_csv(path)
    print(f"  Loaded {len(df):,} rows | Columns: {list(df.columns)}")

    # Standardise column names
    df.columns = [c.strip().lower().replace(" ", "_") for c in df.columns]
    print(f"  Cleaned columns: {list(df.columns)}")

    # Target: yield (tonnes/ha equivalent — normalize if needed)
    TARGET = "yield"
    if TARGET not in df.columns:
        # Try alternate names
        for alt in ["yield_kg_per_ha", "production", "crop_yield"]:
            if alt in df.columns:
                df = df.rename(columns={alt: TARGET})
                break

    # Select numeric features available in dataset
    CANDIDATE_FEATURES = [
        "area", "annual_rainfall", "fertilizer", "pesticide",
        "avg_temperature", "max_temperature", "min_temperature",
    ]
    FEATURES = [f for f in CANDIDATE_FEATURES if f in df.columns]
    print(f"  Using features: {FEATURES}")

    # Encode crop name as numeric feature
    crop_col = None
    for col in ["crop", "crop_name", "label"]:
        if col in df.columns:
            crop_col = col
            break

    if crop_col:
        le_crop = LabelEncoder()
        df["crop_enc"] = le_crop.fit_transform(df[crop_col].str.strip().str.lower())
        FEATURES = ["crop_enc"] + FEATURES
    else:
        le_crop = None

    # Encode season if present
    if "season" in df.columns:
        le_season = LabelEncoder()
        df["season_enc"] = le_season.fit_transform(df["season"].str.strip().str.lower())
        FEATURES = FEATURES + ["season_enc"]
    else:
        le_season = None

    # Drop nulls
    df = df.dropna(subset=FEATURES + [TARGET])

    # Remove extreme outliers (yield > 99th percentile)
    p99 = df[TARGET].quantile(0.99)
    p01 = df[TARGET].quantile(0.01)
    df = df[(df[TARGET] <= p99) & (df[TARGET] >= p01)]
    print(f"  After outlier removal: {len(df):,} rows | Yield range: {df[TARGET].min():.3f} – {df[TARGET].max():.3f}")

    X = df[FEATURES].values
    y = df[TARGET].values

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    X_train, X_test, y_train, y_test = train_test_split(
        X_scaled, y, test_size=0.2, random_state=42
    )

    # Train XGBoost or fallback
    if HAS_XGB:
        model = xgb.XGBRegressor(
            n_estimators=300,
            learning_rate=0.05,
            max_depth=6,
            subsample=0.8,
            colsample_bytree=0.8,
            random_state=42,
            verbosity=0,
        )
        model_name = "XGBoost"
    else:
        model = GradientBoostingRegressor(
            n_estimators=200, learning_rate=0.05, max_depth=5, random_state=42
        )
        model_name = "GradientBoosting"

    model.fit(X_train, y_train)

    # Evaluate
    y_pred = model.predict(X_test)
    mae  = mean_absolute_error(y_test, y_pred)
    rmse = mean_squared_error(y_test, y_pred) ** 0.5
    r2   = r2_score(y_test, y_pred)
    print(f"\n  [{model_name}] Test Metrics:")
    print(f"    MAE  = {mae:.4f}")
    print(f"    RMSE = {rmse:.4f}")
    print(f"    R²   = {r2:.4f}")

    # Compute per-crop baselines from data (used for confidence bands)
    crop_baselines = {}
    if crop_col:
        for crop_name, group in df.groupby(crop_col):
            crop_baselines[crop_name.strip().lower()] = {
                "mean": round(float(group[TARGET].mean()), 4),
                "std":  round(float(group[TARGET].std()),  4),
                "min":  round(float(group[TARGET].min()),  4),
                "max":  round(float(group[TARGET].max()),  4),
            }

    artifact = {
        "model":          model,
        "model_name":     model_name,
        "scaler":         scaler,
        "le_crop":        le_crop,
        "le_season":      le_season,
        "features":       FEATURES,
        "crop_col":       crop_col,
        "crop_baselines": crop_baselines,
        "metrics": {"mae": round(mae, 4), "rmse": round(rmse, 4), "r2": round(r2, 4)},
    }
    out = os.path.join(SAVED, "yield_model.pkl")
    with open(out, "wb") as f:
        pickle.dump(artifact, f)
    print(f"\n  ✅ Saved → {out}")
    return artifact


# ══════════════════════════════════════════════════════════════════════════════
#  MODEL 3 — SOIL ENRICHMENT  (No supervised labels — builds lookup table)
# ══════════════════════════════════════════════════════════════════════════════
def build_soil_lookup():
    print("\n" + "═" * 60)
    print("  MODEL 3 — Soil Enrichment (District Lookup Table)")
    print("═" * 60)

    path = os.path.join(DATASETS, "soil_data.csv")
    df = pd.read_csv(path)
    print(f"  Loaded {len(df):,} rows | Columns: {list(df.columns)}")

    df.columns = [c.strip().lower().replace(" ", "_") for c in df.columns]

    # Standardise columns
    col_map = {}
    for c in df.columns:
        if "nitrogen" in c:  col_map[c] = "nitrogen"
        elif "phospho" in c: col_map[c] = "phosphorus"
        elif "potassium" in c: col_map[c] = "potassium"
        elif "ph" in c:      col_map[c] = "ph"
        elif "district" in c: col_map[c] = "district"
    df = df.rename(columns=col_map)

    # Group by district → mean values
    group_cols = [c for c in ["nitrogen","phosphorus","potassium","ph"] if c in df.columns]
    if "district" in df.columns:
        lookup = (
            df.groupby("district")[group_cols]
            .mean()
            .round(3)
            .reset_index()
            .to_dict(orient="records")
        )
        print(f"  Districts indexed: {len(lookup)}")
    else:
        # Build global stats
        lookup = [{"district": "global", **{c: round(float(df[c].mean()), 3) for c in group_cols}}]

    # Global stats for fallback
    global_stats = {c: round(float(df[c].mean()), 3) for c in group_cols if c in df.columns}
    print(f"  Global averages: {global_stats}")

    artifact = {
        "lookup":       lookup,
        "global_stats": global_stats,
        "columns":      group_cols,
    }
    out = os.path.join(SAVED, "soil_lookup.pkl")
    with open(out, "wb") as f:
        pickle.dump(artifact, f)

    # Also save as JSON for inspection
    out_json = os.path.join(SAVED, "soil_lookup.json")
    with open(out_json, "w") as f:
        json.dump(artifact, f, indent=2)

    print(f"\n  ✅ Saved → {out}")
    return artifact


# ══════════════════════════════════════════════════════════════════════════════
#  SAVE METADATA MANIFEST
# ══════════════════════════════════════════════════════════════════════════════
def save_manifest(crop_art, yield_art, soil_art):
    manifest = {
        "crop_model": {
            "file":     "crop_model.pkl",
            "type":     "RandomForestClassifier",
            "features": crop_art["features"],
            "classes":  crop_art["classes"],
            "accuracy": crop_art["accuracy"],
        },
        "yield_model": {
            "file":     "yield_model.pkl",
            "type":     yield_art["model_name"],
            "features": yield_art["features"],
            "metrics":  yield_art["metrics"],
        },
        "soil_lookup": {
            "file":     "soil_lookup.pkl",
            "type":     "district_lookup",
            "columns":  soil_art["columns"],
            "global_stats": soil_art["global_stats"],
        },
    }
    out = os.path.join(SAVED, "manifest.json")
    with open(out, "w") as f:
        json.dump(manifest, f, indent=2)
    print(f"\n  📋 Manifest saved → {out}")
    return manifest


# ══════════════════════════════════════════════════════════════════════════════
#  MAIN
# ══════════════════════════════════════════════════════════════════════════════
if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    print("\nAgriLens AI - ML Training Pipeline")
    print("=" * 60)

    crop_art  = train_crop_model()
    yield_art = train_yield_model()
    soil_art  = build_soil_lookup()
    manifest  = save_manifest(crop_art, yield_art, soil_art)

    print("\n" + "=" * 60)
    print("ALL MODELS TRAINED AND SAVED SUCCESSFULLY")
    print("=" * 60)
    print(f"\n  Crop Model   -> accuracy = {crop_art['accuracy'] * 100:.1f}%")
    print(f"  Yield Model  -> R2 = {yield_art['metrics']['r2']:.4f},  MAE = {yield_art['metrics']['mae']:.4f}")
    print(f"  Soil Lookup  -> {len(soil_art['lookup'])} districts indexed")
    print(f"\n  Models saved in: ml/saved_models/")
    print("  Restart FastAPI server to load the trained models.\n")
