import { NavLink } from 'react-router-dom'
import { tokens } from '../design/tokens'

const tabs: Array<{ to: string; label: string }> = [
  { to: '/learn', label: 'LEARN' },
  { to: '/practice', label: 'PRACTICE' },
  { to: '/apply', label: 'APPLY' },
]

export default function WingsNav() {
  return (
    <nav
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 24px',
        borderBottom: `1px solid ${tokens.line}`,
        background: 'rgba(5,9,5,.85)',
        position: 'relative',
        zIndex: 2,
      }}
    >
      {/* wordmark */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span
          className="vs-blink"
          style={{ width: 14, height: 14, background: tokens.bright, boxShadow: `0 0 12px ${tokens.bright}` }}
        />
        <span
          className="vs-glow"
          style={{ fontSize: 14, fontWeight: 700, letterSpacing: '.32em', color: tokens.bright }}
        >
          VIMSANITY
        </span>
        <span style={{ color: tokens.dim, fontSize: 11, letterSpacing: '.12em' }}>v2.0</span>
      </div>

      {/* wing tabs */}
      <div style={{ display: 'flex', gap: 8 }}>
        {tabs.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            style={({ isActive }) => ({
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '.18em',
              padding: '6px 16px',
              borderRadius: 2,
              textDecoration: 'none',
              color: isActive ? tokens.bg : tokens.bright,
              background: isActive ? tokens.bright : 'transparent',
              border: `1px solid ${isActive ? tokens.bright : tokens.line2}`,
              boxShadow: isActive ? `0 0 16px rgba(16,255,160,.35)` : 'none',
            })}
          >
            {t.label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
