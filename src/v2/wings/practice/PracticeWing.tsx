import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { tokens, fontMono } from '../../design/tokens'
import { useGsap } from '../../design/useGsap'
import { Kbd, Pill, TermButton, PixelStar, StatusBar, type StatusMode } from '../../design/primitives'
import BCheckStageEdit from '../learn/stages/BCheckStageEdit'
import { starsForKeystrokes } from '../learn/progression'
import type { StageTelemetry, StageResult } from '../learn/level/types'
import { dailyPool } from './dailyPuzzles'
import { dailyIndex, dailyNumber, shareString, dailyStreak } from './daily'
import { loadDailyStore, recordDaily, solvedDates } from '../../state/daily'

const MODE_MAP: Record<NonNullable<StageTelemetry['mode']>, StatusMode> = {
  normal: 'NORMAL',
  insert: 'INSERT',
  visual: 'VISUAL',
}

function prettyKey(k: string): string {
  if (k === ' ') return '␣'
  if (k === 'Escape') return 'Esc'
  if (k === 'Enter') return '⏎'
  return k
}

export default function PracticeWing() {
  const todayISO = useMemo(() => new Date().toISOString().slice(0, 10), [])
  const idx = useMemo(() => dailyIndex(todayISO, dailyPool.length), [todayISO])
  const daily = dailyPool[idx]
  const number = dailyNumber(todayISO)
  const par = daily.stage.puzzles[0].par

  const [store, setStore] = useState(() => loadDailyStore())
  const todays = store.results[todayISO]
  const [phase, setPhase] = useState<'play' | 'done'>(todays ? 'done' : 'play')
  const [telemetry, setTelemetry] = useState<StageTelemetry | null>(null)
  const [stageKey, setStageKey] = useState(0)
  const [copied, setCopied] = useState(false)

  function handleComplete(r?: StageResult) {
    if (r) {
      const stars = starsForKeystrokes(r.keystrokes, r.par)
      setStore(recordDaily(todayISO, r.keystrokes, r.par, stars))
    }
    setPhase('done')
  }

  function replay() {
    setTelemetry(null)
    setCopied(false)
    setStageKey((k) => k + 1)
    setPhase('play')
  }

  function share() {
    const best = store.results[todayISO]
    if (!best || !navigator.clipboard) return
    navigator.clipboard.writeText(shareString(todayISO, best.keystrokes, best.par, best.stars)).then(() => {
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    })
  }

  if (phase === 'done') {
    const best = store.results[todayISO]
    const streak = dailyStreak(solvedDates(store), todayISO)
    return (
      <DailyDone
        number={number}
        theme={daily.theme}
        best={best}
        streak={streak}
        copied={copied}
        onShare={share}
        onReplay={replay}
      />
    )
  }

  // ── PLAY ──
  const mode: StatusMode = telemetry?.mode ? MODE_MAP[telemetry.mode] : 'NORMAL'
  const keystrokes = telemetry?.keystrokes ?? 0
  const overPar = keystrokes > par

  return (
    <div style={{ position: 'relative', height: '100%', display: 'grid', gridTemplateRows: 'auto 1fr auto', background: tokens.bg }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 24, alignItems: 'center', padding: '16px 28px', borderBottom: `1px solid ${tokens.line2}`, background: tokens.bgPanel }}>
        <div>
          <div style={{ fontSize: 10, color: tokens.dim, letterSpacing: '.3em' }}>~/PRACTICE · {todayISO}</div>
          <div className="vs-glow" style={{ fontWeight: 800, color: tokens.bright, fontSize: 18, letterSpacing: '.02em' }}>
            DAILY #{number} · {daily.theme}
          </div>
        </div>
        <Pill tone="amber">◆ ONE SHOT · PAR {par}</Pill>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 22, alignItems: 'center' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 10, color: tokens.dim, letterSpacing: '.3em' }}>PAR</div>
            <div style={{ fontFamily: fontMono, fontSize: 24, fontWeight: 800, color: tokens.text }}>{par}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 10, color: tokens.dim, letterSpacing: '.3em' }}>KEYS</div>
            <div className={overPar ? 'vs-glow-red' : 'vs-glow'} style={{ fontFamily: fontMono, fontSize: 28, fontWeight: 800, color: overPar ? tokens.red : tokens.bright, lineHeight: 1 }}>
              {keystrokes}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', minHeight: 0 }}>
        <div className="vs-checker" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, minHeight: 0, overflow: 'auto' }}>
          <BCheckStageEdit key={stageKey} def={daily.stage} onCompleted={handleComplete} onTelemetry={setTelemetry} />
        </div>
        <div style={{ borderLeft: `1px solid ${tokens.line}`, background: tokens.bgPanel, padding: '22px 18px', display: 'flex', flexDirection: 'column', gap: 16, minHeight: 0, overflowY: 'auto' }}>
          <div>
            <div style={{ fontSize: 10, color: tokens.dim, letterSpacing: '.3em', marginBottom: 8 }}>~/ALLOWED</div>
            <div className="vs-frame" style={{ padding: 14, background: tokens.bg }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {daily.stage.allowedKeys.map((k, i) => (
                  <Kbd key={i}>{prettyKey(k)}</Kbd>
                ))}
              </div>
            </div>
          </div>
          <div className="vs-frame" style={{ padding: 12, background: 'linear-gradient(180deg, rgba(255,181,71,.06), transparent)' }}>
            <div style={{ fontSize: 11, color: tokens.amber, letterSpacing: '.12em', fontWeight: 700, marginBottom: 4 }}>DAILY ▸</div>
            <div style={{ fontSize: 12.5, color: tokens.text, lineHeight: 1.5 }}>
              One shared puzzle a day. Beat par, keep the streak, share your score.
            </div>
          </div>
          {telemetry?.lastKey && (
            <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 10, color: tokens.dim, letterSpacing: '.2em' }}>LAST</span>
              <Kbd hot>{prettyKey(telemetry.lastKey)}</Kbd>
            </div>
          )}
        </div>
      </div>

      <StatusBar
        mode={mode}
        file={`~/daily-${number}.vim`}
        info={daily.theme.toLowerCase()}
        right={
          <>
            <span>KEYS <span style={{ color: tokens.bright }}>{keystrokes}</span></span>
            <span>PAR {par}</span>
          </>
        }
      />
    </div>
  )
}

