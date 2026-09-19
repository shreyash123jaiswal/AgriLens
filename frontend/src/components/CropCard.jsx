import { CheckCircle } from 'lucide-react'

const CROP_ICONS = {
  Rice: '🌾', Maize: '🌽', Wheat: '🌿', Cotton: '🌸', Pulses: '🫘',
  Sugarcane: '🎋', Soybean: '🌱', Tomato: '🍅', Onion: '🧅',
}

export default function CropCard({ crop, rank }) {
  if (!crop) return null

  const score = crop.score || 0
  const color =
    score >= 80 ? 'var(--color-green-dark)' :
    score >= 60 ? 'var(--color-yellow-dark)' :
    'var(--color-orange)'

  const bg =
    score >= 80 ? 'var(--color-green-light)' :
    score >= 60 ? 'var(--color-yellow-light)' :
    'var(--color-orange-light)'

  return (
    <div className="card" style={{
      padding: '18px 20px',
      borderLeft: rank === 1 ? `3px solid ${color}` : '1px solid var(--color-cream-border)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Rank + icon */}
        <div style={{ flexShrink: 0 }}>
          <div style={{
            width: '44px', height: '44px',
            borderRadius: '12px',
            background: rank === 1 ? bg : 'var(--color-cream)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.5rem',
          }}>
            {CROP_ICONS[crop.name] || '🌱'}
          </div>
        </div>

        {/* Name + reasons */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontWeight: '800', fontSize: '1rem', color: 'var(--color-brown-800)' }}>
              {crop.name}
            </span>
            {rank === 1 && <span className="badge badge-green">Best Match</span>}
          </div>
          {crop.reasons?.slice(0, 2).map((r, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
              <CheckCircle size={11} style={{ color: 'var(--color-green)', flexShrink: 0 }} /> {r}
            </div>
          ))}
        </div>

        {/* Score circle */}
        <div style={{
          flexShrink: 0,
          width: '48px', height: '48px',
          borderRadius: '50%',
          background: bg,
          border: `2px solid ${color}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexDirection: 'column',
        }}>
          <span style={{ fontSize: '1rem', fontWeight: '900', color, lineHeight: 1 }}>{score}</span>
          <span style={{ fontSize: '0.5rem', color, fontWeight: '700' }}>SCORE</span>
        </div>
      </div>
    </div>
  )
}
