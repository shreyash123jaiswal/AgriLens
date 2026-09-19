import { Info } from 'lucide-react'

const PRIORITY_CONFIG = {
  High:   { color: 'var(--color-red)',          bg: 'var(--color-red-light)',    dot: '#DC2626' },
  Medium: { color: 'var(--color-orange)',        bg: 'var(--color-orange-light)', dot: '#E07B39' },
  Low:    { color: 'var(--color-green-dark)',    bg: 'var(--color-green-light)',  dot: '#40916C' },
}

export default function RecommendationCard({ recommendations, isDemo }) {
  if (!recommendations?.length) return null

  return (
    <div className="card" style={{ padding: '22px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
        <h4 style={{ fontFamily: 'var(--font-heading)', margin: 0 }}>🤖 AI Farm Advisor</h4>
        {isDemo && <span className="demo-tag">📊 Demo Data</span>}
      </div>

      {/* Recommendations list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {recommendations.map((rec, i) => {
          const cfg = PRIORITY_CONFIG[rec.priority] || PRIORITY_CONFIG.Low
          return (
            <div key={i} style={{
              display: 'flex',
              gap: '14px',
              padding: '14px 16px',
              background: 'var(--color-cream)',
              borderRadius: 'var(--radius-md)',
              borderLeft: `3px solid ${cfg.dot}`,
            }}>
              {/* Icon */}
              <div style={{ fontSize: '1.4rem', flexShrink: 0, lineHeight: 1.2 }}>{rec.icon || '💡'}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span className={`badge`} style={{ background: cfg.bg, color: cfg.color }}>
                    {rec.priority} Priority
                  </span>
                </div>
                <p style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.55 }}>
                  {rec.text}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Disclaimer */}
      <div style={{
        marginTop: '16px',
        padding: '10px 14px',
        background: 'var(--color-cream-dark)',
        borderRadius: 'var(--radius-md)',
        display: 'flex', alignItems: 'flex-start', gap: '8px',
        fontSize: '0.74rem',
        color: 'var(--color-text-muted)',
        lineHeight: 1.5,
      }}>
        <Info size={13} style={{ flexShrink: 0, marginTop: '1px' }} />
        AI recommendations are decision-support estimates and should be validated with local agricultural experts and field observations.
      </div>
    </div>
  )
}
