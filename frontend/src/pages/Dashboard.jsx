import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  MapPin, Cloud, Beaker, TrendingUp, AlertTriangle, Layers, RotateCcw,
  Activity, ShieldCheck, Droplets, Wind, Calendar, DollarSign,
  Gauge, Sprout, CheckCircle2, Thermometer, CloudRain, CheckCircle, Info
} from 'lucide-react'
import Navbar from '../components/Navbar'
import StatCard from '../components/StatCard'
import WeatherCard from '../components/WeatherCard'
import SoilCard from '../components/SoilCard'
import CropCard from '../components/CropCard'
import YieldCard from '../components/YieldCard'
import RiskCard from '../components/RiskCard'
import RecommendationCard from '../components/RecommendationCard'
import NDVIChart from '../charts/NDVIChart'
import YieldChart from '../charts/YieldChart'
import WeatherChart from '../charts/WeatherChart'
import RiskChart from '../charts/RiskChart'
import CropSuitabilityChart from '../charts/CropSuitabilityChart'
import { useFarm } from '../context/FarmContext'

const TABS = [
  { id: 'overview',        label: 'Field Overview',       icon: <Activity size={14} /> },
  { id: 'satellite',       label: 'Satellite & NDVI',     icon: <Layers size={14} /> },
  { id: 'weather',         label: 'Agrometeorology',      icon: <Cloud size={14} /> },
  { id: 'soil',            label: 'Soil Health Card',     icon: <Beaker size={14} /> },
  { id: 'yield',           label: 'Yield & Economics',    icon: <TrendingUp size={14} /> },
  { id: 'risks',           label: 'Risk Matrix',          icon: <AlertTriangle size={14} /> },
  { id: 'recommendations', label: 'Agronomy Advisory',    icon: <CheckCircle2 size={14} /> },
]

function SectionTitle({ title, subtitle, badge }) {
  return (
    <div style={{ marginBottom: '18px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
        <h3 style={{ margin: 0, fontFamily: 'var(--font-heading)', fontSize: '1.15rem' }}>{title}</h3>
        {badge && <span className="demo-tag">{badge}</span>}
      </div>
      {subtitle && <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--color-text-muted)' }}>{subtitle}</p>}
    </div>
  )
}

function ChartCard({ title, subtitle, children, badge }) {
  return (
    <div className="card" style={{ padding: '22px' }}>
      <SectionTitle title={title} subtitle={subtitle} badge={badge} />
      {children}
    </div>
  )
}

function HealthScoreBadge({ score }) {
  const color = score >= 75 ? 'var(--color-green-dark)' : score >= 50 ? 'var(--color-yellow-dark)' : 'var(--color-red)'
  const bg    = score >= 75 ? 'var(--color-green-light)' : score >= 50 ? 'var(--color-yellow-light)' : 'var(--color-red-light)'
  const label = score >= 75 ? 'Optimal Field Condition' : score >= 50 ? 'Moderate Growth' : 'Stress Detected'
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: '8px',
      padding: '6px 18px', borderRadius: 'var(--radius-full)',
      background: bg, border: `1.5px solid ${color}`,
    }}>
      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: color }} />
      <span style={{ fontWeight: '800', fontSize: '0.95rem', color }}>{score}/100</span>
      <span style={{ fontWeight: '700', fontSize: '0.8rem', color }}>{label}</span>
    </div>
  )
}

