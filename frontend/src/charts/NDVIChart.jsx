import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer, Area, AreaChart,
} from 'recharts'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'var(--color-white)', border: '1px solid var(--color-cream-border)',
      borderRadius: '8px', padding: '10px 14px', boxShadow: 'var(--shadow-md)',
      fontSize: '0.82rem',
    }}>
      <p style={{ fontWeight: '700', marginBottom: '4px', color: 'var(--color-brown-700)' }}>{label}</p>
      <p style={{ color: 'var(--color-green-dark)' }}>NDVI: <strong>{payload[0].value}</strong></p>
    </div>
  )
}

export default function NDVIChart({ data }) {
  if (!data?.length) return null

  return (
    <div style={{ width: '100%', height: '220px' }}>
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 10, right: 16, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="ndviGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#40916C" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#40916C" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-cream-border)" vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} axisLine={false} tickLine={false} />
          <YAxis domain={[0, 1]} tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          {/* Healthy NDVI reference zone */}
          <ReferenceLine y={0.6} stroke="var(--color-green)" strokeDasharray="4 4" strokeOpacity={0.5}
            label={{ value: 'Healthy', position: 'insideTopRight', fill: 'var(--color-green)', fontSize: 10 }} />
          <Area
            type="monotone"
            dataKey="ndvi"
            stroke="var(--color-green-dark)"
            strokeWidth={2.5}
            fill="url(#ndviGrad)"
            dot={{ r: 4, fill: 'var(--color-green-dark)', stroke: 'white', strokeWidth: 2 }}
            activeDot={{ r: 6 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
