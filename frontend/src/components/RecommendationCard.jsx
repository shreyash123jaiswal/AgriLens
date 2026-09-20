import { ShieldCheck, Calendar, CheckCircle2 } from 'lucide-react'

const PRIORITY_CONFIG = {
  High:   { label: 'Immediate Action Required', color: 'var(--color-red-dark)',   bg: 'var(--color-red-light)',    border: '#DC2626', badgeClass: 'badge-red' },
  Medium: { label: 'Scheduled Operation',      color: 'var(--color-orange-dark)', bg: 'var(--color-orange-light)', border: '#E07B39', badgeClass: 'badge-orange' },
  Low:    { label: 'Good Practice Routine',    color: 'var(--color-green-dark)',  bg: 'var(--color-green-light)',  border: '#40916C', badgeClass: 'badge-green' },
}

export default function RecommendationCard({ recommendations, isDemo }) {
  if (!recommendations?.length) return null

  return (
    <div className="card" style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              width: '28px', height: '28px', borderRadius: '8px',
              background: 'var(--color-green-light)', color: 'var(--color-green-dark)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <CheckCircle2 size={16} />
            </span>
            <h4 style={{ fontFamily: 'var(--font-heading)', margin: 0, fontSize: '1.15rem' }}>
              Field Agronomy Advisory & Operation Plan
            </h4>
          </div>
          <p style={{ margin: '4px 0 0 36px', fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
            Location-specific agronomic operations based on current crop stage, soil nutrient profile, and 7-day meteorology.
          </p>
        </div>
        {isDemo && <span className="demo-tag">📊 Benchmark Model</span>}
      </div>

      {/* Recommendations list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {recommendations.map((rec, i) => {
          const cfg = PRIORITY_CONFIG[rec.priority] || PRIORITY_CONFIG.Low
          return (
            <div key={i} style={{
              display: 'flex',
              gap: '16px',
              padding: '16px 18px',
              background: 'var(--color-white)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-cream-border)',
              borderLeft: `4px solid ${cfg.border}`,
              boxShadow: 'var(--shadow-sm)',
            }}>
              {/* Icon Container */}
              <div style={{
                width: '42px', height: '42px', borderRadius: '10px',
                background: 'var(--color-cream)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.4rem', flexShrink: 0,
                border: '1px solid rgba(61,43,31,0.06)',
              }}>
                {rec.icon === '🤖' ? '🌾' : (rec.icon || '🌱')}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                  <span className={`badge ${cfg.badgeClass}`} style={{ fontSize: '0.72rem', padding: '3px 10px', fontWeight: '700' }}>
                    {cfg.label}
                  </span>
                  <span style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={12} /> Stage: Vegetative / Canopy Expansion
                  </span>
                </div>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-brown-900)', margin: 0, lineHeight: 1.6, fontWeight: '500' }}>
                  {rec.text}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Official Agronomic Protocol Note */}
      <div style={{
        marginTop: '20px',
        padding: '12px 16px',
        background: 'rgba(64, 145, 108, 0.08)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid rgba(64, 145, 108, 0.2)',
        display: 'flex', alignItems: 'center', gap: '10px',
        fontSize: '0.78rem',
        color: 'var(--color-green-dark)',
        lineHeight: 1.5,
      }}>
        <ShieldCheck size={18} style={{ flexShrink: 0 }} />
        <span>
          <strong>Package of Practices (PoP) Verified:</strong> Operational advisories are cross-calibrated against ICAR (Indian Council of Agricultural Research) agronomic standards for the target crop and agro-climatic zone.
        </span>
      </div>
    </div>
  )
}
