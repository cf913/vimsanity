import { useMemo } from 'react'
import { tokens, fontMono } from '../../../design/tokens'
import { useGsap } from '../../../design/useGsap'
import { Pill, TermButton, Kbd, CursorSprite, PixelStar, Stat, BlockBar } from '../../../design/primitives'
import {
  orderedNodes,
  pathEdges,
  futureNodes,
  playerLevel,
  computeBadges,
  activeStreakDays,
  recentDays,
  type Badge,
} from '../progression'
import { getUnitProgress } from '../../../state/progress'
import type { Progress } from '../../../state/types'
import { useMapNavigation, type NavNode } from './useMapNavigation'

type NodeStatus = 'locked' | 'ready' | 'current' | 'done'

interface WorldMapProps {
  progress: Progress
  onEnterUnit: (unitId: string) => void
  onBack?: () => void
}

function statusOf(progress: Progress, unitId: string): NodeStatus {
  const up = getUnitProgress(progress, unitId)
  if (up.bStatus === 'completed') return 'done'
  if (up.aStatus === 'locked') return 'locked'
  return 'ready'
}

export default function WorldMap({ progress, onEnterUnit, onBack }: WorldMapProps) {
  const nodes = useMemo(() => orderedNodes(), [])
  const edges = useMemo(() => pathEdges(), [])

  // The "current" node = first non-completed, non-locked unit.
  const currentId = useMemo(() => {
    const cur = nodes.find((n) => statusOf(progress, n.unit.id) !== 'done' && statusOf(progress, n.unit.id) !== 'locked')
    return cur?.unit.id ?? nodes[0]?.unit.id ?? ''
  }, [nodes, progress])

  // Layout grid (units + future decorative nodes).
  const allCoords = [...nodes.map((n) => n.meta.node), ...futureNodes]
  const cols = Math.max(...allCoords.map((c) => c.c)) + 1
  const rows = Math.max(...allCoords.map((c) => c.r)) + 1
  const left = (c: number) => ((c + 0.5) / cols) * 100
  const top = (r: number) => ((r + 0.5) / rows) * 100

  // Navigation nodes (units playable, boss locked).
  const navNodes: NavNode[] = [
    ...nodes.map((n) => ({
      id: n.unit.id,
      c: n.meta.node.c,
      r: n.meta.node.r,
      locked: statusOf(progress, n.unit.id) === 'locked',
    })),
    ...futureNodes.map((f) => ({ id: f.id, c: f.c, r: f.r, locked: true })),
  ]

  const { selectedId, setSelectedId } = useMapNavigation({
    nodes: navNodes,
    initialId: currentId,
    onEnter: onEnterUnit,
    onBack,
  })

  const root = useGsap<HTMLDivElement>(({ gsap, root, reducedMotion }) => {
    if (reducedMotion) return
    gsap.fromTo(
      root.querySelectorAll('[data-node]'),
      { scale: 0, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.4, stagger: 0.05, ease: 'back.out(2)' },
    )
    root.querySelectorAll<SVGElement>('[data-path]').forEach((p, i) => {
      gsap.fromTo(p, { strokeDashoffset: 0 }, { strokeDashoffset: -24, duration: 3, repeat: -1, ease: 'none', delay: i * 0.1 })
    })
  }, [])

  const selectedUnit = nodes.find((n) => n.unit.id === selectedId)
  const selectedFuture = futureNodes.find((f) => f.id === selectedId)
  const completedCount = nodes.filter((n) => statusOf(progress, n.unit.id) === 'done').length
  const totalStars = nodes.reduce((s, n) => s + (getUnitProgress(progress, n.unit.id).stars ?? 0), 0)

  // Honest player progression derived from persisted scores/stars/streak.
  const player = useMemo(() => playerLevel(progress), [progress])
  const unitIds = useMemo(() => nodes.map((n) => n.unit.id), [nodes])
  const badges = useMemo(() => computeBadges(progress, unitIds), [progress, unitIds])
  const earnedCount = badges.filter((b) => b.earned).length
  const todayISO = new Date().toISOString().slice(0, 10)
  const streakSet = useMemo(() => new Set(activeStreakDays(progress.streak, todayISO)), [progress.streak, todayISO])
  const calendarDays = useMemo(() => recentDays(todayISO, 14), [todayISO])

  return (
    <div
      ref={root}
      style={{
        position: 'relative',
        minHeight: '100%',
        display: 'grid',
        gridTemplateColumns: '300px 1fr 340px',
        background: tokens.bg,
      }}
    >
      {/* LEFT — player panel */}
      <div
        style={{
          borderRight: `1px solid ${tokens.line}`,
          padding: '28px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: 22,
          background: tokens.bgPanel,
          overflowY: 'auto',
        }}
      >
        {/* level + title */}
        <div>
          <div style={{ fontSize: 11, color: tokens.dim, letterSpacing: '.3em', marginBottom: 10 }}>~/PLAYER</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              className="vs-frame"
              style={{
                width: 56,
                height: 56,
                flex: '0 0 auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: tokens.bg,
              }}
            >
              <CursorSprite size={36} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div className="vs-glow" style={{ fontSize: 18, fontWeight: 800, color: tokens.bright, lineHeight: 1.15 }}>
                {player.title}
              </div>
              <div style={{ fontSize: 11, color: tokens.dim, letterSpacing: '.12em', marginTop: 3 }}>
                LEVEL {player.level}
                {player.atMax && <span style={{ color: tokens.amber }}> · MAX</span>}
              </div>
            </div>
          </div>
          <div style={{ marginTop: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: tokens.dim, letterSpacing: '.12em', marginBottom: 4 }}>
              <span>XP</span>
              <span style={{ color: tokens.cyan }}>
                {player.atMax ? player.xp.toLocaleString() : `${player.xpIntoLevel}/${player.xpForLevel}`}
              </span>
            </div>
            <BlockBar value={player.atMax ? 1 : player.xpIntoLevel} max={player.atMax ? 1 : player.xpForLevel} color={tokens.cyan} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 18 }}>
          <Stat label="Cleared" value={`${completedCount}/${nodes.length}`} />
          <Stat label="Stars" value={totalStars} tone="amber" />
        </div>

        {/* overworld progress (honest: units cleared) */}
        <BlockBar label="Overworld" value={completedCount} max={nodes.length} />

        {/* badges */}
        <div>
          <div style={{ fontSize: 10, color: tokens.dim, letterSpacing: '.3em', marginBottom: 8 }}>
            ★ BADGES · {earnedCount}/{badges.length}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
            {badges.map((b) => (
              <BadgeChip key={b.id} badge={b} />
            ))}
          </div>
        </div>

        {/* streak calendar (honest: the active run as of today) */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div className="vs-glow-amber" style={{ fontSize: 30, color: tokens.amber, fontWeight: 800, lineHeight: 1 }}>
              {streakSet.size}
              <span style={{ fontSize: 13, opacity: 0.7 }}>d</span>
            </div>
            <div style={{ fontSize: 11, color: tokens.dim, letterSpacing: '.1em' }}>
              <div style={{ color: tokens.amber }}>{streakSet.size > 0 ? 'STREAK ALIVE' : 'NO STREAK YET'}</div>
              <div>finish a unit today</div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(14,1fr)', gap: 3, marginTop: 12 }}>
            {calendarDays.map((d) => {
              const filled = streakSet.has(d)
              const isToday = d === todayISO
              return (
                <div
                  key={d}
                  title={d}
                  style={{
                    aspectRatio: '1',
                    background: filled ? tokens.amber : tokens.bgPanel2,
                    border: `1px solid ${filled ? tokens.amber : isToday ? tokens.line2 : tokens.line}`,
                  }}
                />
              )
            })}
          </div>
        </div>

        <div style={{ marginTop: 'auto', fontSize: 11, color: tokens.dim, letterSpacing: '.06em', lineHeight: 1.6 }}>
          <div>
            MOVE <Kbd>h</Kbd> <Kbd>j</Kbd> <Kbd>k</Kbd> <Kbd>l</Kbd>
          </div>
          <div style={{ marginTop: 8 }}>
            ENTER <Kbd>⏎</Kbd> · the map IS practice
          </div>
        </div>
      </div>

      {/* CENTER — the map */}
      <div className="vs-checker" style={{ position: 'relative', overflow: 'hidden' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '18px 28px',
            borderBottom: `1px solid ${tokens.line}`,
            background: 'rgba(5,9,5,.85)',
            position: 'relative',
            zIndex: 3,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
            <span style={{ fontSize: 11, color: tokens.dim, letterSpacing: '.3em' }}>~/WORLDS/</span>
            <span className="vs-glow" style={{ fontSize: 20, fontWeight: 800, color: tokens.bright, letterSpacing: '.02em' }}>
              LEARN OVERWORLD
            </span>
          </div>
          <Pill tone="dim">
            {completedCount}/{nodes.length} cleared
          </Pill>
        </div>

        {/* the board */}
        <div style={{ position: 'absolute', inset: 0, top: 60 }}>
          {/* dashed paths */}
          <svg
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }}
            viewBox={`0 0 ${cols} ${rows}`}
            preserveAspectRatio="none"
          >
            {edges.map(([a, b], i) => {
              const A = nodes.find((n) => n.unit.id === a)!.meta.node
              const B = nodes.find((n) => n.unit.id === b)!.meta.node
              const targetLocked = statusOf(progress, b) === 'locked'
              return (
                <line
                  key={i}
                  data-path
                  x1={A.c + 0.5}
                  y1={A.r + 0.5}
                  x2={B.c + 0.5}
                  y2={B.r + 0.5}
                  stroke={targetLocked ? tokens.line : tokens.line2}
                  strokeWidth={2}
                  strokeDasharray="6 6"
                  vectorEffect="non-scaling-stroke"
                />
              )
            })}
          </svg>

          {/* unit nodes */}
          {nodes.map(({ unit, meta }) => {
            const status = statusOf(progress, unit.id)
            const isCurrent = unit.id === currentId
            const isSelected = unit.id === selectedId
            const stars = getUnitProgress(progress, unit.id).stars ?? 0
            const bg =
              status === 'locked' ? tokens.bgPanel : status === 'done' ? 'rgba(16,255,160,.1)' : isCurrent ? tokens.bright : 'rgba(16,255,160,.06)'
            const bd = status === 'locked' ? tokens.line : isCurrent ? tokens.bright : tokens.line2
            const fg = status === 'locked' ? tokens.dim : isCurrent ? tokens.bg : tokens.bright
            return (
              <button
                key={unit.id}
                data-node
                onClick={() => setSelectedId(unit.id)}
                onDoubleClick={() => status !== 'locked' && onEnterUnit(unit.id)}
                style={{
                  position: 'absolute',
                  left: `${left(meta.node.c)}%`,
                  top: `${top(meta.node.r)}%`,
                  transform: 'translate(-50%, -50%)',
                  zIndex: 2,
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                <div style={{ position: 'relative', width: 52, height: 52, margin: '0 auto' }}>
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      background: bg,
                      border: `2px solid ${bd}`,
                      boxShadow: isSelected ? `0 0 22px ${isCurrent ? tokens.bright : tokens.line2}` : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: fg,
                      fontFamily: fontMono,
                      fontWeight: 800,
                      fontSize: 16,
                    }}
                  >
                    {status === 'locked' ? '·' : status === 'done' ? '✓' : nodes.findIndex((n) => n.unit.id === unit.id) + 1}
                  </div>
                  {/* selection ring */}
                  {isSelected && (
                    <div
                      style={{
                        position: 'absolute',
                        inset: -6,
                        border: `2px solid ${tokens.bright}`,
                        boxShadow: `0 0 18px rgba(16,255,160,.5)`,
                        pointerEvents: 'none',
                      }}
                    />
                  )}
                </div>
                <div style={{ marginTop: 8, textAlign: 'center', whiteSpace: 'nowrap' }}>
                  <div
                    className={isCurrent ? 'vs-glow' : undefined}
                    style={{
                      fontSize: 11,
                      color: status === 'locked' ? tokens.dim : isCurrent ? tokens.bright : tokens.text,
                      fontWeight: isCurrent ? 700 : 500,
                    }}
                  >
                    {unit.title}
                  </div>
                  <div style={{ fontSize: 10, color: tokens.dim, marginTop: 2 }}>{unit.motionLabel}</div>
                  {status === 'done' && (
                    <div style={{ display: 'flex', gap: 2, justifyContent: 'center', marginTop: 4 }}>
                      {[0, 1, 2].map((i) => (
                        <PixelStar key={i} size={10} filled={i < stars} color={tokens.amber} />
                      ))}
                    </div>
                  )}
                </div>
              </button>
            )
          })}

          {/* future (boss) nodes */}
          {futureNodes.map((f) => {
            const isSelected = f.id === selectedId
            return (
              <button
                key={f.id}
                data-node
                onClick={() => setSelectedId(f.id)}
                style={{
                  position: 'absolute',
                  left: `${left(f.c)}%`,
                  top: `${top(f.r)}%`,
                  transform: 'translate(-50%, -50%)',
                  zIndex: 2,
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                <div style={{ position: 'relative', width: 52, height: 52, margin: '0 auto' }}>
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      background: 'rgba(255,181,71,.12)',
                      border: `2px solid ${tokens.amber}`,
                      transform: 'rotate(45deg)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: isSelected ? `0 0 22px ${tokens.amber}` : 'none',
                    }}
                  >
                    <span style={{ transform: 'rotate(-45deg)', color: tokens.amber, fontWeight: 800 }}>※</span>
                  </div>
                </div>
                <div style={{ marginTop: 10, textAlign: 'center', whiteSpace: 'nowrap' }}>
                  <div className="vs-glow-amber" style={{ fontSize: 11, color: tokens.amber, fontWeight: 700 }}>
                    {f.label}
                  </div>
                  <div style={{ fontSize: 10, color: tokens.dim, marginTop: 2 }}>soon™</div>
                </div>
              </button>
            )
          })}

          {/* fog-of-war over the locked frontier (upper-right) */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              zIndex: 1,
              background:
                'radial-gradient(ellipse 55% 60% at 85% 15%, rgba(5,9,5,.82) 10%, rgba(5,9,5,.4) 45%, transparent 70%)',
            }}
          />

          {/* compass / position readout */}
          <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 3 }}>
            <div className="vs-frame" style={{ padding: '8px 12px', background: 'rgba(5,9,5,.85)' }}>
              <div style={{ fontSize: 10, color: tokens.dim, letterSpacing: '.2em', marginBottom: 2 }}>POS</div>
              <div style={{ color: tokens.bright, fontWeight: 700, fontSize: 13, letterSpacing: '.04em' }}>
                {selectedUnit
                  ? `${nodes.findIndex((n) => n.unit.id === selectedUnit.unit.id) + 1} · ${selectedUnit.unit.id}`
                  : (selectedFuture?.label ?? '—')}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT — selected-node detail */}
      <div
        style={{
          borderLeft: `1px solid ${tokens.line}`,
          padding: '28px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
          background: tokens.bgPanel,
        }}
      >
        {selectedUnit ? (
          <SelectedUnitPanel
            title={selectedUnit.unit.title}
            motionLabel={selectedUnit.unit.motionLabel}
            blurb={selectedUnit.meta.blurb}
            rewardBlurb={selectedUnit.meta.rewardBlurb}
            status={statusOf(progress, selectedUnit.unit.id)}
            stars={getUnitProgress(progress, selectedUnit.unit.id).stars ?? 0}
            onEnter={() => onEnterUnit(selectedUnit.unit.id)}
          />
        ) : selectedFuture ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Pill tone="amber">COMING SOON</Pill>
            <div className="vs-glow-amber" style={{ fontSize: 28, fontWeight: 800, color: tokens.amber }}>
              {selectedFuture.label}
            </div>
            <div style={{ fontSize: 13, color: tokens.text, lineHeight: 1.6 }}>
              Boss runs — refactor a real file against the clock — land in a future update. Clear the overworld to be ready.
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}

