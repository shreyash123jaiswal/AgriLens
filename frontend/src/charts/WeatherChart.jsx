import {
  ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
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
          {p.name}: <strong>{p.value}{p.name.includes('Temp') ? '°C' : ' mm'}</strong>
        </p>
      ))}
    </div>
  )
}

export default function WeatherChart({ data }) {
  if (!data?.length) return null

  return (
    <div style={{ width: '100%', height: '220px' }}>
      <ResponsiveContainer>
        <ComposedChart data={data} margin={{ top: 10, right: 16, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-cream-border)" vertical={false} />
          <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} axisLine={false} tickLine={false} />
          <YAxis yAxisId="temp" orientation="left"  tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} axisLine={false} tickLine={false} />
          <YAxis yAxisId="rain" orientation="right" tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '0.78rem' }} />
          <Bar yAxisId="rain" dataKey="rain" name="Rainfall (mm)" fill="#0EA5E9" opacity={0.6} radius={[3, 3, 0, 0]} maxBarSize={30} />
          <Line yAxisId="temp" type="monotone" dataKey="temp" name="Temp (°C)" stroke="var(--color-orange)" strokeWidth={2.5}
            dot={{ r: 3, fill: 'var(--color-orange)', stroke: 'white', strokeWidth: 2 }} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
