import { Leaf } from 'lucide-react'

export default function LoadingScreen({ message = 'Analyzing your farm…' }) {
  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(250, 247, 242, 0.95)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 999,
    }}>
      {/* Spinning ring */}
      <div style={{ position: 'relative', width: '80px', height: '80px', marginBottom: '28px' }}>
        {/* Outer ring */}
        <div style={{
          position: 'absolute', inset: 0,
          border: '3px solid var(--color-cream-border)',
          borderTopColor: 'var(--color-green)',
          borderRadius: '50%',
          animation: 'spin-slow 1s linear infinite',
        }} />
        {/* Inner ring */}
        <div style={{
          position: 'absolute', inset: '12px',
          border: '2px solid var(--color-cream-border)',
          borderBottomColor: 'var(--color-brown-400)',
          borderRadius: '50%',
          animation: 'spin-slow 0.7s linear infinite reverse',
        }} />
        {/* Center icon */}
        <div style={{
          position: 'absolute', inset: '20px',
          background: 'var(--color-green-light)',
          borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Leaf size={18} color="var(--color-green-dark)" />
        </div>
      </div>

      <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-brown-700)', marginBottom: '8px' }}>
        {message}
      </h3>
      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', maxWidth: '320px', textAlign: 'center' }}>
        Processing satellite data, weather conditions, and soil information…
      </p>

      {/* Progress dots */}
      <div style={{ display: 'flex', gap: '8px', marginTop: '24px' }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{
            width: '8px', height: '8px',
            borderRadius: '50%',
            background: 'var(--color-green)',
            animation: 'pulse-dot 1.2s ease-in-out infinite',
            animationDelay: `${i * 0.2}s`,
          }} />
        ))}
      </div>

      <style>{`
        @keyframes spin-slow { to { transform: rotate(360deg); } }
        @keyframes pulse-dot {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.4); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