function DailyDone({
  number,
  theme,
  best,
  streak,
  copied,
  onShare,
  onReplay,
}: {
  number: number
  theme: string
  best: { keystrokes: number; par: number; stars: number } | undefined
  streak: number
  copied: boolean
  onShare: () => void
  onReplay: () => void
}) {
  const stars = best?.stars ?? 0
  const root = useGsap<HTMLDivElement>(({ gsap, reducedMotion }) => {
    if (reducedMotion) return
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
    tl.from('[data-title]', { y: -40, opacity: 0, duration: 0.4, ease: 'back.out(2)' })
    tl.from('[data-bigstar]', { scale: 0, opacity: 0, duration: 0.35, stagger: 0.18, ease: 'back.out(3)' }, '-=.1')
  }, [])

  return (
    <div
      ref={root}
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 48,
        textAlign: 'center',
        background: `radial-gradient(ellipse 60% 50% at 50% 30%, rgba(255,181,71,.1), transparent 60%), ${tokens.bg}`,
      }}
    >
      <Pill tone="amber" style={{ marginBottom: 14 }}>◆ DAILY #{number} · {theme}</Pill>
      <h1 data-title className="vs-glow" style={{ fontFamily: fontMono, fontSize: 'clamp(44px,9vw,96px)', fontWeight: 800, color: tokens.bright, margin: 0, letterSpacing: '-.03em' }}>
        SOLVED
      </h1>

      <div style={{ display: 'flex', gap: 26, margin: '24px 0' }}>
        {[0, 1, 2].map((i) => (
          <div key={i} data-bigstar>
            <PixelStar size={58} filled={i < stars} color={tokens.amber} />
          </div>
        ))}
      </div>

      <div className="vs-frame-hot" style={{ padding: '16px 26px', background: tokens.bgPanel, display: 'flex', gap: 34 }}>
        <DoneStat label="KEYS" value={`${best?.keystrokes ?? 0}`} sub={`par ${best?.par ?? 0}`} />
        <DoneStat label="STARS" value={`${stars}/3`} sub="today" accent />
        <DoneStat label="STREAK" value={`${streak}d`} sub={streak > 0 ? 'alive' : 'start one'} />
      </div>

      <div style={{ marginTop: 28, display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
        <TermButton hot big onClick={onShare}>{copied ? '✓ Copied!' : '⧉ Share result'}</TermButton>
        <TermButton big onClick={onReplay}>↻ Replay (beat your keys)</TermButton>
        <Link to="/learn" style={{ textDecoration: 'none' }}>
          <TermButton big>◀ Learn</TermButton>
        </Link>
      </div>
      <div style={{ marginTop: 16, fontSize: 12, color: tokens.dim, letterSpacing: '.06em' }}>
        Come back tomorrow for Daily #{number + 1}.
      </div>
    </div>
  )
}

function DoneStat({ label, value, sub, accent }: { label: string; value: string; sub: string; accent?: boolean }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 10, color: tokens.dim, letterSpacing: '.3em' }}>{label}</div>
      <div className={accent ? 'vs-glow-amber' : 'vs-glow'} style={{ fontFamily: fontMono, fontSize: 26, fontWeight: 800, color: accent ? tokens.amber : tokens.bright, lineHeight: 1.1 }}>
        {value}
      </div>
      <div style={{ fontSize: 10, color: tokens.dim, marginTop: 2 }}>{sub}</div>
    </div>
  )
}
