import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Leaf, Cloud, Beaker, TrendingUp, AlertTriangle, Cpu, RotateCcw, Download, Activity } from 'lucide-react'
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
  { id: 'overview',        label: 'Overview',        icon: <Activity size={14} /> },
  { id: 'satellite',       label: 'Satellite',        icon: <Cpu size={14} /> },
  { id: 'weather',         label: 'Weather',          icon: <Cloud size={14} /> },
  { id: 'soil',            label: 'Soil',             icon: <Beaker size={14} /> },
  { id: 'yield',           label: 'Yield',            icon: <TrendingUp size={14} /> },
  { id: 'risks',           label: 'Risks',            icon: <AlertTriangle size={14} /> },
  { id: 'recommendations', label: 'Recommendations',  icon: <Leaf size={14} /> },
]

function SectionTitle({ title, subtitle, badge }) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
        <h3 style={{ margin: 0, fontFamily: 'var(--font-heading)', fontSize: '1.2rem' }}>{title}</h3>
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
  const label = score >= 75 ? 'Good' : score >= 50 ? 'Fair' : 'Poor'
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: '8px',
      padding: '6px 18px', borderRadius: 'var(--radius-full)',
      background: bg, border: `1.5px solid ${color}`,
    }}>
      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: color }} />
      <span style={{ fontWeight: '800', fontSize: '1rem', color }}>{score}/100</span>
      <span style={{ fontWeight: '600', fontSize: '0.8rem', color }}>{label}</span>
    </div>
  )
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

  /* ======================================================
     OVERVIEW TAB
     ====================================================== */
  const OverviewTab = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* KPI cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '14px' }}>
        <StatCard
          icon="🌿" label="Farm Health"
          value={data.health?.score} unit="/100"
          color="var(--color-green-dark)" bg="var(--color-green-light)"
          trend="up" trendLabel="+4 vs last season"
        />
        <StatCard
          icon="🛰️" label="NDVI"
          value={data.health?.ndvi} unit=""
          color="var(--color-brown-600)" bg="var(--color-brown-100)"
          subtitle="Vegetation index"
        />
        <StatCard
          icon="🪱" label="Soil Score"
          value={data.health?.soil_score} unit="/100"
          color="#8B6914" bg="#FEF3C7"
          trend="up" trendLabel="Improving"
        />
        <StatCard
          icon="🌾" label="Predicted Yield"
          value={data.yield?.predicted_tons_per_hectare} unit="t/ha"
          color="var(--color-green-dark)" bg="var(--color-green-light)"
          trend="up" trendLabel="Above average"
        />
        <StatCard
          icon="⚠️" label="Drought Risk"
          value={`${data.risks?.drought?.score}%`}
          color="var(--color-orange)" bg="var(--color-orange-light)"
          subtitle={data.risks?.drought?.label}
        />
      </div>

      {/* Main content grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* NDVI trend */}
        <ChartCard title="NDVI Trend" subtitle="Vegetation health over time" badge={isDemo ? '📊 Demo Data' : undefined}>
          <NDVIChart data={data.satellite?.ndvi_trend} />
        </ChartCard>

        {/* Weather */}
        <WeatherCard weather={data.weather} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Top crops */}
        <div className="card" style={{ padding: '22px' }}>
          <SectionTitle title="Top Crop Picks" subtitle="By suitability score" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {data.crops?.slice(0, 3).map((c, i) => (
              <CropCard key={c.name} crop={c} rank={i + 1} />
            ))}
          </div>
        </div>

        {/* Risk radar */}
        <ChartCard title="Risk Overview" subtitle="Multi-factor risk assessment">
          <RiskChart risks={data.risks} />
        </ChartCard>
      </div>

      {/* AI Recommendations preview */}
      <RecommendationCard recommendations={data.recommendations?.slice(0, 2)} isDemo={isDemo} />
    </div>
  )

  /* ======================================================
     SATELLITE TAB
     ====================================================== */
  const SatelliteTab = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* NDVI headline */}
      <div className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ margin: '0 0 6px', fontFamily: 'var(--font-heading)' }}>Vegetation Health (NDVI)</h3>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
              Normalised Difference Vegetation Index — higher = healthier vegetation
            </p>
          </div>
          {isDemo && <span className="demo-tag">📡 Simulated Data</span>}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '14px', marginBottom: '24px' }}>
          {[
            { label: 'Current NDVI', value: data.satellite?.ndvi_current, color: 'var(--color-green-dark)' },
            { label: 'Vegetation Status', value: data.satellite?.vegetation_status, color: 'var(--color-brown-600)' },
            { label: 'Farm Health', value: `${data.health?.score}/100`, color: 'var(--color-green-dark)' },
          ].map((s) => (
            <div key={s.label} style={{ textAlign: 'center', background: 'var(--color-cream)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: '900', color: s.color }}>{s.value}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: '600', marginTop: '4px' }}>{s.label}</div>
            </div>
          ))}
        </div>
        <NDVIChart data={data.satellite?.ndvi_trend} />
      </div>

      {/* NDVI scale legend */}
      <div className="card" style={{ padding: '20px' }}>
        <h4 style={{ fontFamily: 'var(--font-heading)', marginBottom: '14px' }}>NDVI Scale Reference</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '10px' }}>
          {[
            { range: '0.8 – 1.0', label: 'Dense Forest / Very Healthy', color: '#1B5E20' },
            { range: '0.6 – 0.8', label: 'Healthy Crops', color: '#2D6A4F' },
            { range: '0.4 – 0.6', label: 'Moderate Vegetation', color: '#74C69D' },
            { range: '0.2 – 0.4', label: 'Sparse Vegetation', color: '#D4A96A' },
            { range: '0.0 – 0.2', label: 'Bare Soil / Stress', color: '#8B5E3C' },
          ].map((item) => (
            <div key={item.range} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '28px', height: '14px', borderRadius: '3px', background: item.color, flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--color-brown-800)' }}>{item.range}</div>
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
      <WeatherCard weather={data.weather} />
      <ChartCard title="7-Day Weather Trend" subtitle="Temperature and rainfall forecast">
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
      <div className="card" style={{ padding: '22px' }}>
        <h4 style={{ fontFamily: 'var(--font-heading)', marginBottom: '14px' }}>Soil Intelligence Notes</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[
            { icon: '⚗️', note: `pH ${data.soil?.ph} is ${data.soil?.ph >= 6 && data.soil?.ph <= 7.5 ? 'optimal for most crops including Rice and Maize.' : 'slightly outside optimal range — consider soil amendment.'}` },
            { icon: '💧', note: `Soil moisture at ${data.soil?.moisture}% — ${data.soil?.moisture > 70 ? 'high, delay irrigation.' : data.soil?.moisture < 40 ? 'low, consider irrigation soon.' : 'within healthy range.'}` },
            { icon: '🌱', note: `Nitrogen is ${data.soil?.nitrogen?.toLowerCase()} — ${data.soil?.nitrogen === 'Low' ? 'consider nitrogen top-dressing before next growth stage.' : 'no additional N fertilization needed immediately.'}` },
          ].map((n, i) => (
            <div key={i} style={{
              display: 'flex', gap: '10px', alignItems: 'flex-start',
              padding: '12px', background: 'var(--color-cream)', borderRadius: 'var(--radius-md)',
            }}>
              <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{n.icon}</span>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>{n.note}</p>
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
      <YieldCard yieldData={data.yield} />
      <ChartCard title="Yield History & Prediction" subtitle="Seasonal yield comparison">
        <YieldChart data={data.yield?.historical} benchmark={data.yield?.benchmark_tons_per_hectare} />
      </ChartCard>
      <ChartCard title="Crop Suitability Ranking" subtitle="Score out of 100 for your farm conditions">
        <CropSuitabilityChart crops={data.crops} />
      </ChartCard>
    </div>
  )

  /* ======================================================
     RISKS TAB
     ====================================================== */
  const RisksTab = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <RiskCard risks={data.risks} />
        <ChartCard title="Risk Radar" subtitle="Multi-factor risk visualization">
          <RiskChart risks={data.risks} />
        </ChartCard>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '10px',
                background: 'var(--color-green-light)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.1rem',
              }}>🌾</div>
              <div>
                <h3 style={{ margin: 0, fontFamily: 'var(--font-heading)', fontSize: '1.1rem' }}>
                  {data.farm?.name || 'Farm Analysis'}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                  <MapPin size={11} />
                  {data.farm?.location || 'Selected Location'}
                  {data.farm?.area_hectares && (
                    <> · <strong style={{ color: 'var(--color-brown-600)' }}>{data.farm.area_hectares} ha</strong></>
                  )}
                  {data.farm?.crop && (
                    <> · <strong style={{ color: 'var(--color-brown-600)' }}>{data.farm.crop}</strong></>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {isDemo && <span className="demo-tag">📊 Demo Mode</span>}
            <HealthScoreBadge score={data.health?.score} />
            <button className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.83rem' }} onClick={handleNewAnalysis}>
              <RotateCcw size={14} /> New Analysis
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
            📊 You're viewing <strong>demo data</strong>. Select a real farm location and click Analyze to get live analysis.
          </p>
          <button onClick={() => setShowDemoAlert(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', color: 'var(--color-yellow-dark)' }}>✕</button>
        </div>
      )}

      {/* ===== TABS ===== */}
      <div style={{ background: 'var(--color-white)', borderBottom: '1px solid var(--color-cream-border)', padding: '0 24px' }}>
        <div className="container">
          <div style={{ display: 'flex', gap: '0', overflowX: 'auto', paddingBottom: '0' }}>
            {TABS.map((tab) => (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '14px 16px',
                  border: 'none', borderBottom: activeTab === tab.id ? '2px solid var(--color-brown-600)' : '2px solid transparent',
                  background: 'transparent', cursor: 'pointer',
                  fontSize: '0.83rem', fontWeight: activeTab === tab.id ? '700' : '600',
                  color: activeTab === tab.id ? 'var(--color-brown-700)' : 'var(--color-text-muted)',
                  fontFamily: 'var(--font-body)',
                  whiteSpace: 'nowrap',
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
