import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, useMap, useMapEvents, Polygon, Marker, Popup, GeoJSON } from 'react-leaflet'
import {
  Search, MapPin, Leaf, ArrowRight, Info, Trash2, MousePointer,
  Compass, Navigation, Crosshair, AlertCircle, CheckCircle2, Layers
} from 'lucide-react'
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
  { name: 'Punjab, India',         lat: 30.9,  lng: 75.8 },
  { name: 'Maharashtra, India',    lat: 19.7,  lng: 75.3 },
  { name: 'Tamil Nadu, India',     lat: 11.1,  lng: 78.7 },
  { name: 'Karnataka, India',      lat: 15.3,  lng: 75.7 },
  { name: 'Andhra Pradesh, India', lat: 15.9,  lng: 79.7 },
  { name: 'West Bengal, India',    lat: 22.5,  lng: 88.3 },
  { name: 'Rajasthan, India',      lat: 26.3,  lng: 73.0 },
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

// Component to handle map clicks for polygon drawing and coordinate picking
function MapInteractionLayer({ isDrawing, onPointAdded, onComplete, onMapClick, locationMode }) {
  useMapEvents({
    click(e) {
      if (isDrawing) {
        onPointAdded([e.latlng.lat, e.latlng.lng])
      } else if (locationMode === 'coords' && onMapClick) {
        onMapClick([e.latlng.lat, e.latlng.lng])
      }
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
    markersRef.current.forEach((m) => m.remove())
    markersRef.current = []

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
  const [locationMode, setLocationMode] = useState('coords') // 'coords' | 'search'
  const [inputLat, setInputLat] = useState('19.7515')
  const [inputLng, setInputLng] = useState('75.7139')
  const [coordsError, setCoordsError] = useState(null)
  const [coordsSuccess, setCoordsSuccess] = useState(false)

  // Map visualization state
  const [mapStyle, setMapStyle] = useState('satellite') // 'satellite' | 'streets'
  const [showBorders, setShowBorders] = useState(true)
  const [statesGeoJson, setStatesGeoJson] = useState(null)
  const [nationalBorderGeoJson, setNationalBorderGeoJson] = useState(null)
  const stateGeoJsonRef = useRef(null)

  const [searchQuery, setSearchQuery] = useState('')
  const [searchedPlaceName, setSearchedPlaceName] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [isDrawing, setIsDrawing] = useState(false)
  const [drawnPoints, setDrawnPoints] = useState([])       // [[lat,lng], ...]
  const [finishedPolygon, setFinishedPolygon] = useState(null)
  const [farmArea, setFarmArea] = useState(null)
  const [farmName, setFarmName] = useState('My Farm')
  const [selectedCrop, setSelectedCrop] = useState('Rice')

  const fetchReverseGeocode = async (lat, lon) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`)
      if (res.ok) {
        const data = await res.json()
        const city = data.address?.city || data.address?.town || data.address?.village || data.address?.suburb || data.address?.county
        const state = data.address?.state
        const parts = [city, state].filter(Boolean)
        const unique = parts.filter((item, idx) => parts.indexOf(item) === idx)
        const loc = unique.join(', ')
        if (loc) {
          setSearchedPlaceName(loc)
        }
      }
    } catch {
      // ignore
    }
  }

  // Load India boundaries GeoJSON
  useEffect(() => {
    fetch('/data/india_states.geojson')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setStatesGeoJson(data)
      })
      .catch((err) => console.warn('Could not load states geojson:', err))

    fetch('/data/india_border.geojson')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setNationalBorderGeoJson(data)
      })
      .catch((err) => console.warn('Could not load national border geojson:', err))
  }, [])

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
    const lat = parseFloat(result.lat)
    const lng = parseFloat(result.lon)
    const pos = [lat, lng]
    setMapPosition(pos)
    setInputLat(lat.toFixed(5))
    setInputLng(lng.toFixed(5))
    setSearchResults([])
    const rawParts = result.display_name.split(',').map(s => s.trim())
    const uniqueParts = rawParts.filter((item, idx) => rawParts.indexOf(item) === idx)
    const cleanPlace = uniqueParts.slice(0, 2).join(', ')
    setSearchQuery(cleanPlace)
    setSearchedPlaceName(cleanPlace)
  }

  const handleApplyCoords = () => {
    const lat = parseFloat(inputLat)
    const lng = parseFloat(inputLng)

    if (isNaN(lat) || isNaN(lng)) {
      setCoordsError('Please enter both Latitude and Longitude as valid numbers.')
      return
    }
    if (lat < -90 || lat > 90) {
      setCoordsError('Latitude must be between -90 and 90 degrees.')
      return
    }
    if (lng < -180 || lng > 180) {
      setCoordsError('Longitude must be between -180 and 180 degrees.')
      return
    }

    setCoordsError(null)
    const pos = [lat, lng]
    setMapPosition(pos)
    fetchReverseGeocode(lat, lng)
    setCoordsSuccess(true)
    setTimeout(() => setCoordsSuccess(false), 2500)
  }

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setCoordsError('Geolocation is not supported by your browser.')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = parseFloat(pos.coords.latitude.toFixed(5))
        const lng = parseFloat(pos.coords.longitude.toFixed(5))
        setInputLat(String(lat))
        setInputLng(String(lng))
        setMapPosition([lat, lng])
        setCoordsError(null)
        fetchReverseGeocode(lat, lng)
        setCoordsSuccess(true)
        setTimeout(() => setCoordsSuccess(false), 2500)
      },
      (err) => {
        setCoordsError(`GPS error: ${err.message}`)
      }
    )
  }

  const handleGenerateBoundary = () => {
    let lat = parseFloat(inputLat)
    let lng = parseFloat(inputLng)

    if (isNaN(lat) || isNaN(lng)) {
      if (mapPosition) {
        lat = mapPosition[0]
        lng = mapPosition[1]
      } else {
        setCoordsError('Please enter valid coordinates first or set location.')
        return
      }
    }

    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      setCoordsError('Latitude must be between -90 and 90, Longitude between -180 and 180.')
      return
    }

    // Generate ~2 hectare square centered at (lat, lng)
    const dLat = 71.0 / 111320.0
    const dLng = 71.0 / (111320.0 * Math.cos((lat * Math.PI) / 180.0))

    const poly = [
      [lat + dLat, lng - dLng],
      [lat + dLat, lng + dLng],
      [lat - dLat, lng + dLng],
      [lat - dLat, lng - dLng],
    ]

    setMapPosition([lat, lng])
    setFinishedPolygon(poly)
    setFarmArea(calculatePolygonArea(poly))
    setIsDrawing(false)
    setCoordsError(null)
    if (!searchedPlaceName) {
      fetchReverseGeocode(lat, lng)
    }
  }

  const handleMapClick = useCallback((latlng) => {
    if (locationMode === 'coords' && !isDrawing) {
      setInputLat(latlng[0].toFixed(5))
      setInputLng(latlng[1].toFixed(5))
      setMapPosition(latlng)
      fetchReverseGeocode(latlng[0], latlng[1])
    }
  }, [locationMode, isDrawing])

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
      : mapPosition || [parseFloat(inputLat) || 19.7515, parseFloat(inputLng) || 75.7139]

    const locLabel = searchedPlaceName || (searchQuery && !searchQuery.includes('°') ? searchQuery : '')

    const payload = {
      polygon: finishedPolygon || [],
      farmName: farmName || 'My Farm',
      locationName: locLabel,
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
          name: farmName || 'My Farm',
          place_name: locLabel || 'Selected Farm',
          area_hectares: farmArea || 2.4,
          location: locLabel
            ? `${locLabel} (${center[0].toFixed(3)}°N, ${center[1].toFixed(3)}°E)`
            : `(${center[0].toFixed(3)}°N, ${center[1].toFixed(3)}°E)`,
          crop: selectedCrop,
        },
      })
      navigate('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  // --- Styling for State & National Borders ---
  const stateStyle = useCallback(() => ({
    color: mapStyle === 'satellite' ? '#52B788' : '#2D6A4F',
    weight: 1.6,
    opacity: 0.85,
    fillColor: '#40916C',
    fillOpacity: mapStyle === 'satellite' ? 0.05 : 0.03,
    dashArray: '4, 4',
  }), [mapStyle])

  const nationalBorderStyle = useCallback(() => ({
    color: '#E76F51', // Warm saffron / terracotta glowing national border
    weight: 3.5,
    opacity: 0.95,
    fillColor: '#2D6A4F',
    fillOpacity: 0.0,
    dashArray: null,
  }), [])

  const onEachStateFeature = useCallback((feature, layer) => {
    const stateName = feature.properties?.name || 'State'
    layer.bindTooltip(
      `<div style="font-weight: 800; font-size: 0.82rem; color: #1B4332; display: flex; align-items: center; gap: 6px;">
         <span>🏛️</span>
         <span>${stateName}</span>
       </div>
       <div style="font-size: 0.68rem; color: #666; margin-top: 2px;">Click to center region</div>`,
      {
        sticky: true,
        direction: 'top',
        className: 'custom-state-tooltip',
      }
    )

    layer.on({
      mouseover: (e) => {
        const l = e.target
        l.setStyle({
          weight: 3.0,
          color: '#E76F51',
          fillColor: '#52B788',
          fillOpacity: 0.22,
          dashArray: null,
        })
        if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
          l.bringToFront()
        }
      },
      mouseout: (e) => {
        if (stateGeoJsonRef.current) {
          stateGeoJsonRef.current.resetStyle(e.target)
        }
      },
      click: (e) => {
        if (isDrawing) return
        const bounds = e.target.getBounds()
        const center = bounds.getCenter()
        setMapPosition([center.lat, center.lng])
        setInputLat(center.lat.toFixed(5))
        setInputLng(center.lng.toFixed(5))
        setSearchQuery(stateName)
      },
    })
  }, [isDrawing])

  if (loading) return <LoadingScreen message={`Analyzing ${farmName}…`} />

  return (
    <div style={{ background: 'var(--color-cream)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '32px 24px', flex: 1, width: '100%' }}>
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <MapPin size={18} color="var(--color-orange)" />
            <span style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--color-orange)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              Step 1 of 2 — Farm Selection
            </span>
          </div>
          <h2 style={{ marginBottom: '6px' }}>Select Your Farm</h2>
          <p style={{ color: 'var(--color-text-muted)', maxWidth: '680px', fontSize: '0.92rem', margin: 0 }}>
            Enter your coordinates directly, click any Indian state to focus, or search by location. You can draw your farm boundary, auto-generate a 2 ha field, or analyze at your coordinates.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '24px', alignItems: 'start' }}>
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
                  placeholder="e.g. Maharashtra Field"
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

            {/* Location Card with Tabs */}
            <div className="card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <h4 style={{ margin: 0, fontFamily: 'var(--font-heading)', fontSize: '1rem' }}>Farm Location</h4>
              </div>

              {/* Mode Switcher */}
              <div style={{
                display: 'flex', background: 'var(--color-cream-dark)',
                padding: '3px', borderRadius: 'var(--radius-md)',
                marginBottom: '14px', border: '1px solid var(--color-cream-border)'
              }}>
                <button
                  type="button"
                  id="tab-coords-btn"
                  onClick={() => setLocationMode('coords')}
                  style={{
                    flex: 1, padding: '7px 10px', borderRadius: '6px',
                    border: 'none', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600,
                    background: locationMode === 'coords' ? 'var(--color-white)' : 'transparent',
                    color: locationMode === 'coords' ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                    boxShadow: locationMode === 'coords' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <Compass size={14} /> Coordinates
                </button>
                <button
                  type="button"
                  id="tab-search-btn"
                  onClick={() => setLocationMode('search')}
                  style={{
                    flex: 1, padding: '7px 10px', borderRadius: '6px',
                    border: 'none', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600,
                    background: locationMode === 'search' ? 'var(--color-white)' : 'transparent',
                    color: locationMode === 'search' ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                    boxShadow: locationMode === 'search' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <Search size={14} /> Search Place
                </button>
              </div>

              {/* Coordinates Mode */}
              {locationMode === 'coords' && (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
                    <div>
                      <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-text-muted)', display: 'block', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                        Latitude
                      </label>
                      <input
                        id="latitude-input"
                        type="number"
                        step="any"
                        value={inputLat}
                        onChange={(e) => { setInputLat(e.target.value); setCoordsError(null); }}
                        placeholder="e.g. 19.7515"
                        style={{
                          width: '100%', padding: '8px 10px',
                          border: coordsError ? '1.5px solid #E63946' : '1.5px solid var(--color-cream-border)',
                          borderRadius: 'var(--radius-md)',
                          fontSize: '0.86rem', outline: 'none', boxSizing: 'border-box',
                          background: 'var(--color-white)', color: 'var(--color-text-primary)',
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-text-muted)', display: 'block', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                        Longitude
                      </label>
                      <input
                        id="longitude-input"
                        type="number"
                        step="any"
                        value={inputLng}
                        onChange={(e) => { setInputLng(e.target.value); setCoordsError(null); }}
                        placeholder="e.g. 75.7139"
                        style={{
                          width: '100%', padding: '8px 10px',
                          border: coordsError ? '1.5px solid #E63946' : '1.5px solid var(--color-cream-border)',
                          borderRadius: 'var(--radius-md)',
                          fontSize: '0.86rem', outline: 'none', boxSizing: 'border-box',
                          background: 'var(--color-white)', color: 'var(--color-text-primary)',
                        }}
                      />
                    </div>
                  </div>

                  {coordsError && (
                    <div style={{ fontSize: '0.75rem', color: '#E63946', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <AlertCircle size={13} style={{ flexShrink: 0 }} /> {coordsError}
                    </div>
                  )}

                  {coordsSuccess && (
                    <div style={{ fontSize: '0.75rem', color: '#2D6A4F', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <CheckCircle2 size={13} style={{ flexShrink: 0 }} /> Location updated!
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                    <button
                      type="button"
                      id="apply-coords-btn"
                      onClick={handleApplyCoords}
                      className="btn btn-brown"
                      style={{ flex: 1, padding: '8px 12px', fontSize: '0.8rem', justifyContent: 'center' }}
                    >
                      <MapPin size={14} /> Set Coordinates
                    </button>
                    <button
                      type="button"
                      id="gps-location-btn"
                      onClick={handleUseCurrentLocation}
                      title="Use Current GPS Location"
                      style={{
                        padding: '8px 12px', background: 'var(--color-white)',
                        border: '1.5px solid var(--color-cream-border)', borderRadius: 'var(--radius-md)',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'var(--color-brown-700)', transition: 'all 0.2s ease',
                      }}
                    >
                      <Navigation size={15} />
                    </button>
                  </div>

                  <button
                    type="button"
                    id="auto-boundary-btn"
                    onClick={handleGenerateBoundary}
                    className="btn"
                    style={{
                      width: '100%', padding: '8px 12px', fontSize: '0.78rem',
                      background: 'rgba(45, 106, 79, 0.08)', color: 'var(--color-green-dark)',
                      border: '1.5px dashed var(--color-green-dark)', justifyContent: 'center',
                      marginBottom: '10px'
                    }}
                  >
                    <Crosshair size={14} /> Auto-Generate 2 ha Boundary Here
                  </button>

                  <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
                    💡 <em>Click any state on the map to zoom, or click anywhere to pick exact coordinates.</em>
                  </div>
                </div>
              )}

              {/* Search Mode */}
              {locationMode === 'search' && (
                <div>
                  <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                    <input
                      id="location-search"
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search village, district, state…"
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
                </div>
              )}

              {/* Quick Pick Buttons */}
              <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid var(--color-cream-border)' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--color-text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                  Quick Presets
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {POPULAR_LOCATIONS.map((loc) => (
                    <button key={loc.name}
                      onClick={() => {
                        setMapPosition([loc.lat, loc.lng])
                        setInputLat(loc.lat.toFixed(5))
                        setInputLng(loc.lng.toFixed(5))
                        setSearchQuery(loc.name)
                        setCoordsError(null)
                      }}
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
                  <button onClick={clearPolygon} title="Remove boundary" style={{ background: 'rgba(45,106,79,0.1)', border: 'none', cursor: 'pointer', borderRadius: 'var(--radius-md)', padding: '8px', color: 'var(--color-green-dark)' }}>
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
                    : 'Draw Custom Boundary'}
                </button>
              )}

              <div style={{
                padding: '12px', background: 'var(--color-cream)', borderRadius: 'var(--radius-md)',
                display: 'flex', gap: '8px', alignItems: 'flex-start',
              }}>
                <Info size={14} style={{ color: 'var(--color-brown-400)', flexShrink: 0, marginTop: '1px' }} />
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: 0, lineHeight: 1.6 }}>
                  {isDrawing
                    ? <><strong>Click</strong> to add points · <strong>Double-click</strong> to finish the boundary.</>
                    : <>You can draw custom polygon points or click <strong>"Auto-Generate 2 ha Boundary"</strong> above.</>
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
              Coordinates or polygon will be used to fetch live meteorological and satellite indicators.
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
              position: 'relative',
              borderRadius: 'var(--radius-lg)', overflow: 'hidden',
              border: '1px solid var(--color-cream-border)', boxShadow: 'var(--shadow-md)',
              height: '620px', cursor: isDrawing ? 'crosshair' : 'grab',
            }}>
              <MapContainer center={[22.5937, 78.9629]} zoom={5} style={{ height: '100%', width: '100%' }}>
                {/* Tile Layer: Satellite vs Streets */}
                {mapStyle === 'satellite' ? (
                  <TileLayer
                    attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                    maxZoom={18}
                  />
                ) : (
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    maxZoom={19}
                  />
                )}

                {/* India State Boundaries GeoJSON Layer */}
                {showBorders && statesGeoJson && (
                  <GeoJSON
                    key={`states-${mapStyle}`}
                    ref={stateGeoJsonRef}
                    data={statesGeoJson}
                    style={stateStyle}
                    onEachFeature={onEachStateFeature}
                  />
                )}

                {/* India National Border GeoJSON Layer */}
                {showBorders && nationalBorderGeoJson && (
                  <GeoJSON
                    key={`national-border-${mapStyle}`}
                    data={nationalBorderGeoJson}
                    style={nationalBorderStyle}
                    interactive={false}
                  />
                )}

                {mapPosition && <FlyTo position={mapPosition} />}

                <MapInteractionLayer
                  isDrawing={isDrawing}
                  onPointAdded={handlePointAdded}
                  onComplete={handleComplete}
                  onMapClick={handleMapClick}
                  locationMode={locationMode}
                />

                {/* Marker at current center */}
                {mapPosition && (
                  <Marker position={mapPosition}>
                    <Popup>
                      <div style={{ padding: '4px', textAlign: 'center' }}>
                        <strong style={{ display: 'block', color: 'var(--color-green-dark)', marginBottom: '2px' }}>
                          Selected Farm Center
                        </strong>
                        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                          {mapPosition[0].toFixed(5)}°N, {mapPosition[1].toFixed(5)}°E
                        </span>
                      </div>
                    </Popup>
                  </Marker>
                )}

                {drawnPoints.length > 0 && !finishedPolygon && (
                  <DrawingMarkers points={drawnPoints} />
                )}

                {/* Live polygon preview while drawing */}
                {drawnPoints.length >= 2 && !finishedPolygon && (
                  <Polygon
                    positions={drawnPoints}
                    pathOptions={{ color: '#E76F51', fillColor: '#F4A261', fillOpacity: 0.25, weight: 2.5, dashArray: '6 4' }}
                  />
                )}

                {/* Finished polygon */}
                {finishedPolygon && (
                  <Polygon
                    positions={finishedPolygon}
                    pathOptions={{ color: '#2D6A4F', fillColor: '#40916C', fillOpacity: 0.35, weight: 3 }}
                  />
                )}
              </MapContainer>

              {/* Floating Map Controls Panel */}
              <div className="map-overlay-panel">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--color-brown-700)', textTransform: 'uppercase', letterSpacing: '0.4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Layers size={12} color="var(--color-green-dark)" /> Map Style
                  </span>
                  <div style={{ display: 'flex', background: 'var(--color-cream-dark)', borderRadius: '6px', padding: '2px' }}>
                    <button
                      type="button"
                      id="map-style-satellite"
                      onClick={() => setMapStyle('satellite')}
                      style={{
                        padding: '3px 7px', fontSize: '0.68rem', fontWeight: 600, border: 'none', borderRadius: '4px',
                        cursor: 'pointer',
                        background: mapStyle === 'satellite' ? 'var(--color-white)' : 'transparent',
                        color: mapStyle === 'satellite' ? 'var(--color-green-dark)' : 'var(--color-text-muted)',
                        boxShadow: mapStyle === 'satellite' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
                      }}
                    >
                      🛰️ Satellite
                    </button>
                    <button
                      type="button"
                      id="map-style-streets"
                      onClick={() => setMapStyle('streets')}
                      style={{
                        padding: '3px 7px', fontSize: '0.68rem', fontWeight: 600, border: 'none', borderRadius: '4px',
                        cursor: 'pointer',
                        background: mapStyle === 'streets' ? 'var(--color-white)' : 'transparent',
                        color: mapStyle === 'streets' ? 'var(--color-green-dark)' : 'var(--color-text-muted)',
                        boxShadow: mapStyle === 'streets' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
                      }}
                    >
                      🗺️ Streets
                    </button>
                  </div>
                </div>

                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', fontWeight: 600, color: 'var(--color-text-secondary)', cursor: 'pointer', margin: 0 }}>
                  <input
                    type="checkbox"
                    id="toggle-borders-checkbox"
                    checked={showBorders}
                    onChange={(e) => setShowBorders(e.target.checked)}
                    style={{ accentColor: 'var(--color-green-dark)', cursor: 'pointer' }}
                  />
                  <span>🇮🇳 State & National Borders</span>
                </label>

                {showBorders && (
                  <div style={{ borderTop: '1px solid var(--color-cream-border)', paddingTop: '6px', fontSize: '0.68rem', color: 'var(--color-text-muted)', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ display: 'inline-block', width: '14px', height: '3.5px', background: '#E76F51', borderRadius: '2px' }} />
                      <strong style={{ color: '#E76F51' }}>National Border</strong>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ display: 'inline-block', width: '14px', height: '0', borderTop: '2px dashed #52B788' }} />
                      <span>State Borders (Hover/Click)</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Coordinate readout badge overlay */}
              {mapPosition && (
                <div style={{
                  position: 'absolute', bottom: '16px', right: '16px', zIndex: 1000,
                  background: 'rgba(255, 255, 255, 0.92)', backdropFilter: 'blur(4px)',
                  padding: '6px 12px', borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-md)', border: '1px solid var(--color-cream-border)',
                  fontSize: '0.76rem', fontWeight: 600, color: 'var(--color-brown-700)',
                  display: 'flex', alignItems: 'center', gap: '6px'
                }}>
                  <MapPin size={13} color="var(--color-orange)" />
                  Lat: {mapPosition[0].toFixed(4)}°N | Lng: {mapPosition[1].toFixed(4)}°E
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
