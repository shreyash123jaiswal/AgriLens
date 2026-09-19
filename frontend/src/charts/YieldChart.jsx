import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, Cell,
} from 'recharts'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'var(--color-white)', border: '1px solid var(--color-cream-border)',
      borderRadius: '8px', padding: '10px 14px', boxShadow: 'var(--shadow-md)', fontSize: '0.82rem',
    }}>
      <p style={{ fontWeight: '700', marginBottom: '6px', color: 'var(--color-brown-700)' }}>{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: <strong>{p.value} t/ha</strong>
        </p>
      ))}
    </div>
  )
}

export default function YieldChart({ data, benchmark }) {
  if (!data?.length) return null

  const chartData = data.map((d, i) => ({
    ...d,
    isEstimate: i === data.length - 1,
  }))

  return (
    <div style={{ width: '100%', height: '220px' }}>
      <ResponsiveContainer>
        <BarChart data={chartData} margin={{ top: 10, right: 16, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-cream-border)" vertical={false} />
          <XAxis dataKey="season" tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          {benchmark && (
            <ReferenceLine y={benchmark} stroke="var(--color-brown-400)" strokeDasharray="4 4"
              label={{ value: 'Benchmark', position: 'insideTopRight', fill: 'var(--color-brown-500)', fontSize: 10 }} />
          )}
          <Bar dataKey="yield" name="Yield (t/ha)" radius={[5, 5, 0, 0]} maxBarSize={50}>
            {chartData.map((entry, index) => (
              <Cell
                key={index}
                fill={entry.isEstimate ? 'var(--color-green)' : 'var(--color-brown-300)'}
                opacity={entry.isEstimate ? 1 : 0.75}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
