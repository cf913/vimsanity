import { useEffect } from 'react'
import { tokens, fontMono } from '../../../design/tokens'
import { useGsap } from '../../../design/useGsap'
import { Pill, TermButton, Kbd, Stat, StatusBar } from '../../../design/primitives'
import { GridBoard } from '../level/views/GridBoard'
import { units } from '../units/registry'

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

// Honest stats derived from the real curriculum (no fabricated global numbers).
const UNIT_COUNT = units.length
const MOTION_COUNT = new Set(units.flatMap((u) => u.motionLabel.split(/\s+/))).size

export default function Hero({ onEnter, onResume, resumeLabel }: HeroProps) {
  const root = useGsap<HTMLDivElement>(({ gsap, root, reducedMotion }) => {
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

    const cta = root.querySelector('[data-cta]')
    if (cta) gsap.to(cta, { scale: 1.02, duration: 1.4, repeat: -1, yoyo: true, ease: 'sine.inOut' })
  })

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
        background: `radial-gradient(ellipse 60% 60% at 40% 30%, rgba(16,255,160,.06), transparent 70%), ${tokens.bg}`,
      }}
    >
      <div data-rain style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }} />

      {/* hero body: copy + live preview */}
      <div
        style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 0.9fr)',
          gap: 56,
          alignItems: 'center',
          padding: '56px clamp(32px, 6vw, 96px)',
          position: 'relative',
          zIndex: 2,
        }}
      >
        {/* LEFT — copy */}
        <div>
          <Pill tone="amber" style={{ marginBottom: 24 }}>
            ◣ VIMSANITY 2.0 · LEARN VIM BY PLAYING
          </Pill>

          <h1
            className="vs-glow-strong"
            style={{
              fontFamily: fontMono,
              fontWeight: 800,
              fontSize: 'clamp(48px, 8vw, 116px)',
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

          <div style={{ marginTop: 24, maxWidth: 520, fontSize: 16, lineHeight: 1.7, minHeight: 84 }}>
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

          <div data-cta style={{ marginTop: 32, display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
            <TermButton big hot onClick={onEnter}>
              ▶ Press <span style={{ margin: '0 4px', color: tokens.bg }}>i</span> to begin
            </TermButton>
            {onResume && (
              <TermButton big onClick={onResume}>
                {resumeLabel ?? 'Resume'}
              </TermButton>
            )}
          </div>

          {/* honest stats strip */}
          <div style={{ marginTop: 44, display: 'flex', gap: 40, flexWrap: 'wrap' }}>
            <Stat label="Learn units" value={UNIT_COUNT} sub="more on the way" />
            <Stat label="Motions" value={`${MOTION_COUNT}+`} tone="amber" sub="h to dd to ciw" />
            <Stat label="Mouse" value="0" tone="purple" sub="keyboard only" />
          </div>
        </div>

        {/* RIGHT — tilted live-preview window */}
        <div
          className="vs-frame-hot"
          style={{
            background: tokens.bgPanel,
            position: 'relative',
            transform: 'perspective(1400px) rotateY(-7deg) rotateX(2deg)',
            transformOrigin: 'right center',
          }}
        >
          {/* tab strip */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: tokens.bgPanel2,
              borderBottom: `1px solid ${tokens.line2}`,
              padding: '8px 12px',
              gap: 10,
              fontSize: 11,
              letterSpacing: '.12em',
              color: tokens.dim,
            }}
          >
            <span style={{ display: 'inline-flex', gap: 6 }}>
              <span style={{ width: 8, height: 8, background: tokens.red }} />
              <span style={{ width: 8, height: 8, background: tokens.amber }} />
              <span style={{ width: 8, height: 8, background: tokens.bright }} />
            </span>
            <span style={{ marginLeft: 10, padding: '4px 10px', background: tokens.bg, border: `1px solid ${tokens.line2}`, color: tokens.bright }}>
              ~/hjkl.vim
            </span>
            <span style={{ marginLeft: 'auto', color: tokens.amber }}>● live</span>
          </div>

          {/* mini play grid */}
          <div style={{ position: 'relative', padding: 24, display: 'flex', justifyContent: 'center' }}>
            <GridBoard width={8} height={6} cursor={{ x: 3, y: 2 }} target={{ x: 6, y: 4 }} cellSize={32} />
            <div style={{ position: 'absolute', top: 14, left: 14, display: 'flex', gap: 8 }}>
              <Pill tone="green">SCORE 7/10</Pill>
            </div>
            <div
              style={{
                position: 'absolute',
                bottom: 16,
                left: 14,
                right: 14,
                display: 'flex',
                gap: 6,
                alignItems: 'center',
                justifyContent: 'center',
                color: tokens.dim,
                fontSize: 12,
              }}
            >
              <Kbd hot>h</Kbd>
              <Kbd hot>j</Kbd>
              <Kbd hot>k</Kbd>
              <Kbd hot>l</Kbd>
              <span style={{ margin: '0 8px' }}>·</span>
              <span>chase the ★</span>
            </div>
          </div>
          <StatusBar mode="NORMAL" file="~/hjkl.vim" info="row 3, col 4" right={<span>vim 9.1</span>} />

          {/* GAME FEEL™ sticker */}
          <div
            className="vs-spin"
            style={{
              position: 'absolute',
              top: -22,
              right: -22,
              width: 110,
              height: 110,
              border: `2px dashed ${tokens.amber}`,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              background: tokens.bg,
            }}
          >
            <span className="vs-glow-amber" style={{ fontSize: 10, color: tokens.amber, letterSpacing: '.2em', fontWeight: 700 }}>
              NOW WITH
            </span>
            <span className="vs-glow-amber" style={{ fontSize: 20, color: tokens.amber, fontWeight: 800 }}>
              GAME
            </span>
            <span className="vs-glow-amber" style={{ fontSize: 10, color: tokens.amber, letterSpacing: '.2em', fontWeight: 700 }}>
              FEEL™
            </span>
          </div>
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
          <div key={i} style={{ padding: '20px 24px', borderRight: i < 3 ? `1px solid ${tokens.line}` : 'none' }}>
            <div style={{ fontSize: 11, color: tokens.amber, letterSpacing: '.3em', marginBottom: 6, fontWeight: 700 }}>
              {f.k}
            </div>
            <div
              className="vs-glow"
              style={{ fontSize: 15, fontWeight: 700, color: tokens.bright, letterSpacing: '.06em', marginBottom: 6 }}
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
