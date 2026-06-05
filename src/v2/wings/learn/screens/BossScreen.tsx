import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { tokens, fontMono } from '../../../design/tokens'
import { useGsap } from '../../../design/useGsap'
import { Kbd, Pill, TermButton, PixelStar, StatusBar, type StatusMode } from '../../../design/primitives'
import BCheckStageEdit from '../stages/BCheckStageEdit'
import { units } from '../units/registry'
import type { BEditStageDef } from '../units/types'
import type { StageTelemetry, StageResult } from '../level/types'
import { loadProgress } from '../../../state/progress'
import { loadBossRecord, recordBossWin, type BossRecord } from '../../../state/boss'
import { bossUnlocked, unitsUntilBoss, starsForKeystrokes } from '../progression'

const UNIT_IDS = units.map((u) => u.id)
const BOSS_TIME_MS = 120_000

const MOVES = ['h', 'j', 'k', 'l', 'w', 'b', 'e', '0', '$', '^']
const INSERT = ['i', 'a', 'o', 'O', 'Escape']
const EDIT = ['x', 'd', 'D', 'c', 'C']
const YANK = ['y', 'p', 'P']

// The boss gauntlet: harder refactors that combine every motion family learned.
const BOSS_STAGE: BEditStageDef = {
  kind: 'b-check-edit-puzzles',
  allowedKeys: [...MOVES, ...INSERT, ...EDIT, ...YANK],
  puzzles: [
    {
      id: 'boss-1',
      hint: 'Delete the debug line.',
      startText: 'keep\nDELETE ME\nkeep',
      startCursorIndex: 5,
      goal: { text: 'keep\nkeep' },
      par: 2, // dd
    },
    {
      id: 'boss-2',
      hint: "Drop the leading 'TODO '.",
      startText: 'TODO refactor this',
      startCursorIndex: 0,
      goal: { text: 'refactor this' },
      par: 2, // dw
    },
    {
      id: 'boss-3',
      hint: "Change 'old' to 'new'.",
      startText: 'the old way',
      startCursorIndex: 0,
      goal: { text: 'the new way' },
      par: 7, // w cw new <Esc>
    },
    {
      id: 'boss-4',
      hint: 'Duplicate the line below it.',
      startText: 'item',
      startCursorIndex: 0,
      goal: { text: 'item\nitem' },
      par: 3, // yy p
    },
    {
      id: 'boss-5',
      hint: "Duplicate 'go' inline.",
      startText: 'go fast',
      startCursorIndex: 0,
      goal: { text: 'go go fast' },
      par: 3, // yw P
    },
  ],
}

const TOTAL_PAR = BOSS_STAGE.puzzles.reduce((s, p) => s + p.par, 0)
const TOTAL_PUZZLES = BOSS_STAGE.puzzles.length

const MODE_MAP: Record<NonNullable<StageTelemetry['mode']>, StatusMode> = {
  normal: 'NORMAL',
  insert: 'INSERT',
  visual: 'VISUAL',
}

function formatClock(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000))
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

function prettyKey(k: string): string {
  if (k === ' ') return '␣'
  if (k === 'Escape') return 'Esc'
  if (k === 'Enter') return '⏎'
  return k
}

type Phase = 'fight' | 'won' | 'lost'

