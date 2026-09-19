import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { MapPin, BarChart2, Leaf, Cpu, CloudRain, Shield, ArrowRight, CheckCircle } from 'lucide-react'

const FEATURES = [
  {
    icon: '🛰️',
    title: 'Satellite Vegetation Analysis',
    desc: 'NDVI trends and vegetation health from satellite imagery give you a bird\'s eye view of your farm.',
  },
  {
    icon: '🌦️',
    title: 'Hyper-local Weather Intelligence',
    desc: 'Temperature, humidity, rainfall forecast, and 7-day weather data specific to your farm location.',
  },
  {
    icon: '🪱',
    title: 'Soil Profile & Nutrients',
    desc: 'pH, NPK levels, moisture, and organic carbon analysed to reveal what your soil needs most.',
  },
  {
    icon: '🌾',
    title: 'ML Crop Suitability Ranking',
    desc: 'Machine learning scores each crop against your soil, climate, and season conditions.',
  },
  {
    icon: '📈',
    title: 'Yield Prediction',
    desc: 'XGBoost-powered yield estimates in tonnes per hectare with confidence ranges and historical comparison.',
  },
  {
    icon: '⚠️',
    title: 'Risk Assessment',
    desc: 'Drought, flood, crop stress, and disease risk scores so you can act before problems escalate.',
  },
  {
    icon: '🤖',
    title: 'AI Farm Advisor',
    desc: 'Gemini AI converts all farm data into short, prioritised, actionable recommendations.',
  },
  {
    icon: '📍',
    title: 'Interactive Farm Map',
    desc: 'Draw or pin your farm boundary on a live map. Automatic area calculation included.',
  },
]

const HOW_IT_WORKS = [
  { step: '01', title: 'Select Your Farm', desc: 'Search your location and draw the farm boundary on the interactive map.', icon: <MapPin size={22} /> },
  { step: '02', title: 'Run Analysis', desc: 'Click Analyze Farm. We fetch satellite, weather, and soil data for your exact coordinates.', icon: <Cpu size={22} /> },
  { step: '03', title: 'View Intelligence', desc: 'Get a full farm report — NDVI, soil, weather, yield prediction, risks, and AI advice.', icon: <BarChart2 size={22} /> },
  { step: '04', title: 'Act Smarter', desc: 'Use prioritised recommendations to irrigate, fertilise, and manage your farm better.', icon: <Leaf size={22} /> },
]

