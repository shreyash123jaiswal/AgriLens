import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, useMap, useMapEvents, Polygon } from 'react-leaflet'
import { Search, MapPin, Leaf, ArrowRight, Info, Trash2, MousePointer } from 'lucide-react'
import Navbar from '../components/Navbar'
import LoadingScreen from '../components/LoadingScreen'
import { useFarm } from '../context/FarmContext'
import { analyzeFarm } from '../services/farmApi'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix Leaflet default icon issue with Vite
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const POPULAR_LOCATIONS = [
  { name: 'Punjab, India',       lat: 30.9,  lng: 75.8 },
  { name: 'Maharashtra, India',  lat: 19.7,  lng: 75.3 },
  { name: 'Tamil Nadu, India',   lat: 11.1,  lng: 78.7 },
  { name: 'Karnataka, India',    lat: 15.3,  lng: 75.7 },
  { name: 'Andhra Pradesh, India', lat: 15.9, lng: 79.7 },
]

const CROPS = ['Rice', 'Wheat', 'Maize', 'Cotton', 'Sugarcane', 'Soybean', 'Pulses', 'Tomato']

function calculatePolygonArea(latlngs) {
  if (!latlngs || latlngs.length < 3) return 0
  let area = 0
  for (let i = 0; i < latlngs.length; i++) {
    const j = (i + 1) % latlngs.length
    area += latlngs[i][1] * latlngs[j][0]
    area -= latlngs[j][1] * latlngs[i][0]
  }
  area = Math.abs(area) / 2
  const midLat = latlngs[0][0]
  const hectares = area * 111319.9 * 111319.9 * Math.cos((midLat * Math.PI) / 180) / 10000
  return hectares.toFixed(2)
}

// Component that flies to a position
function FlyTo({ position }) {
  const map = useMap()
  useEffect(() => {
    if (position) map.flyTo(position, 13, { duration: 1.5 })
  }, [position, map])
  return null
}

// Component to handle map click for polygon drawing
function DrawingLayer({ isDrawing, onPointAdded, onComplete }) {
  useMapEvents({
    click(e) {
      if (!isDrawing) return
      onPointAdded([e.latlng.lat, e.latlng.lng])
    },
    dblclick(e) {
      if (!isDrawing) return
      e.originalEvent.preventDefault()
      onComplete()
    },
  })
  return null
}

// Show markers for points being drawn
function DrawingMarkers({ points }) {
  const map = useMap()
  const markersRef = useRef([])

  useEffect(() => {
    // Clear old markers
    markersRef.current.forEach((m) => m.remove())
    markersRef.current = []

    // Draw new markers
    points.forEach((p, i) => {
      const marker = L.circleMarker([p[0], p[1]], {
        radius: i === 0 ? 7 : 5,
        color: '#2D6A4F',
        fillColor: i === 0 ? '#40916C' : 'white',
        fillOpacity: 1,
        weight: 2,
      }).addTo(map)
      markersRef.current.push(marker)
    })

    return () => {
      markersRef.current.forEach((m) => m.remove())
      markersRef.current = []
    }
  }, [points, map])

  return null
}

