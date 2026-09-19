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


      {/* ===== FEATURES ===== */}
      <section className="section features-section-brown" style={{
        background: 'linear-gradient(175deg, #24150C 0%, #382416 50%, #20120A 100%)',
        position: 'relative',
        overflow: 'hidden',
        padding: '90px 24px',
      }}>
        {/* Ambient lighting glows */}
        <div style={{
          position: 'absolute', top: '-100px', left: '10%',
          width: '500px', height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(224, 123, 57, 0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '-80px', right: '8%',
          width: '450px', height: '450px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(64, 145, 108, 0.14) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <div style={{
              display: 'inline-block',
              background: 'rgba(223, 197, 160, 0.18)',
              border: '1px solid rgba(223, 197, 160, 0.35)',
              padding: '6px 20px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.75rem',
              fontWeight: '800',
              letterSpacing: '1px',
              color: '#DFC5A0',
              marginBottom: '16px',
            }}>
              FEATURES & CAPABILITIES
            </div>
            <h2 style={{ color: '#FFFFFF', fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', fontWeight: '800' }}>
              Everything your farm needs in one platform
            </h2>
            <p style={{ maxWidth: '560px', margin: '14px auto 0', color: '#D4C3B3', fontSize: '1rem', lineHeight: 1.6 }}>
              From satellite to soil to AI, AgriLens brings together every data layer your farm requires.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '20px',
          }}>
            {FEATURES.map((f) => (
              <div key={f.title} className="feature-card-dark">
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.6rem',
                  marginBottom: '16px',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                }}>
                  {f.icon}
                </div>
                <h4 style={{ marginBottom: '8px', color: '#FFFFFF', fontSize: '1.1rem', fontWeight: '700' }}>{f.title}</h4>
                <p style={{ fontSize: '0.88rem', color: '#C8B7A6', lineHeight: 1.65, margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section id="how-it-works" className="section" style={{ background: 'var(--color-cream)', borderTop: '1px solid rgba(61,43,31,0.08)' }}>
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
            gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
            gap: '16px',
            position: 'relative',
          }}>
            {HOW_IT_WORKS.map((step, i) => (
              <div key={step.step} style={{
                textAlign: 'center',
                padding: '32px 20px',
                position: 'relative',
                background: 'var(--color-white)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-cream-border)',
                boxShadow: 'var(--shadow-sm)',
              }}>
                {/* Step circle */}
                <div style={{
                  width: '68px', height: '68px',
                  borderRadius: '50%',
                  background: i === 0 ? 'var(--color-green-dark)' : 'var(--color-cream-dark)',
                  border: `2px solid ${i === 0 ? 'var(--color-green-dark)' : 'var(--color-cream-border)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 16px',
                  color: i === 0 ? 'white' : 'var(--color-brown-700)',
                }}>
                  {step.icon}
                </div>
                <div style={{ fontSize: '0.72rem', fontWeight: '800', color: 'var(--color-brown-500)', letterSpacing: '1px', marginBottom: '8px' }}>
                  STEP {step.step}
                </div>
                <h4 style={{ marginBottom: '8px', color: 'var(--color-brown-800)', fontSize: '1.08rem' }}>{step.title}</h4>
                <p style={{ fontSize: '0.86rem', color: 'var(--color-text-muted)', lineHeight: 1.65, margin: 0 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section Ends */}

      <style>{`
        .feature-card-dark {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: var(--radius-lg);
          padding: 24px;
          transition: all 0.28s cubic-bezier(0.4, 0, 0.2, 1);
          backdrop-filter: blur(8px);
        }
        .feature-card-dark:hover {
          background: rgba(255, 255, 255, 0.09);
          border-color: rgba(224, 123, 57, 0.6);
          transform: translateY(-4px);
          box-shadow: 0 16px 32px rgba(0, 0, 0, 0.35);
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.3); }
        }
      `}</style>
    </div>
  )
}