const STATS = [
  { value: '92%', label: 'Yield Prediction Accuracy' },
  { value: '4×', label: 'Faster Farm Decisions' },
  { value: '500+', label: 'Crop Parameters Analysed' },
  { value: '100%', label: 'Free for Farmers' },
]

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div style={{ background: 'var(--color-white)', minHeight: '100vh' }}>
      <Navbar />

      {/* ===== HERO ===== */}
      <section style={{
        background: 'linear-gradient(160deg, var(--color-cream) 0%, var(--color-white) 60%, var(--color-cream-dark) 100%)',
        padding: '80px 24px 100px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative circles */}
        <div style={{
          position: 'absolute', top: '-80px', right: '-80px',
          width: '400px', height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(64,145,108,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '-60px', left: '-60px',
          width: '300px', height: '300px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,94,60,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div className="container" style={{ textAlign: 'center', position: 'relative' }}>
          {/* Eyebrow badge */}
          <div className="animate-fade-in-up" style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'var(--color-green-light)',
            border: '1px solid rgba(64,145,108,0.3)',
            padding: '6px 18px',
            borderRadius: 'var(--radius-full)',
            marginBottom: '28px',
            fontSize: '0.8rem',
            fontWeight: '700',
            color: 'var(--color-green-dark)',
            letterSpacing: '0.5px',
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-green)', display: 'inline-block', animation: 'pulse-dot 1.5s infinite' }} />
            AI-Powered Smart Agriculture
          </div>

          {/* Headline */}
          <h1 className="animate-fade-in-up delay-100" style={{ maxWidth: '780px', margin: '0 auto 20px' }}>
            See Your Land. Predict Your Yield. <span style={{ color: 'var(--color-green-dark)' }}>Grow Smarter.</span>
          </h1>

          {/* Subline */}
          <p className="animate-fade-in-up delay-200" style={{
            fontSize: 'clamp(1rem, 2vw, 1.2rem)',
            maxWidth: '620px',
            margin: '0 auto 40px',
            color: 'var(--color-text-secondary)',
            lineHeight: 1.7,
          }}>
            AgriLens combines satellite imagery, real-time weather, soil intelligence, and machine learning to give every farmer a complete, location-specific farm intelligence report.
          </p>

          {/* CTA buttons */}
          <div className="animate-fade-in-up delay-300" style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '56px' }}>
            <button
              id="cta-analyze-hero"
              className="btn btn-primary btn-lg"
              onClick={() => navigate('/select')}
            >
              <MapPin size={18} /> Analyze My Farm <ArrowRight size={16} />
            </button>
            <button
              className="btn btn-secondary btn-lg"
              onClick={() => document.getElementById('how-it-works').scrollIntoView({ behavior: 'smooth' })}
            >
              See How It Works
            </button>
          </div>

          {/* Stats row */}
          <div className="animate-fade-in-up delay-400" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: '24px',
            maxWidth: '700px',
            margin: '0 auto',
          }}>
            {STATS.map((s) => (
              <div key={s.label}>
                <div style={{ fontSize: '1.9rem', fontWeight: '900', color: 'var(--color-brown-700)', fontFamily: 'var(--font-body)' }}>{s.value}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', fontWeight: '600' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PROBLEM STATEMENT ===== */}
      <section style={{
        background: 'var(--color-brown-800)',
        padding: '72px 24px',
        color: 'white',
      }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <div style={{
            display: 'inline-block',
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.15)',
            padding: '4px 16px',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.75rem', fontWeight: '700', letterSpacing: '0.8px', marginBottom: '20px', color: 'rgba(255,255,255,0.7)',
          }}>
            THE PROBLEM
          </div>
          <h2 style={{ color: 'white', maxWidth: '700px', margin: '0 auto 20px' }}>
            Farmers make critical decisions with generic, one-size-fits-all data
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.65)', maxWidth: '580px', margin: '0 auto', lineHeight: 1.8 }}>
            District-level weather reports. Season-average soil data. No field-specific yield estimates. Farmers are left guessing on irrigation, crop choice, and fertilizer — costing yield, water, and money.
          </p>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section className="section" style={{ background: 'var(--color-cream)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <div style={{
              display: 'inline-block', background: 'var(--color-brown-100)',
              padding: '4px 16px', borderRadius: 'var(--radius-full)',
              fontSize: '0.75rem', fontWeight: '700', letterSpacing: '0.8px',
              color: 'var(--color-brown-600)', marginBottom: '16px',
            }}>
              FEATURES
            </div>
            <h2>Everything your farm needs in one platform</h2>
            <p style={{ maxWidth: '520px', margin: '12px auto 0', color: 'var(--color-text-muted)' }}>
              From satellite to soil to AI, AgriLens brings together every data layer your farm requires.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '18px',
          }}>
            {FEATURES.map((f) => (
              <div key={f.title} className="card" style={{ padding: '22px' }}>
                <div style={{ fontSize: '2rem', marginBottom: '12px' }}>{f.icon}</div>
                <h4 style={{ marginBottom: '8px', color: 'var(--color-brown-800)' }}>{f.title}</h4>
                <p style={{ fontSize: '0.87rem', color: 'var(--color-text-muted)', lineHeight: 1.65 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section id="how-it-works" className="section" style={{ background: 'var(--color-white)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <div style={{
              display: 'inline-block', background: 'var(--color-green-light)',
              padding: '4px 16px', borderRadius: 'var(--radius-full)',
              fontSize: '0.75rem', fontWeight: '700', letterSpacing: '0.8px',
              color: 'var(--color-green-dark)', marginBottom: '16px',
            }}>
              HOW IT WORKS
            </div>
            <h2>From farm boundary to actionable insight in minutes</h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '0',
            position: 'relative',
          }}>
            {HOW_IT_WORKS.map((step, i) => (
              <div key={step.step} style={{ textAlign: 'center', padding: '0 24px 40px', position: 'relative' }}>
                {/* Connector line */}
                {i < HOW_IT_WORKS.length - 1 && (
                  <div style={{
                    position: 'absolute', top: '36px', right: '-12px', zIndex: 1,
                    width: '24px', height: '2px',
                    background: 'var(--color-cream-border)',
                    display: window.innerWidth > 768 ? 'block' : 'none',
                  }} />
                )}
                {/* Step circle */}
                <div style={{
                  width: '72px', height: '72px',
                  borderRadius: '50%',
                  background: i === 0 ? 'var(--color-green-dark)' : 'var(--color-cream-dark)',
                  border: `2px solid ${i === 0 ? 'var(--color-green-dark)' : 'var(--color-cream-border)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 16px',
                  color: i === 0 ? 'white' : 'var(--color-brown-500)',
                }}>
                  {step.icon}
                </div>
                <div style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--color-brown-300)', letterSpacing: '1px', marginBottom: '6px' }}>
                  STEP {step.step}
                </div>
                <h4 style={{ marginBottom: '8px', color: 'var(--color-brown-800)' }}>{step.title}</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', lineHeight: 1.65 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA BANNER ===== */}
      <section style={{
        background: 'linear-gradient(135deg, var(--color-green-dark) 0%, var(--color-brown-700) 100%)',
        padding: '72px 24px',
        textAlign: 'center',
      }}>
        <div className="container">
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🌾</div>
          <h2 style={{ color: 'white', marginBottom: '16px' }}>
            Ready to see your farm through AI eyes?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.75)', marginBottom: '36px', maxWidth: '480px', margin: '0 auto 36px' }}>
            Select your farm on the map and get a complete intelligence report in under 30 seconds.
          </p>
          <button
            id="cta-analyze-bottom"
            className="btn"
            style={{
              background: 'white',
              color: 'var(--color-brown-700)',
              fontSize: '1.05rem',
              padding: '14px 36px',
              fontWeight: '700',
              borderRadius: 'var(--radius-full)',
            }}
            onClick={() => navigate('/select')}
          >
            <MapPin size={18} /> Start Farm Analysis <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer style={{
        background: 'var(--color-brown-900)',
        padding: '28px 24px',
        textAlign: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
          <Leaf size={16} color="var(--color-green)" />
          <span style={{ fontFamily: 'var(--font-heading)', fontWeight: '800', fontSize: '1.1rem', color: 'white' }}>
            AgriLens
          </span>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem' }}>
          Built with ❤️ by HackDevengers · Hackathon 2026 · Demo data is clearly labelled
        </p>
      </footer>

      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.3); }
        }
      `}</style>
    </div>
  )
}
