import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Leaf, MapPin, BarChart2, Menu, X } from 'lucide-react'
import { useState } from 'react'

export default function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const isDashboard = location.pathname === '/dashboard'

  return (
    <nav style={{
      background: 'var(--color-white)',
      borderBottom: '1px solid var(--color-cream-border)',
      boxShadow: 'var(--shadow-sm)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        height: '64px',
      }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <div style={{
            width: '36px', height: '36px',
            background: 'linear-gradient(135deg, var(--color-green-dark), var(--color-green))',
            borderRadius: '10px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Leaf size={18} color="white" />
          </div>
          <div>
            <div style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: '700',
              fontSize: '1.1rem',
              color: 'var(--color-brown-800)',
              lineHeight: 1.1,
            }}>
              AgriLens <span style={{ color: 'var(--color-green-dark)' }}>AI</span>
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', letterSpacing: '0.5px' }}>
              SMART FARM INTELLIGENCE
            </div>
          </div>
        </Link>

        {/* Desktop nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} className="desktop-nav">
          <NavLink to="/" label="Home" />
          <NavLink to="/select" label="Select Farm" icon={<MapPin size={14} />} />
          {isDashboard && <NavLink to="/dashboard" label="Dashboard" icon={<BarChart2 size={14} />} />}
          <button
            className="btn btn-primary"
            style={{ marginLeft: '8px', padding: '8px 20px', fontSize: '0.85rem' }}
            onClick={() => navigate('/select')}
          >
            <MapPin size={14} /> Analyze My Farm
          </button>
        </div>

        {/* Mobile menu button */}
        <button
          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'none', color: 'var(--color-brown-700)' }}
          className="mobile-menu-btn"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div style={{
          background: 'var(--color-white)',
          borderTop: '1px solid var(--color-cream-border)',
          padding: '16px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}>
          <Link to="/" style={{ color: 'var(--color-brown-700)', fontWeight: 600 }} onClick={() => setMenuOpen(false)}>Home</Link>
          <Link to="/select" style={{ color: 'var(--color-brown-700)', fontWeight: 600 }} onClick={() => setMenuOpen(false)}>Select Farm</Link>
          {isDashboard && <Link to="/dashboard" style={{ color: 'var(--color-brown-700)', fontWeight: 600 }} onClick={() => setMenuOpen(false)}>Dashboard</Link>}
          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => { setMenuOpen(false); navigate('/select') }}>
            Analyze My Farm
          </button>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: block !important; }
        }
      `}</style>
    </nav>
  )
}

function NavLink({ to, label, icon }) {
  const location = useLocation()
  const active = location.pathname === to
  return (
    <Link to={to} style={{
      display: 'flex', alignItems: 'center', gap: '5px',
      padding: '6px 14px',
      borderRadius: 'var(--radius-full)',
      fontWeight: active ? '700' : '600',
      fontSize: '0.85rem',
      color: active ? 'var(--color-brown-700)' : 'var(--color-text-muted)',
      background: active ? 'var(--color-cream-dark)' : 'transparent',
      transition: 'var(--transition)',
    }}>
      {icon}{label}
    </Link>
  )
}
