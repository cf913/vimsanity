import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { tokens, fontMono } from '../../design/tokens'
import { useGsap } from '../../design/useGsap'
import { Kbd, Pill, TermButton, PixelStar, BlockBar, StatusBar, type StatusMode } from '../../design/primitives'
import BCheckStageEdit from '../learn/stages/BCheckStageEdit'
import { starsForKeystrokes, scoreForResult } from '../learn/progression'
import type { StageTelemetry, StageResult } from '../learn/level/types'
import { missions, findMission, missionPar, type ApplyMission } from './missions'
import { applySummary } from './summary'
import { loadApplyStore, recordApply, type ApplyStore } from '../../state/apply'

const MISSION_IDS = missions.map((m) => m.id)

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

type Phase = 'select' | 'play' | 'done'

export default function ApplyWing() {
  const [store, setStore] = useState<ApplyStore>(() => loadApplyStore())
  const [phase, setPhase] = useState<Phase>('select')
  const [missionId, setMissionId] = useState<string | null>(null)
  const [telemetry, setTelemetry] = useState<StageTelemetry | null>(null)
  const [stageKey, setStageKey] = useState(0)
  const [result, setResult] = useState<{ stars: number; keystrokes: number; par: number; score: number } | null>(null)

  const mission = missionId ? findMission(missionId) : undefined
  const summary = useMemo(() => applySummary(store, MISSION_IDS), [store])

  function openMission(id: string) {
    setMissionId(id)
    setResult(null)
    setTelemetry(null)
    setStageKey((k) => k + 1)
    setPhase('play')
  }

  function handleComplete(r?: StageResult) {
    if (r && mission) {
      const stars = starsForKeystrokes(r.keystrokes, r.par)
      const score = scoreForResult(stars, r.keystrokes, r.par)
      setResult({ stars, keystrokes: r.keystrokes, par: r.par, score })
      setStore(recordApply(mission.id, stars, r.keystrokes, score))
    }
    setPhase('done')
  }

  if (phase === 'select' || !mission) {
    return <MissionSelect store={store} summary={summary} onOpen={openMission} />
  }

  if (phase === 'done') {
    const best = store.missions[mission.id]
    return (
      <MissionComplete
        mission={mission}
        result={result}
        bestKeystrokes={best?.bestKeystrokes}
        onReplay={() => openMission(mission.id)}
        onBack={() => setPhase('select')}
      />
    )
  }

  // ── PLAY ──
  const par = missionPar(mission)
  const mode: StatusMode = telemetry?.mode ? MODE_MAP[telemetry.mode] : 'NORMAL'
  const keystrokes = telemetry?.keystrokes ?? 0
  const overPar = keystrokes > par
  const progress = telemetry?.progress

  return (
    <div style={{ position: 'relative', height: '100%', display: 'grid', gridTemplateRows: 'auto 1fr auto', background: tokens.bg }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 24, alignItems: 'center', padding: '16px 28px', borderBottom: `1px solid ${tokens.line2}`, background: tokens.bgPanel }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button
            onClick={() => setPhase('select')}
            style={{ background: 'transparent', border: `1px solid ${tokens.line2}`, color: tokens.dim, padding: '6px 10px', borderRadius: 2, cursor: 'pointer', fontFamily: fontMono, fontSize: 12 }}
          >
            ◀ MISSIONS
          </button>
          <div>
            <div style={{ fontSize: 10, color: tokens.dim, letterSpacing: '.3em' }}>~/APPLY · CAPSTONE</div>
            <div className="vs-glow" style={{ fontWeight: 800, color: tokens.bright, fontSize: 18 }}>{mission.title}</div>
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          {progress && (
            <>
              <div style={{ fontSize: 10, color: tokens.dim, letterSpacing: '.3em' }}>STEP</div>
              <div className="vs-glow" style={{ fontFamily: fontMono, fontSize: 28, fontWeight: 800, color: tokens.bright, lineHeight: 1 }}>
                {progress.current}<span style={{ color: tokens.dim, fontSize: 16 }}>/{progress.total}</span>
              </div>
            </>
          )}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 22 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 10, color: tokens.dim, letterSpacing: '.3em' }}>PAR</div>
            <div style={{ fontFamily: fontMono, fontSize: 24, fontWeight: 800, color: tokens.text }}>{par}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 10, color: tokens.dim, letterSpacing: '.3em' }}>KEYS</div>
            <div className={overPar ? 'vs-glow-red' : 'vs-glow'} style={{ fontFamily: fontMono, fontSize: 28, fontWeight: 800, color: overPar ? tokens.red : tokens.bright, lineHeight: 1 }}>{keystrokes}</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', minHeight: 0 }}>
        <div className="vs-checker" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, minHeight: 0, overflow: 'auto' }}>
          <BCheckStageEdit key={stageKey} def={mission.stage} onCompleted={handleComplete} onTelemetry={setTelemetry} />
        </div>
        <div style={{ borderLeft: `1px solid ${tokens.line}`, background: tokens.bgPanel, padding: '22px 18px', display: 'flex', flexDirection: 'column', gap: 16, minHeight: 0, overflowY: 'auto' }}>
          <div>
            <div style={{ fontSize: 10, color: tokens.dim, letterSpacing: '.3em', marginBottom: 8 }}>~/MISSION</div>
            <div style={{ fontSize: 12.5, color: tokens.text, lineHeight: 1.5 }}>{mission.blurb}</div>
          </div>
          <div>
            <div style={{ fontSize: 10, color: tokens.dim, letterSpacing: '.3em', marginBottom: 8 }}>~/ALLOWED</div>
            <div className="vs-frame" style={{ padding: 14, background: tokens.bg }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {mission.stage.allowedKeys.map((k, i) => (
                  <Kbd key={i}>{prettyKey(k)}</Kbd>
                ))}
              </div>
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
        file={`~/${mission.id}.capstone`}
        info={progress ? `step ${progress.current}/${progress.total}` : undefined}
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

function MissionSelect({
  store,
  summary,
  onOpen,
}: {
  store: ApplyStore
  summary: ReturnType<typeof applySummary>
  onOpen: (id: string) => void
}) {
  const root = useGsap<HTMLDivElement>(({ gsap, root, reducedMotion }) => {
    if (reducedMotion) return
    gsap.fromTo(root.querySelectorAll('[data-card]'), { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35, stagger: 0.07, ease: 'power3.out' })
  }, [])

  return (
    <div ref={root} style={{ height: '100%', display: 'grid', gridTemplateRows: 'auto 1fr', background: tokens.bg }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 18, padding: '18px 28px', borderBottom: `1px solid ${tokens.line2}`, background: tokens.bgPanel }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
          <span style={{ fontSize: 11, color: tokens.dim, letterSpacing: '.3em' }}>~/APPLY/</span>
          <span className="vs-glow" style={{ fontSize: 20, fontWeight: 800, color: tokens.bright }}>CAPSTONE MISSIONS</span>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 18 }}>
          <Pill tone="green">{summary.cleared}/{summary.total} cleared</Pill>
          <Pill tone="amber">★ {summary.stars}/{summary.maxStars}</Pill>
          <div style={{ width: 150 }}>
            <BlockBar value={summary.stars} max={summary.maxStars} color={tokens.amber} />
          </div>
        </div>
      </div>

      <div className="vs-checker" style={{ overflowY: 'auto', minHeight: 0, padding: 32 }}>
        <p style={{ maxWidth: 720, margin: '0 auto 24px', color: tokens.text, fontSize: 14, lineHeight: 1.6, textAlign: 'center' }}>
          Apply everything you've learned to small, real refactors. Each mission is a few exact-goal
          edits — clear them under par for three stars.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18, maxWidth: 980, margin: '0 auto' }}>
          {missions.map((m) => (
            <MissionCard key={m.id} mission={m} record={store.missions[m.id]} onOpen={() => onOpen(m.id)} />
          ))}
        </div>
      </div>
    </div>
  )
}