export default function BossScreen() {
  const navigate = useNavigate()
  const progress = useMemo(() => loadProgress(UNIT_IDS), [])
  const unlocked = bossUnlocked(progress, UNIT_IDS)

  const [phase, setPhase] = useState<Phase>('fight')
  const [stageKey, setStageKey] = useState(0)
  const [telemetry, setTelemetry] = useState<StageTelemetry | null>(null)
  const [timeLeft, setTimeLeft] = useState(BOSS_TIME_MS)
  const [result, setResult] = useState<StageResult | null>(null)
  const [record, setRecord] = useState<BossRecord>(() => loadBossRecord())
  const deadlineRef = useRef<number>(0)

  // Arm / re-arm the countdown whenever a (re)fight begins.
  useEffect(() => {
    if (phase !== 'fight') return
    deadlineRef.current = Date.now() + BOSS_TIME_MS
    setTimeLeft(BOSS_TIME_MS)
    const id = window.setInterval(() => {
      const left = deadlineRef.current - Date.now()
      if (left <= 0) {
        setTimeLeft(0)
        setPhase('lost')
      } else {
        setTimeLeft(left)
      }
    }, 200)
    return () => window.clearInterval(id)
  }, [phase, stageKey])

  function handleWin(r?: StageResult) {
    const used = BOSS_TIME_MS - (deadlineRef.current - Date.now())
    if (r) {
      setResult(r)
      setRecord(recordBossWin(r.keystrokes, Math.max(0, used)))
    }
    setPhase('won')
  }

  function retry() {
    setResult(null)
    setTelemetry(null)
    setStageKey((k) => k + 1)
    setPhase('fight')
  }

  if (!unlocked) {
    const remaining = unitsUntilBoss(progress, UNIT_IDS)
    return (
      <Centered>
        <Pill tone="dim">◢ BOSS LOCKED ◣</Pill>
        <h1 className="vs-glow" style={{ fontFamily: fontMono, fontSize: 'clamp(40px,7vw,84px)', fontWeight: 800, color: tokens.dim, margin: '12px 0' }}>
          THE REFACTOR
        </h1>
        <p style={{ fontSize: 15, color: tokens.text, maxWidth: 460, textAlign: 'center', lineHeight: 1.6 }}>
          The boss awaits once you've cleared the whole overworld. {remaining} unit{remaining === 1 ? '' : 's'} to go.
        </p>
        <TermButton big onClick={() => navigate('/learn')} style={{ marginTop: 22 }}>
          ◀ Back to map
        </TermButton>
      </Centered>
    )
  }

  if (phase === 'won' || phase === 'lost') {
    return (
      <BossOutcome
        won={phase === 'won'}
        result={result}
        record={record}
        timeUsed={BOSS_TIME_MS - timeLeft}
        onRetry={retry}
        onMap={() => navigate('/learn')}
      />
    )
  }

  // ── FIGHT ──
  const mode: StatusMode = telemetry?.mode ? MODE_MAP[telemetry.mode] : 'NORMAL'
  const keystrokes = telemetry?.keystrokes ?? 0
  const solved = telemetry ? telemetry.progress!.current - 1 : 0
  const hpPct = ((TOTAL_PUZZLES - solved) / TOTAL_PUZZLES) * 100
  const lowTime = timeLeft <= 15_000
  const hpColor = hpPct > 60 ? tokens.red : hpPct > 30 ? tokens.amber : tokens.bright

  return (
    <div style={{ position: 'relative', height: '100%', display: 'grid', gridTemplateRows: 'auto auto 1fr auto', background: tokens.bg }}>
      {/* header */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 24, alignItems: 'center', padding: '14px 28px', borderBottom: `1px solid ${tokens.line2}`, background: tokens.bgPanel }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button
            onClick={() => navigate('/learn')}
            style={{ background: 'transparent', border: `1px solid ${tokens.line2}`, color: tokens.dim, padding: '6px 10px', borderRadius: 2, cursor: 'pointer', fontFamily: fontMono, fontSize: 12 }}
          >
            ◀ MAP
          </button>
          <div>
            <div style={{ fontSize: 10, color: tokens.red, letterSpacing: '.3em' }}>◢ BOSS FIGHT</div>
            <div className="vs-glow-red" style={{ fontWeight: 800, color: tokens.red, fontSize: 18, letterSpacing: '.02em' }}>THE REFACTOR</div>
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 10, color: tokens.dim, letterSpacing: '.3em' }}>TIME</div>
          <div className={lowTime ? 'vs-glow-red' : 'vs-glow'} style={{ fontFamily: fontMono, fontSize: 34, fontWeight: 800, color: lowTime ? tokens.red : tokens.bright, lineHeight: 1 }}>
            {formatClock(timeLeft)}
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 22 }}>
          <Readout label="PAR" value={TOTAL_PAR} />
          <Readout label="KEYS" value={keystrokes} accent />
        </div>
      </div>

      {/* boss HP */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 28px', background: tokens.bgPanel, borderBottom: `1px solid ${tokens.line}` }}>
        <span className="vs-glow-red" style={{ fontSize: 26, color: tokens.red }}>※</span>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: tokens.dim, letterSpacing: '.2em', marginBottom: 4 }}>
            <span>BOSS INTEGRITY</span>
            <span style={{ color: hpColor }}>{TOTAL_PUZZLES - solved}/{TOTAL_PUZZLES}</span>
          </div>
          <div style={{ position: 'relative', height: 14, background: tokens.bgPanel2, border: `1px solid ${tokens.line}`, overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, width: `${hpPct}%`, background: `linear-gradient(90deg, ${hpColor}, ${hpColor}aa)`, boxShadow: `0 0 10px ${hpColor}`, transition: 'width .3s ease' }} />
          </div>
        </div>
      </div>

      {/* arena */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', minHeight: 0 }}>
        <div className="vs-checker" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, minHeight: 0, overflow: 'auto' }}>
          <BCheckStageEdit key={stageKey} def={BOSS_STAGE} onCompleted={handleWin} onTelemetry={setTelemetry} />
        </div>
        <div style={{ borderLeft: `1px solid ${tokens.line}`, background: tokens.bgPanel, padding: '22px 18px', display: 'flex', flexDirection: 'column', gap: 18, minHeight: 0, overflowY: 'auto' }}>
          <div>
            <div style={{ fontSize: 10, color: tokens.dim, letterSpacing: '.3em', marginBottom: 8 }}>~/ARSENAL</div>
            <div className="vs-frame" style={{ padding: 14, background: tokens.bg }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {BOSS_STAGE.allowedKeys.map((k, i) => (
                  <Kbd key={i}>{prettyKey(k)}</Kbd>
                ))}
              </div>
            </div>
          </div>
          {telemetry?.pending && (
            <div style={{ fontSize: 12, color: tokens.amber }}>
              pending <Kbd hot>{telemetry.pending}</Kbd>
            </div>
          )}
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
        file="~/boss.refactor"
        info={`puzzle ${solved + 1}/${TOTAL_PUZZLES}`}
        right={
          <>
            <span style={{ color: lowTime ? tokens.red : undefined }}>{formatClock(timeLeft)}</span>
            <span>KEYS <span style={{ color: tokens.bright }}>{keystrokes}</span></span>
            <span>PAR {TOTAL_PAR}</span>
          </>
        }
      />
    </div>
  )
}

