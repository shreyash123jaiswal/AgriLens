# 🌱 AgriLens — Smart Geospatial Agriculture Platform

**AgriLens** is an end-to-end precision agriculture and farm intelligence platform built for HackDevengers Hackathon. It integrates satellite vegetation analysis (NDVI), real-time weather forecasts, soil diagnostics, and trained machine learning models to deliver actionable farm insights, crop suitability recommendations, yield predictions, and multi-hazard risk assessment.

---

## 🚀 Key Features

- 🛰️ **Geospatial & Satellite Analysis**: Interactive field selection with automatic boundary detection, area calculation (Shoelace algorithm with latitude correction), and multi-month NDVI vegetation health indexing.
- 🌤️ **Live Hyperlocal Weather**: Integrated with Open-Meteo for real-time ambient metrics and 7-day precipitation/temperature forecasts.
- 🧪 **Soil Health Diagnostics**: Derives N-P-K nutrient profiles, soil pH, moisture, and organic carbon with an aggregated soil health score.
- 🌾 **ML Crop Recommendation Engine**:
  - Algorithm: **Random Forest Classifier**
  - **99.32% Accuracy** on 22 distinct crop varieties based on NPK, pH, moisture, and rainfall parameters.
- 📈 **ML Yield Prediction Engine**:
  - Algorithm: **XGBoost Regressor**
  - Calibrated with crop baselines, historical multi-season benchmarks, and environmental features ($R^2 = 0.8812$).
- ⚠️ **Multi-Hazard Risk Engine**: Algorithmic scoring for drought stress, flood potential, crop stress, and pest/disease outbreak vulnerabilities.
- 🤖 **AI Agronomic Advisor**: Generates prioritised, actionable recommendations for farmers.

---

## 🏗️ Architecture & Project Structure

```
├── backend/                   # FastAPI Backend Server
│   ├── app/
│   │   ├── main.py            # API routing and CORS configuration
│   │   ├── models/            # ML model inference (Crop, Yield, Risk)
│   │   ├── routes/            # REST API endpoints (farms, weather, soil, satellite, predict)
│   │   ├── services/          # External integrations (Open-Meteo, Gemini AI, Satellite)
│   │   └── utils/             # Geospatial & feature engineering utilities
│   ├── requirements.txt
│   └── .env.example
├── frontend/                  # React 19 + Vite Frontend
│   ├── src/
│   │   ├── pages/             # Landing, Farm Selection, Dashboard
│   │   ├── components/        # Reusable UI cards, Navbar, loading states
│   │   ├── charts/            # Recharts visualizations (NDVI, Yield, Risk, Weather)
│   │   ├── context/           # Global FarmContext
│   │   └── services/          # Axios API client
│   └── package.json
└── ml/                        # Machine Learning Pipeline
    ├── datasets/              # Real agricultural datasets
    ├── saved_models/          # Trained artifacts (.pkl) & manifest.json
    └── training/              # train_models.py (end-to-end model training)
```

---

## 🛠️ Getting Started

### 1. Prerequisites
- **Python 3.10+**
- **Node.js 18+** & npm

### 2. Backend Setup
```bash
cd backend
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env

# Run FastAPI server
uvicorn app.main:app --reload --port 8000
```
- API Docs: `http://localhost:8000/docs`

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
- Frontend app: `http://localhost:5173`

---

## 📡 API Endpoints

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/health` | `GET` | Health check and system status |
| `/api/weather` | `GET` | Live weather by latitude/longitude |
| `/api/soil/analyze` | `POST` | Soil nutrient and health diagnostic |
| `/api/satellite/ndvi` | `POST` | Satellite vegetation index & historical trend |
| `/api/predict/crops` | `POST` | Top 5 recommended crops by suitability |
| `/api/predict/yield` | `POST` | Predicted tonnes/hectare and confidence range |
| `/api/predict/risk` | `POST` | 4-axis risk breakdown (drought, flood, stress, pest) |
| `/api/farms/analyze` | `POST` | Full farm pipeline orchestration |