function MissionCard({
  mission,
  record,
  onOpen,
}: {
  mission: ApplyMission
  record: ApplyStore['missions'][string] | undefined
  onOpen: () => void
}) {
  const stars = record?.stars ?? 0
  const cleared = !!record
  return (
    <button
      data-card
      onClick={onOpen}
      className={cleared ? 'vs-frame-hot' : 'vs-frame'}
      style={{ textAlign: 'left', cursor: 'pointer', padding: 20, background: tokens.bgPanel, display: 'flex', flexDirection: 'column', gap: 12 }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Pill tone={cleared ? 'green' : 'dim'}>{cleared ? 'CLEARED' : 'NEW'}</Pill>
        <span style={{ fontSize: 11, color: tokens.dim, letterSpacing: '.2em' }}>PAR {missionPar(mission)}</span>
      </div>
      <div className="vs-glow" style={{ fontSize: 20, fontWeight: 800, color: tokens.bright, lineHeight: 1.1 }}>{mission.title}</div>
      <div style={{ fontSize: 13, color: tokens.text, lineHeight: 1.5, flex: 1 }}>{mission.blurb}</div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: 3 }}>
          {[0, 1, 2].map((i) => (
            <PixelStar key={i} size={16} filled={i < stars} color={tokens.amber} />
          ))}
        </div>
        <span style={{ fontSize: 12, color: tokens.bright, fontWeight: 700 }}>
          {cleared ? '↻ Replay' : '▶ Start'} ▸
        </span>
      </div>
    </button>
  )
}