export default function FarmSelection() {
  const navigate = useNavigate()
  const { setFarmData, setAnalysisResult, setLoading, setError, loading, loadMockData } = useFarm()

  const [mapPosition, setMapPosition] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [isDrawing, setIsDrawing] = useState(false)
  const [drawnPoints, setDrawnPoints] = useState([])       // [[lat,lng], ...]
  const [finishedPolygon, setFinishedPolygon] = useState(null)
  const [farmArea, setFarmArea] = useState(null)
  const [farmName, setFarmName] = useState('My Farm')
  const [selectedCrop, setSelectedCrop] = useState('Rice')

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    setSearching(true)
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=5`
      )
      const data = await res.json()
      setSearchResults(data)
    } catch {
      setSearchResults([])
    } finally {
      setSearching(false)
    }
  }

  const selectSearchResult = (result) => {
    const pos = [parseFloat(result.lat), parseFloat(result.lon)]
    setMapPosition(pos)
    setSearchResults([])
    setSearchQuery(result.display_name.split(',').slice(0, 2).join(', '))
  }

  const startDrawing = () => {
    setIsDrawing(true)
    setDrawnPoints([])
    setFinishedPolygon(null)
    setFarmArea(null)
  }

  const handlePointAdded = useCallback((point) => {
    setDrawnPoints((prev) => [...prev, point])
  }, [])

  const handleComplete = useCallback(() => {
    setDrawnPoints((prev) => {
      if (prev.length < 3) return prev
      const area = calculatePolygonArea(prev)
      setFarmArea(area)
      setFinishedPolygon(prev)
      setIsDrawing(false)
      return prev
    })
  }, [])

  const clearPolygon = () => {
    setDrawnPoints([])
    setFinishedPolygon(null)
    setFarmArea(null)
    setIsDrawing(false)
  }

  const handleAnalyze = async () => {
    setLoading(true)
    setError(null)

    const center = finishedPolygon?.length
      ? [
          finishedPolygon.reduce((s, p) => s + p[0], 0) / finishedPolygon.length,
          finishedPolygon.reduce((s, p) => s + p[1], 0) / finishedPolygon.length,
        ]
      : mapPosition || [20.5937, 78.9629]

    const payload = {
      polygon: finishedPolygon || [],
      farmName,
      crop: selectedCrop,
      center,
    }

    setFarmData(payload)

    try {
      const result = await analyzeFarm(payload)
      setAnalysisResult(result)
      navigate('/dashboard')
    } catch (err) {
      console.warn('Backend unavailable — loading demo data:', err.message)
      loadMockData({
        farm: {
          name: farmName,
          area_hectares: farmArea || 2.4,
          location: searchQuery || 'Selected Location',
          crop: selectedCrop,
        },
      })
      navigate('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <LoadingScreen message={`Analyzing ${farmName}…`} />

  return (
    <div style={{ background: 'var(--color-cream)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px', flex: 1, width: '100%' }}>
        {/* Header */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <MapPin size={18} color="var(--color-orange)" />
            <span style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--color-orange)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              Step 1 of 2 — Farm Selection
            </span>
          </div>
          <h2 style={{ marginBottom: '8px' }}>Select Your Farm</h2>
          <p style={{ color: 'var(--color-text-muted)', maxWidth: '560px' }}>
            Search your location, then draw your farm boundary on the map. Click to add points, double-click to finish.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px', alignItems: 'start' }}>
          {/* ===== SIDEBAR ===== */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Farm Details */}
            <div className="card" style={{ padding: '20px' }}>
              <h4 style={{ marginBottom: '16px', fontFamily: 'var(--font-heading)', fontSize: '1rem' }}>Farm Details</h4>
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--color-text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                  Farm Name
                </div>
                <input
                  id="farm-name-input"
                  type="text"
                  value={farmName}
                  onChange={(e) => setFarmName(e.target.value)}
                  placeholder="e.g. North Field"
                  style={{
                    width: '100%', padding: '9px 12px',
                    border: '1.5px solid var(--color-cream-border)',
                    borderRadius: 'var(--radius-md)',
                    fontFamily: 'var(--font-body)', fontSize: '0.9rem',
                    color: 'var(--color-text-primary)', background: 'var(--color-white)',
                    outline: 'none', boxSizing: 'border-box',
                  }}
                />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--color-text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                  Primary Crop
                </div>
                <select
                  id="crop-select"
                  value={selectedCrop}
                  onChange={(e) => setSelectedCrop(e.target.value)}
                  style={{
                    width: '100%', padding: '9px 12px',
                    border: '1.5px solid var(--color-cream-border)',
                    borderRadius: 'var(--radius-md)',
                    fontFamily: 'var(--font-body)', fontSize: '0.9rem',
                    color: 'var(--color-text-primary)', background: 'var(--color-white)',
                    outline: 'none', boxSizing: 'border-box', cursor: 'pointer',
                  }}
                >
                  {CROPS.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>

            {/* Location Search */}
            <div className="card" style={{ padding: '20px' }}>
              <h4 style={{ marginBottom: '14px', fontFamily: 'var(--font-heading)', fontSize: '1rem' }}>Find Location</h4>
              <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                <input
                  id="location-search"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search village, district…"
                  style={{
                    flex: 1, padding: '8px 12px',
                    border: '1.5px solid var(--color-cream-border)',
                    borderRadius: 'var(--radius-md)',
                    fontFamily: 'var(--font-body)', fontSize: '0.85rem',
                    color: 'var(--color-text-primary)', background: 'var(--color-white)',
                    outline: 'none',
                  }}
                />
                <button type="submit" className="btn btn-brown" style={{ padding: '8px 14px', borderRadius: 'var(--radius-md)', flexShrink: 0 }} disabled={searching}>
                  <Search size={15} />
                </button>
              </form>
              {searchResults.length > 0 && (
                <div style={{ border: '1px solid var(--color-cream-border)', borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: '10px' }}>
                  {searchResults.map((r) => (
                    <button key={r.place_id}
                      onClick={() => selectSearchResult(r)}
                      style={{
                        width: '100%', textAlign: 'left', padding: '9px 12px',
                        border: 'none', borderBottom: '1px solid var(--color-cream-border)',
                        background: 'var(--color-white)', cursor: 'pointer',
                        fontSize: '0.78rem', color: 'var(--color-text-secondary)',
                        fontFamily: 'var(--font-body)',
                      }}
                    >
                      📍 {r.display_name.split(',').slice(0, 3).join(',')}
                    </button>
                  ))}
                </div>
              )}
              <div style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--color-text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                Quick Pick
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {POPULAR_LOCATIONS.map((loc) => (
                  <button key={loc.name}
                    onClick={() => setMapPosition([loc.lat, loc.lng])}
                    style={{
                      padding: '4px 10px', borderRadius: 'var(--radius-full)',
                      border: '1px solid var(--color-cream-border)',
                      background: 'var(--color-white)', cursor: 'pointer',
                      fontSize: '0.72rem', color: 'var(--color-text-secondary)',
                      fontFamily: 'var(--font-body)', fontWeight: '600',
                    }}
                  >
                    {loc.name.split(',')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Draw Controls */}
            <div className="card" style={{ padding: '20px' }}>
              <h4 style={{ marginBottom: '14px', fontFamily: 'var(--font-heading)', fontSize: '1rem' }}>Farm Boundary</h4>

              {farmArea ? (
                <div style={{
                  padding: '14px', borderRadius: 'var(--radius-md)',
                  background: 'var(--color-green-light)',
                  border: '1px solid rgba(64,145,108,0.3)',
                  marginBottom: '12px',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <div>
                    <div style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--color-green-dark)', textTransform: 'uppercase' }}>Farm Area</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--color-green-dark)' }}>{farmArea} ha</div>
                  </div>
                  <button onClick={clearPolygon} style={{ background: 'rgba(45,106,79,0.1)', border: 'none', cursor: 'pointer', borderRadius: 'var(--radius-md)', padding: '8px', color: 'var(--color-green-dark)' }}>
                    <Trash2 size={15} />
                  </button>
                </div>
              ) : (
                <button
                  id="start-draw-btn"
                  onClick={isDrawing ? handleComplete : startDrawing}
                  className="btn"
                  style={{
                    width: '100%', justifyContent: 'center',
                    marginBottom: '10px',
                    background: isDrawing ? 'var(--color-green-dark)' : 'var(--color-cream-dark)',
                    color: isDrawing ? 'white' : 'var(--color-brown-700)',
                    border: `1.5px solid ${isDrawing ? 'var(--color-green-dark)' : 'var(--color-cream-border)'}`,
                  }}
                >
                  <MousePointer size={15} />
                  {isDrawing
                    ? `Finish (${drawnPoints.length} pts) — Double-click map`
                    : 'Draw Farm Boundary'}
                </button>
              )}

              <div style={{
                padding: '12px', background: 'var(--color-cream)', borderRadius: 'var(--radius-md)',
                display: 'flex', gap: '8px', alignItems: 'flex-start',
              }}>
                <Info size={14} style={{ color: 'var(--color-brown-400)', flexShrink: 0, marginTop: '1px' }} />
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: 0, lineHeight: 1.6 }}>
                  {isDrawing
                    ? <><strong>Click</strong> to add points · <strong>Double-click</strong> to finish the polygon</>
                    : <>Click <strong>"Draw Farm Boundary"</strong> then click on the map to draw your farm outline.</>
                  }
                </p>
              </div>
            </div>

            {/* Analyze Button */}
            <button
              id="analyze-farm-btn"
              className="btn btn-primary btn-lg"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={handleAnalyze}
            >
              <Leaf size={18} /> Analyze Farm <ArrowRight size={16} />
            </button>
            <p style={{ fontSize: '0.73rem', color: 'var(--color-text-muted)', textAlign: 'center', margin: '0' }}>
              No polygon drawn? Demo data will be used.
            </p>
          </div>

          {/* ===== MAP ===== */}
          <div style={{ position: 'sticky', top: '80px' }}>
            {isDrawing && (
              <div style={{
                position: 'absolute', top: '12px', left: '50%', transform: 'translateX(-50%)',
                zIndex: 1000, background: 'var(--color-green-dark)', color: 'white',
                padding: '8px 20px', borderRadius: 'var(--radius-full)',
                fontSize: '0.82rem', fontWeight: '700', boxShadow: 'var(--shadow-md)',
                whiteSpace: 'nowrap',
              }}>
                ✏️ Drawing mode — click to add points, double-click to finish
              </div>
            )}
            <div style={{
              borderRadius: 'var(--radius-lg)', overflow: 'hidden',
              border: '1px solid var(--color-cream-border)', boxShadow: 'var(--shadow-md)',
              height: '580px', cursor: isDrawing ? 'crosshair' : 'grab',
            }}>
              <MapContainer center={[20.5937, 78.9629]} zoom={5} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {mapPosition && <FlyTo position={mapPosition} />}
                <DrawingLayer
                  isDrawing={isDrawing}
                  onPointAdded={handlePointAdded}
                  onComplete={handleComplete}
                />
                {drawnPoints.length > 0 && !finishedPolygon && (
                  <DrawingMarkers points={drawnPoints} />
                )}
                {/* Live polygon preview while drawing */}
                {drawnPoints.length >= 2 && !finishedPolygon && (
                  <Polygon
                    positions={drawnPoints}
                    pathOptions={{ color: '#2D6A4F', fillColor: '#40916C', fillOpacity: 0.15, weight: 2, dashArray: '6 4' }}
                  />
                )}
                {/* Finished polygon */}
                {finishedPolygon && (
                  <Polygon
                    positions={finishedPolygon}
                    pathOptions={{ color: '#2D6A4F', fillColor: '#40916C', fillOpacity: 0.2, weight: 2.5 }}
                  />
                )}
              </MapContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
