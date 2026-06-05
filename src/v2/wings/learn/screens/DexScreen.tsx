import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { tokens, fontMono } from '../../../design/tokens'
import { useGsap } from '../../../design/useGsap'
import { Kbd, Pill, TermButton, BlockBar } from '../../../design/primitives'
import {
  buildDex,
  dexSummary,
  CATEGORY_LABEL,
  findUnit,
  type DexCategory,
  type DexEntry,
} from '../progression'
import { units } from '../units/registry'
import { loadProgress } from '../../../state/progress'
import { useMapNavigation, type NavNode } from './useMapNavigation'

const UNIT_IDS = units.map((u) => u.id)
const COLS = 4

const CATEGORY_COLOR: Record<DexCategory, string> = {
  move: tokens.bright,
  word: tokens.cyan,
  line: tokens.purple,
  mode: tokens.amber,
  edit: tokens.red,
  yank: tokens.hot,
  object: tokens.emerald,
}

export default function DexScreen() {
  const navigate = useNavigate()
  const progress = useMemo(() => loadProgress(UNIT_IDS), [])
  const entries = useMemo(() => buildDex(progress), [progress])
  const summary = useMemo(() => dexSummary(entries), [entries])

  const navNodes: NavNode[] = entries.map((e, i) => ({
    id: e.motion,
    c: i % COLS,
    r: Math.floor(i / COLS),
    locked: e.status === 'locked',
  }))
  const firstDiscovered = entries.find((e) => e.status !== 'locked')?.motion ?? entries[0]?.motion ?? ''

  const { selectedId, setSelectedId } = useMapNavigation({
    nodes: navNodes,
    initialId: firstDiscovered,
    onEnter: (motion) => {
      const e = entries.find((x) => x.motion === motion)
      if (e) navigate(`/learn/${e.unitId}`)
    },
    onBack: () => navigate('/learn'),
  })

  const selected = entries.find((e) => e.motion === selectedId) ?? entries[0]

  const root = useGsap<HTMLDivElement>(({ gsap, root, reducedMotion }) => {
    if (reducedMotion) return
    gsap.fromTo(
      root.querySelectorAll('[data-card]'),
      { scale: 0.6, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.32, stagger: 0.018, ease: 'back.out(2)' },
    )
  }, [])

  return (
    <div
      ref={root}
      style={{
        position: 'relative',
        height: '100%',
        display: 'grid',
        gridTemplateRows: 'auto 1fr',
        background: tokens.bg,
      }}
    >
      {/* header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 18,
          padding: '18px 28px',
          borderBottom: `1px solid ${tokens.line2}`,
          background: tokens.bgPanel,
        }}
      >
        <button
          onClick={() => navigate('/learn')}
          style={{
            background: 'transparent',
            border: `1px solid ${tokens.line2}`,
            color: tokens.dim,
            padding: '6px 10px',
            borderRadius: 2,
            cursor: 'pointer',
            fontFamily: fontMono,
            fontSize: 12,
          }}
        >
          ◀ MAP
        </button>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
          <span style={{ fontSize: 11, color: tokens.dim, letterSpacing: '.3em' }}>~/MOTION.DEX</span>
          <span className="vs-glow" style={{ fontSize: 20, fontWeight: 800, color: tokens.bright, letterSpacing: '.02em' }}>
            MOTION DEX
          </span>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 20 }}>
          <Pill tone="green">{summary.discovered}/{summary.total} discovered</Pill>
          <Pill tone="amber">★ {summary.mastered} mastered</Pill>
          <div style={{ width: 160 }}>
            <BlockBar value={summary.discovered} max={summary.total} />
          </div>
        </div>
      </div>

      {/* body: card grid + detail */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', minHeight: 0 }}>
        <div className="vs-checker" style={{ overflowY: 'auto', minHeight: 0, padding: 28 }}>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${COLS}, 1fr)`, gap: 14, maxWidth: 880, margin: '0 auto' }}>
            {entries.map((e) => (
              <DexCard
                key={e.motion}
                entry={e}
                selected={e.motion === selectedId}
                onSelect={() => setSelectedId(e.motion)}
                onOpen={() => e.status !== 'locked' && navigate(`/learn/${e.unitId}`)}
              />
            ))}
          </div>
        </div>

        {/* detail */}
        <div
          style={{
            borderLeft: `1px solid ${tokens.line}`,
            background: tokens.bgPanel,
            padding: '28px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: 18,
            minHeight: 0,
            overflowY: 'auto',
          }}
        >
          <DexDetail entry={selected} onPractice={(unitId) => navigate(`/learn/${unitId}`)} />
          <div style={{ marginTop: 'auto', fontSize: 11, color: tokens.dim, letterSpacing: '.06em', lineHeight: 1.7 }}>
            <div>
              MOVE <Kbd>h</Kbd> <Kbd>j</Kbd> <Kbd>k</Kbd> <Kbd>l</Kbd>
            </div>
            <div style={{ marginTop: 6 }}>
              PRACTICE <Kbd>⏎</Kbd> · BACK <Kbd>Esc</Kbd>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function DexCard({
  entry,
  selected,
  onSelect,
  onOpen,
}: {
  entry: DexEntry
  selected: boolean
  onSelect: () => void
  onOpen: () => void
}) {
  const locked = entry.status === 'locked'
  const mastered = entry.status === 'mastered'
  const color = CATEGORY_COLOR[entry.category]
  return (
    <button
      data-card
      onClick={onSelect}
      onDoubleClick={onOpen}
      style={{
        position: 'relative',
        textAlign: 'left',
        cursor: 'pointer',
        padding: '14px 14px 12px',
        background: locked ? tokens.bgPanel2 : 'rgba(16,255,160,.04)',
        border: `1px solid ${selected ? tokens.bright : locked ? tokens.line : tokens.line2}`,
        boxShadow: selected ? `0 0 18px rgba(16,255,160,.4)` : 'none',
        outline: 'none',
        overflow: 'hidden',
      }}
    >
      {/* category stripe */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: locked ? tokens.line : color }} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        {locked ? (
          <span style={{ fontFamily: fontMono, fontSize: 20, fontWeight: 800, color: tokens.dim }}>???</span>
        ) : (
          <Kbd hot={mastered}>{entry.motion}</Kbd>
        )}
        <span style={{ fontSize: 13, color: mastered ? tokens.amber : locked ? tokens.line2 : tokens.dim }}>
          {mastered ? '★' : locked ? '⊘' : '●'}
        </span>
      </div>
      <div
        style={{
          fontSize: 12.5,
          fontWeight: 700,
          color: locked ? tokens.dim : tokens.text,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {locked ? 'Undiscovered' : entry.name}
      </div>
      <div style={{ fontSize: 10, color: tokens.dim, letterSpacing: '.12em', marginTop: 2 }}>
        {locked ? '—' : CATEGORY_LABEL[entry.category].toUpperCase()}
      </div>
    </button>
  )
}

function DexDetail({ entry, onPractice }: { entry: DexEntry; onPractice: (unitId: string) => void }) {
  if (!entry) return null
  const locked = entry.status === 'locked'
  const color = CATEGORY_COLOR[entry.category]
  const unitTitle = findUnit(entry.unitId)?.title ?? entry.unitId
  const statusTone = entry.status === 'mastered' ? 'amber' : entry.status === 'learning' ? 'green' : 'dim'
  const statusLabel = entry.status === 'mastered' ? 'MASTERED' : entry.status === 'learning' ? 'DISCOVERED' : 'LOCKED'

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 11, color: tokens.dim, letterSpacing: '.3em' }}>~/ENTRY</span>
        <Pill tone={statusTone}>{statusLabel}</Pill>
      </div>

      <div
        className="vs-frame"
        style={{
          padding: '28px 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: tokens.bg,
        }}
      >
        <span
          className={locked ? undefined : 'vs-glow'}
          style={{ fontFamily: fontMono, fontSize: 56, fontWeight: 800, color: locked ? tokens.dim : color }}
        >
          {locked ? '???' : entry.motion}
        </span>
      </div>

      {locked ? (
        <div style={{ fontSize: 13, color: tokens.text, lineHeight: 1.6 }}>
          An undiscovered motion. Clear earlier units to reveal this entry.
        </div>
      ) : (
        <>
          <div>
            <div className="vs-glow" style={{ fontSize: 26, fontWeight: 800, color: tokens.bright, lineHeight: 1.1 }}>
              {entry.name}
            </div>
            <div style={{ marginTop: 8 }}>
              <span style={{ fontSize: 11, color, letterSpacing: '.14em', fontWeight: 700 }}>
                {CATEGORY_LABEL[entry.category].toUpperCase()}
              </span>
            </div>
          </div>
          <div style={{ fontSize: 14, color: tokens.text, lineHeight: 1.6 }}>{entry.desc}</div>
          <div className="vs-frame" style={{ padding: 12, background: tokens.bg }}>
            <div style={{ fontSize: 10, color: tokens.dim, letterSpacing: '.3em', marginBottom: 4 }}>TAUGHT IN</div>
            <div style={{ fontSize: 13, color: tokens.text }}>{unitTitle}</div>
          </div>
          <TermButton hot big onClick={() => onPractice(entry.unitId)} style={{ width: '100%' }}>
            ⏎ Practice in {unitTitle}
          </TermButton>
        </>
      )}
    </>
  )
}