function MissionComplete({
  mission,
  result,
  bestKeystrokes,
  onReplay,
  onBack,
}: {
  mission: ApplyMission
  result: { stars: number; keystrokes: number; par: number; score: number } | null
  bestKeystrokes?: number
  onReplay: () => void
  onBack: () => void
}) {
  const stars = result?.stars ?? 0
  const root = useGsap<HTMLDivElement>(({ gsap, reducedMotion }) => {
    if (reducedMotion) return
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
    tl.from('[data-title]', { y: -40, opacity: 0, duration: 0.4, ease: 'back.out(2)' })
    tl.from('[data-bigstar]', { scale: 0, opacity: 0, duration: 0.35, stagger: 0.18, ease: 'back.out(3)' }, '-=.1')
  }, [])

  return (
    <div ref={root} style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 48, textAlign: 'center', background: `radial-gradient(ellipse 60% 50% at 50% 30%, rgba(16,255,160,.12), transparent 60%), ${tokens.bg}` }}>
      <Pill tone="green" style={{ marginBottom: 14 }}>◢ MISSION COMPLETE · {mission.title}</Pill>
      <h1 data-title className="vs-glow-strong" style={{ fontFamily: fontMono, fontSize: 'clamp(44px,9vw,100px)', fontWeight: 800, color: tokens.bright, margin: 0, letterSpacing: '-.03em' }}>
        SHIPPED
      </h1>
      <div style={{ display: 'flex', gap: 26, margin: '24px 0' }}>
        {[0, 1, 2].map((i) => (
          <div key={i} data-bigstar>
            <PixelStar size={58} filled={i < stars} color={tokens.amber} />
          </div>
        ))}
      </div>
      {result && (
        <div className="vs-frame-hot" style={{ padding: '16px 26px', background: tokens.bgPanel, display: 'flex', gap: 34 }}>
          <Stat label="KEYS" value={`${result.keystrokes}`} sub={`par ${result.par}`} />
          <Stat label="SCORE" value={result.score.toLocaleString()} sub="this run" accent />
          <Stat label="BEST" value={bestKeystrokes !== undefined ? `${bestKeystrokes}` : '—'} sub="fewest keys" />
        </div>
      )}
      <div style={{ marginTop: 28, display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
        <TermButton hot big onClick={onReplay}>↻ Replay</TermButton>
        <TermButton big onClick={onBack}>◀ Missions</TermButton>
        <Link to="/learn" style={{ textDecoration: 'none' }}>
          <TermButton big>Learn</TermButton>
        </Link>
      </div>
    </div>
  )
}

function Stat({ label, value, sub, accent }: { label: string; value: string; sub: string; accent?: boolean }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 10, color: tokens.dim, letterSpacing: '.3em' }}>{label}</div>
      <div className={accent ? 'vs-glow-amber' : 'vs-glow'} style={{ fontFamily: fontMono, fontSize: 26, fontWeight: 800, color: accent ? tokens.amber : tokens.bright, lineHeight: 1.1 }}>{value}</div>
      <div style={{ fontSize: 10, color: tokens.dim, marginTop: 2 }}>{sub}</div>
    </div>
  )
}
