import { Beaker } from 'lucide-react'

function NutrientBar({ label, level }) {
  const levels = { Low: 25, Medium: 55, High: 85, 'Very High': 100 }
  const pct = levels[level] || 50
  const color =
    level === 'High' || level === 'Very High' ? 'var(--color-green)' :
    level === 'Medium' ? 'var(--color-yellow)' :
    'var(--color-orange)'

  return (
    <div style={{ marginBottom: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
        <span style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--color-text-secondary)' }}>{label}</span>
        <span style={{ fontSize: '0.82rem', fontWeight: '700', color }}>{level}</span>
      </div>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  )
}

export default function SoilCard({ soil }) {
  if (!soil) return null

  const phColor =
    soil.ph >= 6.0 && soil.ph <= 7.5 ? 'var(--color-green-dark)' :
    soil.ph < 5.5 || soil.ph > 8.0   ? 'var(--color-red)'         :
    'var(--color-yellow-dark)'

  return (
    <div className="card" style={{ padding: '22px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
        <h4 style={{ margin: 0, fontFamily: 'var(--font-heading)' }}>Soil Health</h4>
        <span className="badge badge-brown">
          <Beaker size={11} /> {soil.soil_type || 'Clay Loam'}
        </span>
      </div>

      {/* pH and Moisture row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '18px' }}>
        <div style={{ textAlign: 'center', background: 'var(--color-cream)', borderRadius: 'var(--radius-md)', padding: '14px' }}>
          <div style={{ fontSize: '1.6rem', fontWeight: '900', color: phColor }}>{soil.ph}</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: '600', marginTop: '2px' }}>SOIL pH</div>
        </div>
        <div style={{ textAlign: 'center', background: 'var(--color-cream)', borderRadius: 'var(--radius-md)', padding: '14px' }}>
          <div style={{ fontSize: '1.6rem', fontWeight: '900', color: 'var(--color-brown-600)' }}>{soil.moisture}%</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: '600', marginTop: '2px' }}>MOISTURE</div>
        </div>
      </div>

      {/* NPK */}
      <div style={{ marginBottom: '4px' }}>
        <div style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>
          Nutrient Levels
        </div>
        <NutrientBar label="Nitrogen (N)" level={soil.nitrogen} />
        <NutrientBar label="Phosphorus (P)" level={soil.phosphorus} />
        <NutrientBar label="Potassium (K)" level={soil.potassium} />
      </div>

      {/* Score pill */}
      <div style={{
        marginTop: '14px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 14px',
        background: 'var(--color-cream-dark)',
        borderRadius: 'var(--radius-md)',
      }}>
        <span style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--color-text-secondary)' }}>Overall Soil Score</span>
        <span style={{ fontWeight: '800', fontSize: '1.1rem', color: 'var(--color-green-dark)' }}>{soil.score}/100</span>
      </div>
    </div>
  )
}
