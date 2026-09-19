import { AlertCircle, RefreshCw } from 'lucide-react'

export default function ErrorState({ message, onRetry }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '60px 24px',
      textAlign: 'center',
    }}>
      <div style={{
        width: '72px', height: '72px',
        borderRadius: '50%',
        background: 'var(--color-red-light)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: '20px',
      }}>
        <AlertCircle size={32} color="var(--color-red)" />
      </div>
      <h3 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-brown-800)', marginBottom: '10px' }}>
        Analysis Failed
      </h3>
      <p style={{ color: 'var(--color-text-muted)', maxWidth: '380px', marginBottom: '28px', fontSize: '0.9rem' }}>
        {message || 'Something went wrong while analyzing your farm. The system has loaded demo data so you can still explore the dashboard.'}
      </p>
      {onRetry && (
        <button className="btn btn-brown" onClick={onRetry}>
          <RefreshCw size={15} /> Try Again
        </button>
      )}
    </div>
  )
}
