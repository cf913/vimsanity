import type { ReactNode } from 'react'
import { tokens, fontMono } from '../../../design/tokens'
import { Kbd, StatusBar, type StatusMode } from '../../../design/primitives'
import type { Unit } from '../units/types'
import type { StageTelemetry } from './types'

interface LevelChromeProps {
  unit: Unit
  /** 'A' = drill, 'B' = check. */
  stage: 'A' | 'B'
  stageName: string
  replayMode: boolean
  telemetry: StageTelemetry | null
  allowedKeys: string[]
  /** Coach hint shown in the right rail. */
  hint?: ReactNode
  onBack: () => void
  children: ReactNode
}

const MODE_MAP: Record<NonNullable<StageTelemetry['mode']>, StatusMode> = {
  normal: 'NORMAL',
  insert: 'INSERT',
  visual: 'VISUAL',
}

/**
 * The in-level HUD frame. Wraps a stage's play board (children) with CRT chrome:
 * mission header, live keystroke/par/progress readout, allowed-keys + coach rail,
 * and a vim modeline. Engine-agnostic — it only reads `telemetry` + `def`-derived
 * props, so a stage's engine loop is untouched.
 */
export default function LevelChrome({
  unit,
  stage,
  stageName,
  replayMode,
  telemetry,
  allowedKeys,
  hint,
  onBack,
  children,
}: LevelChromeProps) {
  const mode: StatusMode = telemetry?.mode ? MODE_MAP[telemetry.mode] : 'NORMAL'
  const keystrokes = telemetry?.keystrokes ?? 0
  const par = telemetry?.par
  const progress = telemetry?.progress
  const overPar = par !== undefined && keystrokes > par

  return (
    <div
      style={{
        position: 'relative',
        minHeight: '100%',
        display: 'grid',
        gridTemplateRows: 'auto 1fr auto',
        background: tokens.bg,
      }}
    >
      {/* TOP HUD */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          gap: 24,
          padding: '16px 28px',
          borderBottom: `1px solid ${tokens.line2}`,
          background: tokens.bgPanel,
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button
            onClick={onBack}
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
          <div>
            <div style={{ fontSize: 10, color: tokens.dim, letterSpacing: '.3em', display: 'flex', gap: 8 }}>
              {unit.id.toUpperCase()} · STAGE {stage}
              {replayMode && <span style={{ color: tokens.amber }}>· REPLAY</span>}
            </div>
            <div className="vs-glow" style={{ fontWeight: 700, color: tokens.bright, fontSize: 18, letterSpacing: '.02em' }}>
              {unit.title} · {stageName}
            </div>
          </div>
        </div>

        {/* center: progress */}
        <div style={{ textAlign: 'center' }}>
          {progress && (
            <>
              <div style={{ fontSize: 10, color: tokens.dim, letterSpacing: '.3em' }}>{progress.label}</div>
              <div
                className="vs-glow"
                style={{ fontFamily: fontMono, fontSize: 30, fontWeight: 800, color: tokens.bright, lineHeight: 1 }}
              >
                {progress.current}
                <span style={{ color: tokens.dim, fontSize: 18 }}>/{progress.total}</span>
              </div>
            </>
          )}
        </div>

        {/* right: keystrokes / par */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 22, alignItems: 'center' }}>
          {par !== undefined && (
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 10, color: tokens.dim, letterSpacing: '.3em' }}>PAR</div>
              <div style={{ fontFamily: fontMono, fontSize: 24, fontWeight: 800, color: tokens.text }}>{par}</div>
            </div>
          )}
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 10, color: tokens.dim, letterSpacing: '.3em' }}>KEYS</div>
            <div
              className={overPar ? 'vs-glow-red' : 'vs-glow'}
              style={{
                fontFamily: fontMono,
                fontSize: 30,
                fontWeight: 800,
                color: overPar ? tokens.red : tokens.bright,
                lineHeight: 1,
              }}
            >
              {keystrokes}
            </div>
          </div>
        </div>
      </div>

      {/* CENTER: board + right rail */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', minHeight: 0 }}>
        <div
          className="vs-checker"
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 18,
            padding: 24,
          }}
        >
          {children}
        </div>

        {/* right rail */}
        <div
          style={{
            borderLeft: `1px solid ${tokens.line}`,
            background: tokens.bgPanel,
            padding: '24px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
          }}
        >
          <div>
            <div style={{ fontSize: 10, color: tokens.dim, letterSpacing: '.3em', marginBottom: 8 }}>~/ALLOWED</div>
            <div className="vs-frame" style={{ padding: 16, background: tokens.bg }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {allowedKeys.map((k, i) => (
                  <Kbd key={i} hot>
                    {prettyKey(k)}
                  </Kbd>
                ))}
              </div>
            </div>
          </div>

          {hint && (
            <div
              className="vs-frame"
              style={{ padding: 14, background: 'linear-gradient(180deg, rgba(16,255,160,.06), transparent)' }}
            >
              <div style={{ fontSize: 11, color: tokens.bright, letterSpacing: '.12em', fontWeight: 700, marginBottom: 4 }}>
                COACH ▸
              </div>
              <div style={{ fontSize: 12.5, color: tokens.text, lineHeight: 1.5 }}>{hint}</div>
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

      {/* BOTTOM modeline */}
      <StatusBar
        mode={mode}
        file={`~/${unit.id}.vim`}
        info={progress ? `${progress.label.toLowerCase()} ${progress.current}/${progress.total}` : undefined}
        right={
          <>
            <span>
              KEYS <span style={{ color: tokens.bright }}>{keystrokes}</span>
            </span>
            {par !== undefined && <span>PAR {par}</span>}
          </>
        }
      />
    </div>
  )
}

function prettyKey(k: string): string {
  if (k === ' ') return '␣'
  if (k === 'Escape') return 'Esc'
  if (k === 'Enter') return '⏎'
  return k
}
