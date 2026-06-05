import { tokens, fontMono } from '../../../design/tokens'
import { useGsap } from '../../../design/useGsap'
import { Pill, TermButton, PixelStar, Kbd, BlockBar } from '../../../design/primitives'
import type { Unit } from '../units/types'
import type { PlayerLevel } from '../progression'

export interface LevelResult {
  stars: number
  keystrokes: number
  /** Omitted on a revisit, where only best stars/score are known. */
  par?: number
  score: number
}

interface LevelCompleteProps {
  unit: Unit
  result: LevelResult | null
  streak: number
  nextUnit?: Unit
  replayMode: boolean
  /** Honest overworld progress (real units cleared / total). */
  cleared: number
  totalUnits: number
  /** Fewest keystrokes recorded for this unit, if any. */
  bestKeystrokes?: number
  /** Current player level (after this run is recorded). */
  player?: PlayerLevel
  /** XP added by this run (0 on a revisit / no new best). */
  xpGained?: number
  /** True when this run pushed the player to a new level. */
  leveledUp?: boolean
  onReplay: () => void
  onNext?: () => void
  onMap: () => void
}

export default function LevelComplete({
  unit,
  result,
  streak,
  nextUnit,
  replayMode,
  cleared,
  totalUnits,
  bestKeystrokes,
  player,
  xpGained = 0,
  leveledUp = false,
  onReplay,
  onNext,
  onMap,
}: LevelCompleteProps) {
  const stars = result?.stars ?? 0
  const baseScore = result ? result.stars * 1000 : 0
  const efficiencyBonus = result ? Math.max(0, result.score - baseScore) : 0

  const root = useGsap<HTMLDivElement>(({ gsap, root, reducedMotion }) => {
    if (reducedMotion) return
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
    tl.from('[data-banner]', { y: -80, scale: 1.3, opacity: 0, duration: 0.5, ease: 'back.out(2)' })
    tl.from('[data-bigstar]', { scale: 0, opacity: 0, duration: 0.4, stagger: 0.22, ease: 'back.out(3)' }, '-=.1')
    tl.from('[data-breakdown]', { x: -16, opacity: 0, duration: 0.3, stagger: 0.08 }, '<.2')
    tl.from('[data-xpfill]', { scaleX: 0, transformOrigin: 'left center', duration: 0.6, ease: 'power2.out' }, '<.1')
    tl.from('[data-levelup]', { scale: 0, opacity: 0, duration: 0.5, ease: 'back.out(3)' }, '<.1')
    // glyph confetti
    const conf = root.querySelector<HTMLElement>('[data-conf]')
    if (conf) {
      const glyphs = '★◆※·hjklwbe$'.split('')
      const colors = [tokens.bright, tokens.amber, tokens.purple, tokens.cyan]
      for (let i = 0; i < 40; i++) {
        const s = document.createElement('span')
        s.textContent = glyphs[i % glyphs.length]
        s.style.cssText = `position:absolute;left:${(i * 37) % 100}%;top:-30px;color:${colors[i % colors.length]};font:700 ${12 + (i % 5) * 3}px ${fontMono};text-shadow:0 0 6px currentColor;`
        conf.appendChild(s)
        gsap.to(s, {
          y: 700,
          x: ((i % 7) - 3) * 30,
          rotate: (i % 6) * 60,
          duration: 4 + (i % 4),
          repeat: -1,
          delay: (i % 8) * 0.4,
          ease: 'none',
        })
      }
    }
  }, [])

  const starLabels = ['SPEED', 'ACCURACY', 'FLOW']

  return (
    <div
      ref={root}
      style={{
        position: 'relative',
        minHeight: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 48,
        background: `radial-gradient(ellipse 60% 50% at 50% 30%, rgba(16,255,160,.12), transparent 60%), ${tokens.bg}`,
      }}
    >
      <div data-conf style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }} />

      <div data-banner style={{ textAlign: 'center', marginBottom: 16, position: 'relative', zIndex: 2 }}>
        <Pill tone={replayMode ? 'purple' : 'amber'} style={{ marginBottom: 14 }}>
          {replayMode ? '◢ REPLAY' : '◢ UNIT CLEARED'} · {unit.title} ◣
        </Pill>
        <h1
          className="vs-glow-strong"
          style={{
            fontFamily: fontMono,
            fontSize: 'clamp(64px, 12vw, 132px)',
            fontWeight: 800,
            letterSpacing: '-.05em',
            color: tokens.bright,
            margin: 0,
            lineHeight: 0.85,
          }}
        >
          CLEARED
        </h1>
      </div>

      {/* stars */}
      <div style={{ display: 'flex', gap: 36, marginBottom: 32, position: 'relative', zIndex: 2 }}>
        {[0, 1, 2].map((i) => (
          <div key={i} data-bigstar style={{ textAlign: 'center' }}>
            <PixelStar size={72} filled={i < stars} color={tokens.amber} />
            <div style={{ marginTop: 8, fontSize: 10, color: tokens.dim, letterSpacing: '.22em' }}>{starLabels[i]}</div>
          </div>
        ))}
      </div>

      {/* breakdown + streak */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 24,
          width: 'min(720px, 92%)',
          position: 'relative',
          zIndex: 2,
        }}
      >
        <div className="vs-frame-hot" style={{ padding: 20, background: tokens.bgPanel }}>
          <div style={{ fontSize: 11, color: tokens.dim, letterSpacing: '.3em', marginBottom: 12 }}>~/SCORE.LOG</div>
          {result ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14 }}>
              <Row
                label={`Stars · ${result.stars}/3`}
                value={`+${baseScore.toLocaleString()}`}
                color={result.stars === 3 ? tokens.bright : tokens.amber}
              />
              <Row
                label={result.par === undefined ? 'Best run bonus' : `Under-par · ${result.keystrokes} vs ${result.par}`}
                value={`+${efficiencyBonus.toLocaleString()}`}
                color={efficiencyBonus > 0 ? tokens.amber : tokens.dim}
              />
              <div data-breakdown style={{ display: 'flex', alignItems: 'baseline', gap: 14, paddingTop: 8, borderTop: `1px dashed ${tokens.line}` }}>
                <span style={{ fontSize: 11, color: tokens.dim, letterSpacing: '.3em' }}>SCORE</span>
                <span
                  className="vs-glow"
                  style={{ flex: 1, textAlign: 'right', fontFamily: fontMono, fontSize: 32, fontWeight: 800, color: tokens.bright }}
                >
                  {result.score.toLocaleString()}
                </span>
              </div>
              {bestKeystrokes !== undefined && (
                <div style={{ fontSize: 11, color: tokens.dim, letterSpacing: '.06em' }}>
                  personal best · {bestKeystrokes} keystrokes
                </div>
              )}
            </div>
          ) : (
            <div style={{ fontSize: 13, color: tokens.text }}>Drill complete — nicely done.</div>
          )}
        </div>

        <div className="vs-frame" style={{ padding: 20, background: tokens.bgPanel, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ fontSize: 11, color: tokens.dim, letterSpacing: '.3em', marginBottom: 8 }}>~/STREAK</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div className="vs-glow-amber" style={{ fontFamily: fontMono, fontSize: 54, fontWeight: 800, color: tokens.amber, lineHeight: 1 }}>
              {streak}
              <span style={{ fontSize: 18, opacity: 0.7 }}>d</span>
            </div>
            <div style={{ fontSize: 12.5, color: tokens.text, lineHeight: 1.4 }}>
              {streak > 1 ? 'Streak alive. Your mouse is jealous.' : 'Day one. Come back tomorrow to build the streak.'}
            </div>
          </div>
          <BlockBar label="Overworld" value={cleared} max={totalUnits} color={tokens.bright} style={{ marginTop: 18 }} />
        </div>
      </div>

      {/* player level + XP */}
      {player && (
        <div
          className="vs-frame"
          style={{
            marginTop: 24,
            width: 'min(720px, 92%)',
            padding: '16px 20px',
            background: tokens.bgPanel,
            position: 'relative',
            zIndex: 2,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
            <div style={{ fontSize: 11, color: tokens.dim, letterSpacing: '.3em' }}>
              ~/PLAYER · LV {player.level} · {player.title.toUpperCase()}
            </div>
            {leveledUp && (
              <span
                data-levelup
                className="vs-glow-amber"
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  letterSpacing: '.18em',
                  color: tokens.amber,
                  border: `1px solid ${tokens.amber}`,
                  padding: '3px 8px',
                }}
              >
                ▲ LEVEL UP
              </span>
            )}
            {xpGained > 0 && (
              <span className="vs-glow" style={{ marginLeft: 'auto', fontFamily: fontMono, fontWeight: 800, color: tokens.cyan }}>
                +{xpGained.toLocaleString()} XP
              </span>
            )}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: tokens.dim, letterSpacing: '.12em', marginBottom: 4 }}>
            <span>XP</span>
            <span style={{ color: tokens.cyan }}>
              {player.atMax ? player.xp.toLocaleString() : `${player.xpIntoLevel}/${player.xpForLevel}`}
            </span>
          </div>
          <div style={{ position: 'relative', height: 12, background: tokens.bgPanel2, border: `1px solid ${tokens.line}`, overflow: 'hidden' }}>
            <div
              data-xpfill
              style={{
                position: 'absolute',
                inset: 0,
                width: `${player.atMax ? 100 : player.pct}%`,
                background: `linear-gradient(90deg, ${tokens.cyan}88, ${tokens.cyan})`,
                boxShadow: `0 0 8px ${tokens.cyan}99`,
              }}
            />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: `repeating-linear-gradient(90deg, transparent 0 calc(10% - 1px), ${tokens.bg} calc(10% - 1px) 10%)`,
              }}
            />
          </div>
        </div>
      )}

      {/* NEW MOTION UNLOCKED payoff */}
      {nextUnit && !replayMode && (
        <div
          className="vs-frame-hot"
          style={{
            marginTop: 24,
            width: 'min(720px, 92%)',
            padding: '18px 24px',
            background: tokens.bgPanel,
            backgroundImage: 'linear-gradient(90deg, rgba(192,132,252,.08), transparent 60%, rgba(16,255,160,.08))',
            display: 'flex',
            alignItems: 'center',
            gap: 20,
            position: 'relative',
            zIndex: 2,
          }}
        >
          <Pill tone="purple">★ NEW MOTIONS UNLOCKED</Pill>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {nextUnit.motionLabel.split(' ').map((k, i) => (
              <Kbd key={i} hot>
                {k}
              </Kbd>
            ))}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="vs-glow" style={{ fontSize: 16, fontWeight: 800, color: tokens.bright }}>
              {nextUnit.title}
            </div>
            <div style={{ fontSize: 12.5, color: tokens.text }}>Up next on the overworld.</div>
          </div>
        </div>
      )}

      {/* actions */}
      <div style={{ marginTop: 32, display: 'flex', gap: 14, position: 'relative', zIndex: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
        <TermButton onClick={onReplay}>↻ Replay</TermButton>
        {nextUnit && (
          <TermButton hot big onClick={onNext}>
            ⏎ Next · {nextUnit.title}
          </TermButton>
        )}
        <TermButton onClick={onMap}>◀ World map</TermButton>
      </div>
      <div style={{ marginTop: 14, fontSize: 11, color: tokens.dim, letterSpacing: '.1em', position: 'relative', zIndex: 2 }}>
        <Kbd>⏎</Kbd> continue · <Kbd>r</Kbd> replay
      </div>

      {/* future: XP bar fill, level-up, dex-unlock toast hook here */}
    </div>
  )
}

function Row({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div data-breakdown style={{ display: 'flex', alignItems: 'center', gap: 14, paddingBottom: 6, borderBottom: `1px dashed ${tokens.line}` }}>
      <span style={{ flex: 1, color: tokens.text }}>{label}</span>
      <span style={{ color: color ?? tokens.text, fontWeight: 800, fontFamily: fontMono, fontSize: 15 }}>{value}</span>
    </div>
  )
}