function BadgeChip({ badge }: { badge: Badge }) {
  const { earned, icon, label, desc, progress } = badge
  const tip = earned ? `${label} — ${desc}` : `${label} — ${desc} (${progress?.current ?? 0}/${progress?.target ?? 0})`
  return (
    <div
      title={tip}
      className={earned ? 'vs-frame-hot' : 'vs-frame'}
      style={{
        aspectRatio: '1',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: earned ? 'rgba(255,181,71,.1)' : tokens.bgPanel2,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <span
        className={earned ? 'vs-glow-amber' : undefined}
        style={{
          fontSize: 18,
          fontWeight: 800,
          color: earned ? tokens.amber : tokens.dim,
          opacity: earned ? 1 : 0.5,
          lineHeight: 1,
        }}
      >
        {icon}
      </span>
      {!earned && progress && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            bottom: 0,
            height: 3,
            width: `${(progress.current / progress.target) * 100}%`,
            background: tokens.line2,
          }}
        />
      )}
    </div>
  )
}

function SelectedUnitPanel(props: {
  title: string
  motionLabel: string
  blurb: string
  rewardBlurb?: string
  status: NodeStatus
  stars: number
  onEnter: () => void
}) {
  const { title, motionLabel, blurb, rewardBlurb, status, stars, onEnter } = props
  const locked = status === 'locked'
  const tone = status === 'done' ? 'green' : status === 'locked' ? 'dim' : 'amber'
  const label = status === 'done' ? 'CLEARED' : status === 'locked' ? 'LOCKED' : 'READY'
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 11, color: tokens.dim, letterSpacing: '.3em' }}>~/SELECTED</span>
        <Pill tone={tone}>{label}</Pill>
      </div>

      <div>
        <div className="vs-glow" style={{ fontSize: 30, fontWeight: 800, color: tokens.bright, letterSpacing: '-.01em', lineHeight: 1.1 }}>
          {title}
        </div>
        <div style={{ marginTop: 10, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {motionLabel.split(' ').map((k, i) => (
            <Kbd key={i} hot={!locked}>
              {k}
            </Kbd>
          ))}
        </div>
      </div>

      <div style={{ fontSize: 13, color: tokens.text, lineHeight: 1.6 }}>{blurb}</div>

      {rewardBlurb && (
        <div className="vs-frame" style={{ padding: 14, background: tokens.bg }}>
          <div style={{ fontSize: 10, color: tokens.dim, letterSpacing: '.3em', marginBottom: 6 }}>★ WHY IT MATTERS</div>
          <div style={{ fontSize: 13, color: tokens.text, lineHeight: 1.5 }}>{rewardBlurb}</div>
        </div>
      )}

      {/* rewards preview */}
      <div>
        <div style={{ fontSize: 10, color: tokens.dim, letterSpacing: '.3em', marginBottom: 8 }}>★ REWARDS</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <div className="vs-frame" style={{ padding: '10px 12px', background: tokens.bgPanel2 }}>
            <div style={{ display: 'flex', gap: 3 }}>
              {[0, 1, 2].map((i) => (
                <PixelStar key={i} size={14} filled color={tokens.amber} />
              ))}
            </div>
            <div style={{ fontSize: 10, color: tokens.dim, letterSpacing: '.15em', marginTop: 6 }}>3-STAR GOAL</div>
          </div>
          <div className="vs-frame" style={{ padding: '10px 12px', background: tokens.bgPanel2 }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: tokens.purple }}>DEX</div>
            <div style={{ fontSize: 10, color: tokens.dim, letterSpacing: '.15em', marginTop: 6 }}>ENTRY · SOON</div>
          </div>
        </div>
      </div>

      {status === 'done' && (
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {[0, 1, 2].map((i) => (
            <PixelStar key={i} size={22} filled={i < stars} color={tokens.amber} />
          ))}
          <span style={{ marginLeft: 8, fontSize: 12, color: tokens.dim }}>{stars}/3 stars</span>
        </div>
      )}

      <div style={{ marginTop: 'auto' }}>
        <TermButton hot={!locked} big disabled={locked} onClick={onEnter} style={{ width: '100%' }}>
          {locked ? 'LOCKED' : status === 'done' ? '⏎ REPLAY' : '⏎ ENTER'}
        </TermButton>
        {locked && (
          <div style={{ marginTop: 8, fontSize: 11, color: tokens.dim, textAlign: 'center' }}>
            clear the previous unit to unlock
          </div>
        )}
      </div>
    </>
  )
}
