import { useEffect } from 'react'
import { tokens, fontMono } from '../../../design/tokens'
import { useGsap } from '../../../design/useGsap'
import { Pill, TermButton, Kbd } from '../../../design/primitives'

interface HeroProps {
  /** Primary CTA — drop the player into the game (world map / next unit). */
  onEnter: () => void
  /** Optional resume CTA with a label like "Resume · word jumps". */
  onResume?: () => void
  resumeLabel?: string
}

const FEATURES = [
  { k: '01', t: 'WORLD MAP', d: 'Navigate lessons with h j k l. The map IS the game.' },
  { k: '02', t: 'DRILL → CHECK', d: 'Learn a motion, then prove it under par.' },
  { k: '03', t: 'STREAK FIRE', d: 'A few minutes a day keeps the mouse away.' },
  { k: '04', t: 'NO MOUSE', d: 'Keyboard only. No mercy. Just :wq and chill.' },
]

const TAGLINES = [
  'A roguelike for your hands.',
  'Learn vim motions by playing, not reading.',
  'No mouse. No mercy. Just :wq and chill.',
]

export default function Hero({ onEnter, onResume, resumeLabel }: HeroProps) {
  const root = useGsap<HTMLDivElement>(({ gsap, root, reducedMotion }) => {
    // Typewriter taglines
    const lines = root.querySelectorAll<HTMLElement>('[data-typeline]')
    lines.forEach((line, i) => {
      const full = line.dataset.typeline ?? ''
      if (reducedMotion) {
        line.textContent = full
        return
      }
      line.textContent = ''
      gsap.to(
        {},
        {
          duration: full.length * 0.022,
          delay: 0.3 + i * 0.5,
          onUpdate() {
            line.textContent = full.slice(0, Math.floor(full.length * this.progress()))
          },
          onComplete() {
            line.textContent = full
          },
        },
      )
    })

    if (reducedMotion) return

    // Glyph rain in the background
    const rain = root.querySelector<HTMLElement>('[data-rain]')
    if (rain) {
      const chars = 'hjklwbe$0%fxdiapyrgu/?'.split('')
      const cols = 26
      for (let i = 0; i < cols; i++) {
        const span = document.createElement('div')
        span.textContent = chars[i % chars.length]
        span.style.cssText = `position:absolute;left:${(i / cols) * 100}%;top:-30px;font:600 14px ${fontMono};color:${tokens.dim};opacity:.4;`
        rain.appendChild(span)
        gsap.fromTo(
          span,
          { y: -30, opacity: 0 },
          {
            y: 760,
            opacity: 0.6,
            duration: 6 + (i % 5),
            repeat: -1,
            delay: (i % 8) * 0.5,
            ease: 'none',
            onRepeat() {
              span.textContent = chars[Math.floor((i * 7 + Math.floor(gsap.ticker.frame / 60)) % chars.length)]
            },
          },
        )
      }
    }

    // CTA breathe
    const cta = root.querySelector('[data-cta]')
    if (cta) gsap.to(cta, { scale: 1.02, duration: 1.4, repeat: -1, yoyo: true, ease: 'sine.inOut' })
  })

  // Keyboard: i / Enter begins, r resumes.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      if (e.key === 'i' || e.key === 'Enter') {
        e.preventDefault()
        onEnter()
      } else if (e.key === 'r' && onResume) {
        e.preventDefault()
        onResume()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onEnter, onResume])

  return (
    <div
      ref={root}
      style={{
        position: 'relative',
        minHeight: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: `radial-gradient(ellipse 60% 60% at 50% 30%, rgba(16,255,160,.06), transparent 70%), ${tokens.bg}`,
      }}
    >
      {/* glyph rain */}
      <div data-rain style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }} />

      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '64px 32px',
          position: 'relative',
          zIndex: 2,
        }}
      >
        <Pill tone="amber" style={{ marginBottom: 28 }}>
          ◣ VIMSANITY 2.0 · LEARN VIM BY PLAYING
        </Pill>

        <h1
          className="vs-glow-strong"
          style={{
            fontFamily: fontMono,
            fontWeight: 800,
            fontSize: 'clamp(56px, 11vw, 132px)',
            lineHeight: 0.92,
            color: tokens.bright,
            letterSpacing: '-.04em',
            margin: 0,
          }}
        >
          LEARN VIM
          <br />
          BY <span className="vs-glow-amber" style={{ color: tokens.amber }}>PLAY</span>
        </h1>

        <div style={{ marginTop: 28, maxWidth: 560, fontSize: 17, lineHeight: 1.7, minHeight: 90 }}>
          {TAGLINES.map((t, i) => (
            <div
              key={i}
              data-typeline={t}
              style={{ color: i === TAGLINES.length - 1 ? tokens.dim : tokens.text }}
            >
              {t}
            </div>
          ))}
        </div>

        <div
          data-cta
          style={{ marginTop: 40, display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}
        >
          <TermButton big hot onClick={onEnter}>
            ▶ Press <span style={{ margin: '0 4px', color: tokens.bg }}>i</span> to begin
          </TermButton>
          {onResume && (
            <TermButton big onClick={onResume}>
              {resumeLabel ?? 'Resume'}
            </TermButton>
          )}
        </div>
      </div>

      {/* what's in 2.0 strip */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          borderTop: `1px solid ${tokens.line2}`,
          background: tokens.bgPanel,
          position: 'relative',
          zIndex: 2,
        }}
      >
        {FEATURES.map((f, i) => (
          <div key={i} style={{ padding: '22px 24px', borderRight: i < 3 ? `1px solid ${tokens.line}` : 'none' }}>
            <div style={{ fontSize: 11, color: tokens.amber, letterSpacing: '.3em', marginBottom: 6, fontWeight: 700 }}>
              {f.k}
            </div>
            <div
              className="vs-glow"
              style={{ fontSize: 16, fontWeight: 700, color: tokens.bright, letterSpacing: '.06em', marginBottom: 6 }}
            >
              {f.t}
            </div>
            <div style={{ fontSize: 12.5, color: tokens.text, lineHeight: 1.45 }}>{f.d}</div>
          </div>
        ))}
        <div style={{ gridColumn: '1 / -1', padding: '10px 24px', borderTop: `1px solid ${tokens.line}`, color: tokens.dim, fontSize: 11, letterSpacing: '.1em', display: 'flex', gap: 14, alignItems: 'center' }}>
          <Kbd>i</Kbd> begin <span>·</span> <Kbd>r</Kbd> resume <span>·</span> keyboard only
        </div>
      </div>
    </div>
  )
}
