import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

/**
 * KPI stat card with icon, value, label and optional trend indicator
 */
export default function StatCard({ icon, label, value, unit, trend, trendLabel, color, bg, subtitle }) {
  const trendColor =
    trend === 'up'   ? 'var(--color-green-dark)' :
    trend === 'down' ? 'var(--color-red)'         :
    'var(--color-text-muted)'

  const TrendIcon =
    trend === 'up'   ? TrendingUp  :
    trend === 'down' ? TrendingDown :
    Minus

  return (
    <div className="card" style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Icon + label row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{
          width: '40px', height: '40px',
          borderRadius: '10px',
          background: bg || 'var(--color-cream-dark)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: color || 'var(--color-brown-600)',
          fontSize: '1.2rem',
        }}>
          {icon}
        </div>
        {trend && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: trendColor, fontSize: '0.75rem', fontWeight: '700' }}>
            <TrendIcon size={13} />
            {trendLabel}
          </div>
        )}
      </div>

      {/* Value */}
      <div>
        <div style={{
          fontSize: '1.9rem',
          fontWeight: '900',
          color: color || 'var(--color-brown-800)',
          lineHeight: 1,
          fontFamily: 'var(--font-body)',
        }}>
          {value}
          {unit && <span style={{ fontSize: '0.95rem', fontWeight: '600', marginLeft: '4px', color: 'var(--color-text-muted)' }}>{unit}</span>}
        </div>
        <div style={{ marginTop: '4px', fontSize: '0.82rem', fontWeight: '600', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {label}
        </div>
        {subtitle && (
          <div style={{ marginTop: '4px', fontSize: '0.78rem', color: 'var(--color-text-light)' }}>
            {subtitle}
          </div>
        )}
      </div>
    </div>
  )
}