function Readout({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div style={{ textAlign: 'right' }}>
      <div style={{ fontSize: 10, color: tokens.dim, letterSpacing: '.3em' }}>{label}</div>
      <div className={accent ? 'vs-glow' : undefined} style={{ fontFamily: fontMono, fontSize: 26, fontWeight: 800, color: accent ? tokens.bright : tokens.text, lineHeight: 1 }}>
        {value}
      </div>
    </div>
  )
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 48, background: tokens.bg }}>
      {children}
    </div>
  )
}

function BossOutcome({
  won,
  result,
  record,
  timeUsed,
  onRetry,
  onMap,
}: {
  won: boolean
  result: StageResult | null
  record: BossRecord
  timeUsed: number
  onRetry: () => void
  onMap: () => void
}) {
  const stars = won && result ? starsForKeystrokes(result.keystrokes, result.par) : 0
  const root = useGsap<HTMLDivElement>(({ gsap, reducedMotion }) => {
    if (reducedMotion) return
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
    tl.from('[data-title]', { y: -60, scale: 1.2, opacity: 0, duration: 0.5, ease: 'back.out(2)' })
    if (won) tl.from('[data-bigstar]', { scale: 0, opacity: 0, duration: 0.4, stagger: 0.2, ease: 'back.out(3)' }, '-=.1')
  }, [won])

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
        background: won
          ? `radial-gradient(ellipse 60% 50% at 50% 30%, rgba(16,255,160,.14), transparent 60%), ${tokens.bg}`
          : `radial-gradient(ellipse 60% 50% at 50% 30%, rgba(255,90,95,.14), transparent 60%), ${tokens.bg}`,
      }}
    >
      <Pill tone={won ? 'green' : 'red'} style={{ marginBottom: 14 }}>
        {won ? '◢ BOSS DEFEATED' : '◢ TIME UP'}
      </Pill>
      <h1
        data-title
        className={won ? 'vs-glow-strong' : 'vs-glow-red'}
        style={{ fontFamily: fontMono, fontSize: 'clamp(52px,11vw,120px)', fontWeight: 800, letterSpacing: '-.04em', color: won ? tokens.bright : tokens.red, margin: 0, lineHeight: 0.9 }}
      >
        {won ? 'VICTORY' : 'WIPED'}
      </h1>

      {won && (
        <>
          <div style={{ display: 'flex', gap: 30, margin: '26px 0' }}>
            {[0, 1, 2].map((i) => (
              <div key={i} data-bigstar>
                <PixelStar size={64} filled={i < stars} color={tokens.amber} />
              </div>
            ))}
          </div>
          <div className="vs-frame-hot" style={{ padding: '16px 24px', background: tokens.bgPanel, display: 'flex', gap: 32 }}>
            <Outcome label="KEYS" value={`${result?.keystrokes ?? 0}`} sub={`par ${result?.par ?? TOTAL_PAR}`} />
            <Outcome label="TIME" value={formatClock(timeUsed)} sub="this run" />
            <Outcome label="BEST" value={record.bestKeystrokes !== undefined ? `${record.bestKeystrokes}` : '—'} sub={record.bestTimeMs !== undefined ? formatClock(record.bestTimeMs) : 'keys'} accent />
          </div>
        </>
      )}
      {!won && (
        <p style={{ fontSize: 15, color: tokens.text, maxWidth: 460, textAlign: 'center', lineHeight: 1.6, marginTop: 20 }}>
          The refactor outran the clock. Trim your keystrokes and try again.
        </p>
      )}

      <div style={{ marginTop: 30, display: 'flex', gap: 14 }}>
        <TermButton hot big onClick={onRetry}>↻ {won ? 'Fight again' : 'Retry'}</TermButton>
        <TermButton big onClick={onMap}>◀ World map</TermButton>
      </div>
    </div>
  )
}

function Outcome({ label, value, sub, accent }: { label: string; value: string; sub: string; accent?: boolean }) {
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
