import { AlertTriangle, CheckCircle, Info } from 'lucide-react'

const RISK_CONFIG = {
  drought:      { label: 'Drought Risk',      icon: '🌵', emoji: true },
  flood:        { label: 'Flood Risk',        icon: '🌊', emoji: true },
  crop_stress:  { label: 'Crop Stress',       icon: '🌡️', emoji: true },
  disease_pest: { label: 'Disease & Pest',    icon: '🐛', emoji: true },
}

function RiskLevel({ score }) {
  if (score >= 70) return { label: 'High',     color: 'var(--color-red)',          bg: 'var(--color-red-light)',    badgeClass: 'badge-red' }
  if (score >= 45) return { label: 'Moderate', color: 'var(--color-orange)',       bg: 'var(--color-orange-light)', badgeClass: 'badge-orange' }
  return               { label: 'Low',      color: 'var(--color-green-dark)',   bg: 'var(--color-green-light)', badgeClass: 'badge-green' }
}

function RiskItem({ riskKey, riskData }) {
  if (!riskData) return null
  const cfg = RISK_CONFIG[riskKey] || { label: riskKey, icon: '⚠️' }
  const level = RiskLevel(riskData.score)
  const BarIcon = riskData.score >= 70 ? AlertTriangle : riskData.score <= 35 ? CheckCircle : Info

  return (
    <div style={{
      padding: '16px 18px',
      background: 'var(--color-white)',
      border: `1px solid var(--color-cream-border)`,
      borderLeft: `3px solid ${level.color}`,
      borderRadius: 'var(--radius-md)',
      marginBottom: '10px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '1.2rem' }}>{cfg.icon}</span>
          <span style={{ fontWeight: '700', color: 'var(--color-brown-800)', fontSize: '0.9rem' }}>{cfg.label}</span>
        </div>
        <span className={`badge ${level.badgeClass}`}>
          {level.label} ({riskData.score}%)
        </span>
      </div>

      {/* Progress bar */}
      <div className="progress-bar" style={{ height: '6px', marginBottom: '8px' }}>
        <div className="progress-fill" style={{ width: `${riskData.score}%`, background: level.color }} />
      </div>

      {/* Explanation */}
      <div style={{ display: 'flex', gap: '6px', fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
        <BarIcon size={13} style={{ color: level.color, flexShrink: 0, marginTop: '1px' }} />
        {riskData.explanation}
      </div>
    </div>
  )
}

export default function RiskCard({ risks }) {
  if (!risks) return null

  return (
    <div className="card" style={{ padding: '22px' }}>
      <h4 style={{ fontFamily: 'var(--font-heading)', marginBottom: '16px' }}>Risk Assessment</h4>
      {Object.entries(risks).map(([key, data]) => (
        <RiskItem key={key} riskKey={key} riskData={data} />
      ))}
    </div>
  )
}
