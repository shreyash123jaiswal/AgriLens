import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer,
} from 'recharts'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'var(--color-white)', border: '1px solid var(--color-cream-border)',
      borderRadius: '8px', padding: '10px 14px', boxShadow: 'var(--shadow-md)', fontSize: '0.82rem',
    }}>
      <p style={{ fontWeight: '700', color: 'var(--color-brown-700)', marginBottom: '4px' }}>{label}</p>
      <p style={{ color: 'var(--color-green-dark)' }}>Suitability: <strong>{payload[0].value}/100</strong></p>
    </div>
  )
}

const COLORS = ['#2D6A4F', '#40916C', '#74C69D', '#B7E4C7', '#D8F3DC']

export default function CropSuitabilityChart({ crops }) {
  if (!crops?.length) return null

  const sorted = [...crops].sort((a, b) => b.score - a.score)

  return (
    <div style={{ width: '100%', height: '220px' }}>
      <ResponsiveContainer>
        <BarChart
          layout="vertical"
          data={sorted}
          margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-cream-border)" horizontal={false} />
          <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} axisLine={false} tickLine={false} />
          <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: 'var(--color-text-secondary)', fontWeight: 600 }} axisLine={false} tickLine={false} width={60} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="score" radius={[0, 6, 6, 0]} maxBarSize={24}>
            {sorted.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
