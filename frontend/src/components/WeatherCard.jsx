import { Thermometer, Droplets, Wind, CloudRain } from 'lucide-react'

export default function WeatherCard({ weather }) {
  if (!weather) return null

  const items = [
    { icon: <Thermometer size={18} />, label: 'Temperature', value: `${weather.temperature_c}°C`, color: 'var(--color-orange)' },
    { icon: <Droplets size={18} />,    label: 'Humidity',    value: `${weather.humidity}%`,        color: '#3B82F6' },
    { icon: <CloudRain size={18} />,   label: 'Rainfall',    value: `${weather.rainfall_mm} mm`,   color: '#0EA5E9' },
    { icon: <Wind size={18} />,        label: 'Wind',        value: `${weather.wind_kph} km/h`,    color: 'var(--color-text-muted)' },
  ]

  return (
    <div className="card" style={{ padding: '22px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
        <h4 style={{ margin: 0, fontFamily: 'var(--font-heading)' }}>Weather Conditions</h4>
        <span className="badge badge-brown">{weather.description || 'Current'}</span>
      </div>

      {/* Main stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
        {items.map((item) => (
          <div key={item.label} style={{
            background: 'var(--color-cream)',
            borderRadius: 'var(--radius-md)',
            padding: '14px',
            display: 'flex', alignItems: 'center', gap: '12px',
          }}>
            <div style={{ color: item.color }}>{item.icon}</div>
            <div>
              <div style={{ fontWeight: '700', fontSize: '1.05rem', color: 'var(--color-brown-800)' }}>{item.value}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: '600' }}>{item.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Forecast note */}
      {weather.forecast_rain_mm !== undefined && (
        <div style={{
          marginTop: '16px',
          padding: '10px 14px',
          background: 'rgba(14, 165, 233, 0.06)',
          borderLeft: '3px solid #0EA5E9',
          borderRadius: '0 var(--radius-md) var(--radius-md) 0',
          fontSize: '0.82rem',
          color: 'var(--color-text-secondary)',
        }}>
          💧 <strong>{weather.forecast_rain_mm} mm</strong> of rain expected in the next 7 days.
        </div>
      )}
    </div>
  )
}