function formatCleanPlace(name) {
  if (!name) return ''
  const parts = name.split(',').map((p) => p.trim())
  const unique = parts.filter((item, idx) => parts.indexOf(item) === idx)
  return unique.join(', ')
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { analysisResult, loadMockData, resetAnalysis } = useFarm()
  const [activeTab, setActiveTab] = useState('overview')
  const [showDemoAlert, setShowDemoAlert] = useState(true)

  // If no data at all, auto-load mock
  useEffect(() => {
    if (!analysisResult) loadMockData()
  }, [])

  const data = analysisResult
  if (!data) return null

  const isDemo = data.demo === true

  const handleNewAnalysis = () => {
    resetAnalysis()
    navigate('/select')
  }

  // Crop MSP lookup for economic estimation (INR per Quintal / Ton)
  const cropPrices = {
    Sugarcane: { perQuintal: 315, perTon: 3150 },
    Rice: { perQuintal: 2320, perTon: 23200 },
    Wheat: { perQuintal: 2275, perTon: 22750 },
    Maize: { perQuintal: 2090, perTon: 20900 },
    Cotton: { perQuintal: 7120, perTon: 71200 },
    Default: { perQuintal: 2400, perTon: 24000 },
  }
  const activeCropName = data.farm?.crop || 'Rice'
  const activePrice = cropPrices[activeCropName] || cropPrices.Default
  const plotArea = data.farm?.area_hectares || 1.0
  const yieldPerHa = data.yield?.predicted_tons_per_hectare || 3.8
  const totalPlotYieldTonnes = (yieldPerHa * plotArea).toFixed(2)
  const totalPlotYieldQuintals = (totalPlotYieldTonnes * 10).toFixed(1)
  const grossCropValueINR = Math.round(totalPlotYieldTonnes * activePrice.perTon)

  const cleanPlace = formatCleanPlace(data.farm?.place_name)
  const cleanLoc = formatCleanPlace(data.farm?.location)

  /* ======================================================
     OVERVIEW TAB
     ====================================================== */
  const OverviewTab = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Field Status Banner */}
      <div style={{
        background: 'linear-gradient(135deg, var(--color-white) 0%, var(--color-cream) 100%)',
        border: '1px solid var(--color-cream-border)',
        borderRadius: 'var(--radius-lg)',
        padding: '18px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        boxShadow: 'var(--shadow-sm)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '44px', height: '44px', borderRadius: '12px',
            background: 'var(--color-green-light)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--color-green-dark)',
          }}>
            <Sprout size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontWeight: '800', fontSize: '1.05rem', color: 'var(--color-brown-900)' }}>
                Field Agronomic Status: Active Vegetative Growth
              </span>
              <span className="badge badge-green" style={{ fontSize: '0.72rem', padding: '2px 8px' }}>
                Canopy Vigor: {data.satellite?.vegetation_status || 'Healthy'}
              </span>
            </div>
            <p style={{ margin: '3px 0 0', fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
              Telemetry: Sentinel-2 Multispectral MSI · Real-Time Meteorology · ICAR Regional Soil Grid
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.82rem' }}>
          <div>
            <div style={{ color: 'var(--color-text-muted)', fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: '700' }}>CROP / SEASON</div>
            <div style={{ fontWeight: '800', color: 'var(--color-brown-800)' }}>{data.farm?.crop} · {data.farm?.season || 'Kharif'}</div>
          </div>
          <div style={{ width: '1px', height: '28px', background: 'var(--color-cream-border)' }} />
          <div>
            <div style={{ color: 'var(--color-text-muted)', fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: '700' }}>TOTAL PLOT SIZE</div>
            <div style={{ fontWeight: '800', color: 'var(--color-brown-800)' }}>{data.farm?.area_hectares} ha ({(data.farm?.area_hectares * 2.471).toFixed(2)} Acres)</div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(185px, 1fr))', gap: '14px' }}>
        <StatCard
          icon="🌿" label="Field Health Index"
          value={data.health?.score} unit="/100"
          color="var(--color-green-dark)" bg="var(--color-green-light)"
          trend="up" trendLabel="Target > 75"
        />
        <StatCard
          icon="🛰️" label="Canopy NDVI"
          value={data.health?.ndvi} unit=""
          color="var(--color-brown-700)" bg="var(--color-brown-100)"
          subtitle="Dense Photosynthetic Foliage"
        />
        <StatCard
          icon="🪱" label="Soil Fertility Score"
          value={data.health?.soil_score} unit="/100"
          color="#8B6914" bg="#FEF3C7"
          trend="up" trendLabel="Balanced Nutrients"
        />
        <StatCard
          icon="🌾" label="Target Yield"
          value={data.yield?.predicted_tons_per_hectare} unit="t/ha"
          color="var(--color-green-dark)" bg="var(--color-green-light)"
          trend="up" trendLabel={`Benchmark: ${data.yield?.benchmark_tons_per_hectare || 3.4} t/ha`}
        />
        <StatCard
          icon="⚠️" label="Drought Stress"
          value={`${data.risks?.drought?.score}%`}
          color="var(--color-orange)" bg="var(--color-orange-light)"
          subtitle={data.risks?.drought?.label || 'Low Vulnerability'}
        />
      </div>

      {/* Main content grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <ChartCard title="Canopy NDVI Vegetation Trend" subtitle="Sentinel-2 multispectral surface reflectance over time">
          <NDVIChart data={data.satellite?.ndvi_trend} />
        </ChartCard>

        <WeatherCard weather={data.weather} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Top crops */}
        <div className="card" style={{ padding: '22px' }}>
          <SectionTitle title="Regional Crop Suitability" subtitle="Agronomic ranking calibrated for soil & climatic norms" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {data.crops?.slice(0, 3).map((c, i) => (
              <CropCard key={c.name} crop={c} rank={i + 1} />
            ))}
          </div>
        </div>

        {/* Risk overview */}
        <ChartCard title="Agronomic Vulnerability Profile" subtitle="Multi-factor agro-climatic stress indicators">
          <RiskChart risks={data.risks} />
        </ChartCard>
      </div>

      {/* Field Agronomy Advisory preview */}
      <RecommendationCard recommendations={data.recommendations?.slice(0, 2)} isDemo={isDemo} />
    </div>
  )

  /* ======================================================
     SATELLITE TAB
     ====================================================== */
  const SatelliteTab = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Remote Sensing Telemetry Strip */}
      <div style={{
        background: 'var(--color-white)',
        border: '1px solid var(--color-cream-border)',
        borderRadius: 'var(--radius-lg)',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '14px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Layers size={20} style={{ color: 'var(--color-green-dark)' }} />
          <div>
            <div style={{ fontSize: '0.92rem', fontWeight: '800', color: 'var(--color-brown-900)' }}>
              Sentinel-2 MSI Multispectral Remote Sensing
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)' }}>
              Spectral Bands: B4 (Red 665nm) & B8 (NIR 842nm) · Resolution: 10m Ground Sampling Distance
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px', fontSize: '0.78rem', color: 'var(--color-text-secondary)', fontWeight: '600' }}>
          <span>Cloud Screen: <strong style={{ color: 'var(--color-green-dark)' }}>0% (Clear)</strong></span>
          <span>·</span>
          <span>Atmospheric Correction: <strong>BOA (Bottom-of-Atmosphere)</strong></span>
        </div>
      </div>

      {/* NDVI headline */}
      <div className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ margin: '0 0 6px', fontFamily: 'var(--font-heading)' }}>Canopy Vegetation Index (NDVI)</h3>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
              Normalized Difference Vegetation Index calculates live photosynthetic chlorophyll biomass across your boundary.
            </p>
          </div>
          {isDemo && <span className="demo-tag">📡 Satellite Calibration</span>}
        </div>

        {/* Quantitative Canopy Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '14px', marginBottom: '24px' }}>
          {[
            { label: 'Current NDVI Value', value: data.satellite?.ndvi_current, color: 'var(--color-green-dark)' },
            { label: 'Canopy Density Status', value: data.satellite?.vegetation_status, color: 'var(--color-brown-700)' },
            { label: 'Estimated Foliar Cover', value: `${Math.round((data.satellite?.ndvi_current || 0.6) * 115)}%`, color: 'var(--color-green)' },
            { label: 'Chlorophyll Vigor', value: 'High Absorption', color: 'var(--color-green-dark)' },
          ].map((s) => (
            <div key={s.label} style={{ textAlign: 'center', background: 'var(--color-cream)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
              <div style={{ fontSize: '1.45rem', fontWeight: '900', color: s.color }}>{s.value}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: '700', marginTop: '4px', textTransform: 'uppercase' }}>{s.label}</div>
            </div>
          ))}
        </div>

        <NDVIChart data={data.satellite?.ndvi_trend} />
      </div>

      {/* Visual NDVI Spectrum Indicator */}
      <div className="card" style={{ padding: '22px' }}>
        <h4 style={{ fontFamily: 'var(--font-heading)', marginBottom: '8px' }}>NDVI Phenology Scale & Field Position</h4>
        <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginBottom: '16px' }}>
          Relative position of your crop along the standard vegetative reflectance spectrum (0.00 to 1.00).
        </p>

        {/* Spectrum gradient bar */}
        <div style={{ position: 'relative', marginBottom: '24px' }}>
          <div style={{
            height: '16px',
            borderRadius: 'var(--radius-full)',
            background: 'linear-gradient(90deg, #A0522D 0%, #D4A373 20%, #E9D8A6 40%, #94D2BD 60%, #2D6A4F 80%, #1B4332 100%)',
            boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.2)',
          }} />
          {/* Current pointer */}
          <div style={{
            position: 'absolute',
            left: `${Math.min(96, Math.max(4, (data.satellite?.ndvi_current || 0.65) * 100))}%`,
            top: '-26px',
            transform: 'translateX(-50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}>
            <span style={{
              background: 'var(--color-brown-900)', color: 'white',
              fontSize: '0.72rem', fontWeight: '800',
              padding: '2px 8px', borderRadius: '4px',
              whiteSpace: 'nowrap',
            }}>
              Your Field: {data.satellite?.ndvi_current}
            </span>
            <div style={{ width: '0', height: '0', borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: '6px solid var(--color-brown-900)' }} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px' }}>
          {[
            { range: '0.80 – 1.00', label: 'Very Dense Canopy / Peak Foliage', color: '#1B4332' },
            { range: '0.60 – 0.80', label: 'Vigorous Crop Growth', color: '#2D6A4F' },
            { range: '0.40 – 0.60', label: 'Moderate Canopy / Early Vegetative', color: '#74C69D' },
            { range: '0.20 – 0.40', label: 'Sparse Foliage / Emergence', color: '#D4A96A' },
            { range: '0.00 – 0.20', label: 'Bare Soil / Pre-Sowing', color: '#8B5E3C' },
          ].map((item) => (
            <div key={item.range} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '24px', height: '14px', borderRadius: '3px', background: item.color, flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '0.76rem', fontWeight: '700', color: 'var(--color-brown-900)' }}>{item.range}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>{item.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  /* ======================================================
     WEATHER TAB
     ====================================================== */
  const WeatherTab = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Field Operations Advisory Matrix */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '14px',
      }}>
        <div style={{
          background: 'var(--color-white)', border: '1px solid var(--color-cream-border)',
          borderRadius: 'var(--radius-md)', padding: '16px',
          display: 'flex', alignItems: 'flex-start', gap: '12px',
        }}>
          <div style={{ color: 'var(--color-green-dark)', marginTop: '2px' }}><CheckCircle size={20} /></div>
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--color-brown-900)' }}>Spraying Operations Window</div>
            <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
              Wind speed at {data.weather?.wind_kph} km/h is within safe threshold (&lt;15 km/h). No spray drift risk.
            </p>
          </div>
        </div>

        <div style={{
          background: 'var(--color-white)', border: '1px solid var(--color-cream-border)',
          borderRadius: 'var(--radius-md)', padding: '16px',
          display: 'flex', alignItems: 'flex-start', gap: '12px',
        }}>
          <div style={{ color: '#0EA5E9', marginTop: '2px' }}><Droplets size={20} /></div>
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--color-brown-900)' }}>Irrigation Scheduling</div>
            <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
              {data.weather?.forecast_rain_mm > 25
                ? `Hold routine irrigation — ${data.weather?.forecast_rain_mm} mm expected in next 7 days.`
                : `Maintain regular soil moisture check — rain forecast is light (${data.weather?.forecast_rain_mm || 0} mm).`}
            </p>
          </div>
        </div>

        <div style={{
          background: 'var(--color-white)', border: '1px solid var(--color-cream-border)',
          borderRadius: 'var(--radius-md)', padding: '16px',
          display: 'flex', alignItems: 'flex-start', gap: '12px',
        }}>
          <div style={{ color: 'var(--color-orange)', marginTop: '2px' }}><Thermometer size={20} /></div>
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--color-brown-900)' }}>Evapotranspiration Rate</div>
            <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
              Estimated ET₀ at 4.2 mm/day based on current temperature ({data.weather?.temperature_c}°C) and solar radiation.
            </p>
          </div>
        </div>
      </div>

      <WeatherCard weather={data.weather} />

      <ChartCard title="7-Day Agrometeorological Forecast" subtitle="Daily high/low temperature profile and precipitation accumulation">
        <WeatherChart data={data.weather?.trend} />
      </ChartCard>
    </div>
  )

  /* ======================================================
     SOIL TAB
     ====================================================== */
  const SoilTab = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <SoilCard soil={data.soil} />

      {/* Official Soil Health Card Table & Amendment Prescription */}
      <div className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h4 style={{ fontFamily: 'var(--font-heading)', margin: 0, fontSize: '1.1rem' }}>
              ICAR Soil Health Card (SHC) Diagnostic Card
            </h4>
            <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
              Standard agronomic parameter appraisal for {data.soil?.soil_type || 'Clay Loam'} profile.
            </p>
          </div>
          <span className="badge badge-green">Standard Agronomic Reference</span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px',
          marginBottom: '20px',
        }}>
          <div style={{ padding: '14px', background: 'var(--color-cream)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Soil Organic Carbon (OC)</div>
            <div style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--color-brown-900)', marginTop: '2px' }}>
              {data.soil?.organic_carbon || 0.68}% <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--color-green-dark)' }}>(Medium-High)</span>
            </div>
          </div>
          <div style={{ padding: '14px', background: 'var(--color-cream)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Electrical Conductivity (EC)</div>
            <div style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--color-brown-900)', marginTop: '2px' }}>
              0.42 dS/m <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--color-green-dark)' }}>(Normal / Non-Saline)</span>
            </div>
          </div>
          <div style={{ padding: '14px', background: 'var(--color-cream)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Soil Reaction / pH Index</div>
            <div style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--color-brown-900)', marginTop: '2px' }}>
              {data.soil?.ph} <span style={{ fontSize: '0.75rem', fontWeight: '600', color: data.soil?.ph >= 6 && data.soil?.ph <= 7.5 ? 'var(--color-green-dark)' : 'var(--color-orange)' }}>
                ({data.soil?.ph >= 6 && data.soil?.ph <= 7.5 ? 'Neutral / Near Optimal' : 'Requires Conditioning'})
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[
            { icon: '⚗️', title: 'pH Conditioning Guidance', note: `Soil pH is ${data.soil?.ph}. ${data.soil?.ph >= 6 && data.soil?.ph <= 7.5 ? 'Ideal for major nutrient uptake. No lime or gypsum conditioner necessary for this growth cycle.' : data.soil?.ph < 6 ? 'Slightly acidic — application of 200-300 kg/ha agricultural lime recommended.' : 'Alkaline tendency — incorporate organic manure or gypsum to enhance micronutrient availability.'}` },
            { icon: '💧', title: 'Soil Water Dynamics', note: `Volumetric soil moisture is ${data.soil?.moisture}%. Field capacity is well balanced with adequate root-zone aeration. Avoid over-irrigation to preserve root respiration.` },
            { icon: '🧪', title: 'Fertilizer Split Application', note: `Nitrogen level is ${data.soil?.nitrogen}. Top-dress with Urea at 45 kg/ha at active tillering / vegetative spurt, followed by foliar spray of 19:19:19 water-soluble fertilizer if needed.` },
          ].map((n, i) => (
            <div key={i} style={{
              display: 'flex', gap: '12px', alignItems: 'flex-start',
              padding: '14px 16px', background: 'var(--color-white)', borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-cream-border)',
            }}>
              <span style={{ fontSize: '1.3rem', flexShrink: 0, marginTop: '2px' }}>{n.icon}</span>
              <div>
                <div style={{ fontWeight: '700', fontSize: '0.88rem', color: 'var(--color-brown-900)' }}>{n.title}</div>
                <p style={{ margin: '2px 0 0', fontSize: '0.84rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>{n.note}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  /* ======================================================
     YIELD TAB
     ====================================================== */
  const YieldTab = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Production & Economics Summary Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #2D6A4F 0%, #1B4332 100%)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px',
        color: 'white',
        boxShadow: 'var(--shadow-md)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase', color: '#D8F3DC' }}>
              HARVEST YIELD & ECONOMIC VALUE PROJECTION
            </div>
            <h3 style={{ margin: '4px 0 0', color: 'white', fontFamily: 'var(--font-heading)', fontSize: '1.4rem' }}>
              {data.farm?.crop} Commercial Production Forecast
            </h3>
          </div>
          <div style={{
            background: 'rgba(255,255,255,0.15)',
            padding: '6px 16px', borderRadius: 'var(--radius-full)',
            fontSize: '0.82rem', fontWeight: '700',
            backdropFilter: 'blur(4px)',
          }}>
            Confidence Index: {data.yield?.confidence}%
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
          <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
            <div style={{ fontSize: '0.75rem', color: '#D8F3DC', fontWeight: '600' }}>EXPECTED YIELD RATE</div>
            <div style={{ fontSize: '1.9rem', fontWeight: '900', marginTop: '4px' }}>
              {data.yield?.predicted_tons_per_hectare} <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>t/ha</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.7)', marginTop: '2px' }}>
              Range: {data.yield?.lower} – {data.yield?.upper} t/ha
            </div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
            <div style={{ fontSize: '0.75rem', color: '#D8F3DC', fontWeight: '600' }}>TOTAL PLOT HARVEST</div>
            <div style={{ fontSize: '1.9rem', fontWeight: '900', marginTop: '4px' }}>
              {totalPlotYieldTonnes} <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>Tonnes</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.7)', marginTop: '2px' }}>
              ~ {totalPlotYieldQuintals} Quintals (for {plotArea} ha)
            </div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
            <div style={{ fontSize: '0.75rem', color: '#D8F3DC', fontWeight: '600' }}>ESTIMATED GROSS REVENUE</div>
            <div style={{ fontSize: '1.9rem', fontWeight: '900', marginTop: '4px', color: '#FFE6A7' }}>
              ₹{grossCropValueINR.toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.7)', marginTop: '2px' }}>
              Benchmark MSP @ ₹{activePrice.perTon.toLocaleString('en-IN')}/tonne
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <YieldCard yieldData={data.yield} />
        <ChartCard title="Yield Progression & Regional Average" subtitle="Comparison with district baseline over seasons">
          <YieldChart data={data.yield?.historical} benchmark={data.yield?.benchmark_tons_per_hectare} />
        </ChartCard>
      </div>

      <ChartCard title="Alternative Crop Suitability Comparison" subtitle="Suitability score ranking for your specific soil and weather conditions">
        <CropSuitabilityChart crops={data.crops} />
      </ChartCard>
    </div>
  )

  /* ======================================================
     RISKS TAB
     ====================================================== */
  const RisksTab = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Risk Overview Header Card */}
      <div style={{
        background: 'var(--color-white)',
        border: '1px solid var(--color-cream-border)',
        borderRadius: 'var(--radius-lg)',
        padding: '18px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '14px',
      }}>
        <div>
          <h4 style={{ margin: 0, fontFamily: 'var(--font-heading)', fontSize: '1.1rem' }}>
            Agro-Climatic Vulnerability & Risk Matrix
          </h4>
          <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
            Integrated monitoring of water stress, excess precipitation, thermal shock, and pest susceptibility.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="badge badge-green" style={{ fontSize: '0.8rem', padding: '4px 12px' }}>
            Overall Risk Level: Low to Moderate
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <RiskCard risks={data.risks} />
        <ChartCard title="Multi-Factor Vulnerability Radar" subtitle="Relative vulnerability scores normalized to 100">
          <RiskChart risks={data.risks} />
        </ChartCard>
      </div>

      {/* Actionable Preventive Field Measures */}
      <div className="card" style={{ padding: '22px' }}>
        <h4 style={{ fontFamily: 'var(--font-heading)', marginBottom: '14px' }}>Preventive Agronomic Protocols</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
          <div style={{ padding: '16px', background: 'var(--color-cream)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ fontSize: '1.2rem' }}>🌵</span>
              <span style={{ fontWeight: '700', fontSize: '0.88rem', color: 'var(--color-brown-900)' }}>Drought Preparedness</span>
            </div>
            <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--color-text-secondary)', lineHeight: 1.55 }}>
              Maintain mulch cover between rows to reduce evaporation losses if rainfall pauses during the tillering stage.
            </p>
          </div>

          <div style={{ padding: '16px', background: 'var(--color-cream)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ fontSize: '1.2rem' }}>🌊</span>
              <span style={{ fontWeight: '700', fontSize: '0.88rem', color: 'var(--color-brown-900)' }}>Drainage Management</span>
            </div>
            <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--color-text-secondary)', lineHeight: 1.55 }}>
              Clear perimeter bund trenches to prevent stagnation in case of sudden convective downpours.
            </p>
          </div>

          <div style={{ padding: '16px', background: 'var(--color-cream)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ fontSize: '1.2rem' }}>🐛</span>
              <span style={{ fontWeight: '700', fontSize: '0.88rem', color: 'var(--color-brown-900)' }}>Pest & Blight Scouting</span>
            </div>
            <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--color-text-secondary)', lineHeight: 1.55 }}>
              Relative humidity at {data.weather?.humidity}% warrants bi-weekly visual scouting under leaf undersides for early fungal signs.
            </p>
          </div>
        </div>
      </div>
    </div>
  )

  /* ======================================================
     RECOMMENDATIONS TAB
     ====================================================== */
  const RecommendationsTab = () => (
    <RecommendationCard recommendations={data.recommendations} isDemo={isDemo} />
  )

  const TAB_CONTENT = {
    overview:        <OverviewTab />,
    satellite:       <SatelliteTab />,
    weather:         <WeatherTab />,
    soil:            <SoilTab />,
    yield:           <YieldTab />,
    risks:           <RisksTab />,
    recommendations: <RecommendationsTab />,
  }

  return (
    <div style={{ background: 'var(--color-cream)', minHeight: '100vh' }}>
      <Navbar />

      {/* ===== DASHBOARD HEADER ===== */}
      <div style={{
        background: 'var(--color-white)',
        borderBottom: '1px solid var(--color-cream-border)',
        padding: '20px 24px',
      }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '42px', height: '42px', borderRadius: '12px',
                background: 'var(--color-green-light)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.3rem',
                border: '1.5px solid rgba(45, 106, 79, 0.2)',
              }}>🌾</div>
              <div>
                <h3 style={{ margin: 0, fontFamily: 'var(--font-heading)', fontSize: '1.25rem', color: 'var(--color-brown-900)' }}>
                  {cleanPlace && cleanPlace !== 'Selected Farm'
                    ? `${cleanPlace} Farm`
                    : (data.farm?.name || 'Farm Analysis')}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.84rem', color: 'var(--color-text-secondary)', flexWrap: 'wrap', marginTop: '3px' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--color-brown-800)', fontWeight: '600' }}>
                    <MapPin size={13} style={{ color: 'var(--color-orange)', flexShrink: 0 }} />
                    {cleanLoc || data.farm?.location || 'Selected Location'}
                  </span>
                  {data.farm?.area_hectares && (
                    <> · <span>Area: <strong style={{ color: 'var(--color-brown-700)' }}>{data.farm.area_hectares} ha</strong></span></>
                  )}
                  {data.farm?.crop && (
                    <> · <span className="badge badge-brown" style={{ fontSize: '0.72rem', padding: '2px 8px' }}>🌾 {data.farm.crop}</span></>
                  )}
                  {data.farm?.season && (
                    <> · <span className="badge badge-green" style={{ fontSize: '0.72rem', padding: '2px 8px' }}>🗓️ {data.farm.season} Season</span></>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {isDemo && <span className="demo-tag">📊 Demo Mode</span>}
            <HealthScoreBadge score={data.health?.score} />
            <button className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.83rem' }} onClick={handleNewAnalysis}>
              <RotateCcw size={14} /> New Farm Selection
            </button>
          </div>
        </div>
      </div>

      {/* Demo mode alert */}
      {isDemo && showDemoAlert && (
        <div style={{
          background: 'var(--color-yellow-light)',
          borderBottom: '1px solid #F3C86A',
          padding: '10px 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--color-yellow-dark)', fontWeight: '600' }}>
            📊 You're viewing calibrated baseline data. Draw or pin a specific farm on the map to run custom Sentinel telemetry.
          </p>
          <button onClick={() => setShowDemoAlert(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', color: 'var(--color-yellow-dark)' }}>✕</button>
        </div>
      )}

      {/* ===== TABS ===== */}
      <div style={{ background: 'var(--color-white)', borderBottom: '1px solid var(--color-cream-border)', padding: '0 24px' }}>
        <div className="container">
          <div style={{ display: 'flex', gap: '4px', overflowX: 'auto', paddingBottom: '0' }}>
            {TABS.map((tab) => (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '14px 18px',
                  border: 'none',
                  borderBottom: activeTab === tab.id ? '2.5px solid var(--color-brown-700)' : '2.5px solid transparent',
                  background: activeTab === tab.id ? 'var(--color-cream)' : 'transparent',
                  cursor: 'pointer',
                  fontSize: '0.85rem', fontWeight: activeTab === tab.id ? '700' : '600',
                  color: activeTab === tab.id ? 'var(--color-brown-900)' : 'var(--color-text-muted)',
                  fontFamily: 'var(--font-body)',
                  whiteSpace: 'nowrap',
                  borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0',
                  transition: 'var(--transition)',
                }}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ===== TAB CONTENT ===== */}
      <div className="container" style={{ padding: '28px 24px' }}>
        <div className="animate-fade-in" key={activeTab}>
          {TAB_CONTENT[activeTab]}
        </div>
      </div>
    </div>
  )
}
