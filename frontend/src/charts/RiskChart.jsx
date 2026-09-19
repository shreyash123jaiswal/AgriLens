import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip,
} from 'recharts'

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'var(--color-white)', border: '1px solid var(--color-cream-border)',
      borderRadius: '8px', padding: '10px 14px', boxShadow: 'var(--shadow-md)', fontSize: '0.82rem',
    }}>
      <p style={{ fontWeight: '700', color: 'var(--color-brown-700)' }}>{payload[0].payload.risk}</p>
      <p style={{ color: 'var(--color-orange)' }}>Risk Score: <strong>{payload[0].value}%</strong></p>
    </div>
  )
}

export default function RiskChart({ risks }) {
  if (!risks) return null

  const labels = {
    drought: 'Drought',
    flood: 'Flood',
    crop_stress: 'Crop Stress',
    disease_pest: 'Disease & Pest',
  }

  const data = Object.entries(risks).map(([key, val]) => ({
    risk: labels[key] || key,
    score: val.score,
  }))

  return (
    <div style={{ width: '100%', height: '220px' }}>
      <ResponsiveContainer>
        <RadarChart data={data}>
          <PolarGrid stroke="var(--color-cream-border)" />
          <PolarAngleAxis dataKey="risk" tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }} />
          <Tooltip content={<CustomTooltip />} />
          <Radar
            dataKey="score"
            stroke="var(--color-orange)"
            fill="var(--color-orange)"
            fillOpacity={0.25}
            strokeWidth={2}
            dot={{ r: 4, fill: 'var(--color-orange)', stroke: 'white', strokeWidth: 2 }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}
