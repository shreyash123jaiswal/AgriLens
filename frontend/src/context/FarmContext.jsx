import { createContext, useContext, useState } from 'react'

// Mock demo data — mirrors the real API response shape
const MOCK_ANALYSIS = {
  demo: true,
  farm: {
    name: 'Demo Farm',
    area_hectares: 2.4,
    location: 'Selected Location',
    polygon: [],
    crop: 'Rice',
  },
  health: {
    score: 82,
    ndvi: 0.72,
    soil_score: 78,
    label: 'Good',
  },
  weather: {
    temperature_c: 29,
    humidity: 72,
    rainfall_mm: 18,
    wind_kph: 12,
    description: 'Partly cloudy',
    forecast_rain_mm: 42,
    trend: [
      { day: 'Mon', temp: 28, rain: 5 },
      { day: 'Tue', temp: 30, rain: 0 },
      { day: 'Wed', temp: 27, rain: 18 },
      { day: 'Thu', temp: 26, rain: 30 },
      { day: 'Fri', temp: 29, rain: 8 },
      { day: 'Sat', temp: 31, rain: 0 },
      { day: 'Sun', temp: 30, rain: 2 },
    ],
  },
  soil: {
    ph: 6.7,
    nitrogen: 'Medium',
    phosphorus: 'High',
    potassium: 'Medium',
    moisture: 63,
    organic_carbon: 1.8,
    soil_type: 'Clay Loam',
    score: 78,
  },
  satellite: {
    ndvi_current: 0.72,
    ndvi_trend: [
      { month: 'Apr', ndvi: 0.45 },
      { month: 'May', ndvi: 0.58 },
      { month: 'Jun', ndvi: 0.65 },
      { month: 'Jul', ndvi: 0.70 },
      { month: 'Aug', ndvi: 0.72 },
      { month: 'Sep', ndvi: 0.68 },
    ],
    vegetation_status: 'Healthy',
  },
  crops: [
    { name: 'Rice',   score: 91, reasons: ['Adequate soil moisture', 'Optimal pH range', 'Good rainfall forecast'] },
    { name: 'Maize',  score: 78, reasons: ['Good temperature range', 'Medium nitrogen levels'] },
    { name: 'Wheat',  score: 62, reasons: ['Suitable soil type', 'Low drought risk'] },
    { name: 'Cotton', score: 55, reasons: ['Sufficient sunlight'] },
    { name: 'Pulses', score: 70, reasons: ['Good potassium levels', 'Moderate moisture'] },
  ],
  yield: {
    crop: 'Rice',
    predicted_tons_per_hectare: 4.8,
    lower: 4.3,
    upper: 5.2,
    confidence: 85,
    benchmark_tons_per_hectare: 3.9,
    historical: [
      { season: '2021', yield: 3.8 },
      { season: '2022', yield: 4.1 },
      { season: '2023', yield: 4.4 },
      { season: '2024', yield: 4.6 },
      { season: '2025 (Est.)', yield: 4.8 },
    ],
  },
  risks: {
    drought:     { score: 60, label: 'Moderate', explanation: 'Soil moisture is adequate but rainfall may drop in next 2 weeks.' },
    flood:       { score: 20, label: 'Low',      explanation: 'Drainage is good, low flood risk for current forecast.' },
    crop_stress: { score: 40, label: 'Moderate', explanation: 'Watch for heat stress if temperature exceeds 34°C.' },
    disease_pest:{ score: 35, label: 'Low',      explanation: 'Current humidity is within safe range for disease prevention.' },
  },
  recommendations: [
    {
      priority: 'High',
      text: 'Rain is expected soon (42mm forecast). Consider postponing irrigation and rechecking soil moisture after rainfall.',
      icon: '💧',
    },
    {
      priority: 'Medium',
      text: 'Apply a medium dose of nitrogen fertilizer before the next growth stage. Current nitrogen levels are moderate.',
      icon: '🌱',
    },
    {
      priority: 'Medium',
      text: 'Monitor the northern section if NDVI shows a declining trend over the next 2 weeks.',
      icon: '🛰️',
    },
    {
      priority: 'Low',
      text: 'Soil pH (6.7) is optimal for Rice. No lime or sulphur treatment needed this season.',
      icon: '✅',
    },
  ],
}

const FarmContext = createContext(null)

export function FarmProvider({ children }) {
  const [farmData, setFarmData] = useState(null)       // polygon, name, crop from map selection
  const [analysisResult, setAnalysisResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const resetAnalysis = () => {
    setAnalysisResult(null)
    setError(null)
    setFarmData(null)
  }

  // Load mock data for demo / when backend isn't available
  const loadMockData = (overrides = {}) => {
    setAnalysisResult({
      ...MOCK_ANALYSIS,
      ...overrides,
      farm: {
        ...MOCK_ANALYSIS.farm,
        ...(overrides.farm || {}),
      },
    })
  }

  return (
    <FarmContext.Provider value={{
      farmData, setFarmData,
      analysisResult, setAnalysisResult,
      loading, setLoading,
      error, setError,
      resetAnalysis,
      loadMockData,
      MOCK_ANALYSIS,
    }}>
      {children}
    </FarmContext.Provider>
  )
}

export function useFarm() {
  const ctx = useContext(FarmContext)
  if (!ctx) throw new Error('useFarm must be used inside FarmProvider')
  return ctx
}
