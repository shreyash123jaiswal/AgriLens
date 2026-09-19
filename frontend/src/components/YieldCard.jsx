import { TrendingUp } from 'lucide-react'

export default function YieldCard({ yieldData }) {
  if (!yieldData) return null

  const { predicted_tons_per_hectare, lower, upper, confidence, benchmark_tons_per_hectare, crop } = yieldData
  const improvement = benchmark_tons_per_hectare
    ? (((predicted_tons_per_hectare - benchmark_tons_per_hectare) / benchmark_tons_per_hectare) * 100).toFixed(1)
    : null

  return (
    <div className="card" style={{ padding: '22px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
        <h4 style={{ margin: 0, fontFamily: 'var(--font-heading)' }}>Yield Prediction</h4>
        <span className="badge badge-brown">🌾 {crop || 'Selected Crop'}</span>
      </div>

      {/* Main yield value */}
      <div style={{ textAlign: 'center', padding: '20px 0', borderBottom: '1px solid var(--color-cream-border)' }}>
        <div style={{ fontSize: '3rem', fontWeight: '900', color: 'var(--color-green-dark)', lineHeight: 1 }}>
          {predicted_tons_per_hectare}
        </div>
        <div style={{ color: 'var(--color-text-muted)', fontWeight: '600', marginTop: '4px' }}>tonnes / hectare</div>
        <div style={{ fontSize: '0.82rem', color: 'var(--color-text-light)', marginTop: '4px' }}>
          Range: {lower} – {upper} t/ha
        </div>
        {improvement && Number(improvement) > 0 && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '4px',
            marginTop: '10px', padding: '4px 12px',
            background: 'var(--color-green-light)', borderRadius: 'var(--radius-full)',
            fontSize: '0.8rem', fontWeight: '700', color: 'var(--color-green-dark)',
          }}>
            <TrendingUp size={13} /> {improvement}% above district average
          </div>
        )}
      </div>

      {/* Confidence */}
      <div style={{ marginTop: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--color-text-secondary)' }}>Model Confidence</span>
          <span style={{ fontSize: '0.82rem', fontWeight: '800', color: 'var(--color-green-dark)' }}>{confidence}%</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{
            width: `${confidence}%`,
            background: 'linear-gradient(90deg, var(--color-green), var(--color-green-dark))',
          }} />
        </div>
        {benchmark_tons_per_hectare && (
          <div style={{ marginTop: '8px', fontSize: '0.76rem', color: 'var(--color-text-muted)' }}>
            District benchmark: {benchmark_tons_per_hectare} t/ha
          </div>
        )}
      </div>
    </div>
  )
}
