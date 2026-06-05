import { useEffect, useRef, useState, type ReactNode } from 'react'
import gsap from 'gsap'
import { tokens, fontMono } from '../../../design/tokens'
import { prefersReducedMotion } from '../../../design/useGsap'
import { Kbd, StatusBar, type StatusMode } from '../../../design/primitives'
import type { Unit } from '../units/types'
import type { StageTelemetry } from './types'

interface LevelChromeProps {
  unit: Unit
  /** 'A' = drill, 'B' = check. */
  stage: 'A' | 'B'
  stageName: string
  replayMode: boolean
  /**
   * Identity of the current stage instance (changes on stage switch / replay).
   * Used to reset juice deterministically — a telemetry `null` frame can be
   * swallowed by React batching on replay, so we don't rely on it.
   */
  runKey: string
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

/** How long (ms) a combo stays alive without a fresh hit before it decays. */
const COMBO_WINDOW = 5000

function formatClock(ms: number): string {
  const total = Math.floor(ms / 1000)
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

/**
 * Spawn a floating "+points / COMBO ×N" burst over the play board. Pure DOM +
 * GSAP so it never triggers a React re-render of the live stage.
 */
function spawnBurst(layer: HTMLElement | null, pts: number, combo: number, reduced: boolean) {
  if (!layer) return
  const el = document.createElement('div')
  el.style.cssText =
    `position:absolute;left:50%;top:42%;transform:translate(-50%,-50%);` +
    `text-align:center;pointer-events:none;z-index:6;font-family:${fontMono};white-space:nowrap;`
  el.innerHTML =
    `<div style="font-size:36px;font-weight:800;color:${tokens.bright};text-shadow:0 0 14px ${tokens.bright}">+${pts}</div>` +
    (combo > 1
      ? `<div style="margin-top:2px;font-size:13px;font-weight:800;letter-spacing:.22em;color:${tokens.amber};text-shadow:0 0 8px ${tokens.amber}">COMBO ×${combo}</div>`
      : '')
  layer.appendChild(el)
  if (reduced) {
    window.setTimeout(() => el.remove(), 500)
    return
  }
  gsap.fromTo(
    el,
    { y: 12, opacity: 0, scale: 0.5 },
    {
      y: -28,
      opacity: 1,
      scale: 1,
      duration: 0.26,
      ease: 'back.out(3)',
      onComplete() {
        gsap.to(el, {
          y: -78,
          opacity: 0,
          duration: 0.5,
          delay: 0.22,
          ease: 'power1.in',
          onComplete: () => el.remove(),
        })
      },
    },
  )
}

/**
 * The in-level HUD frame. Wraps a stage's play board (children) with CRT chrome:
 * mission header, live keystroke/par/progress readout, allowed-keys + coach rail,
 * and a vim modeline. Engine-agnostic — it only reads `telemetry` + `def`-derived
 * props, so a stage's engine loop is untouched.
 *
 * Game-feel ("juice") is layered on here too, derived entirely from telemetry
 * deltas: a keystroke-count pop, an elapsed-time clock, a combo meter with a
 * decaying bar, and floating score bursts + a board flash on every target hit.
 */
export default function LevelChrome({
  unit,
  stage,
  stageName,
  replayMode,
  runKey,
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

  // --- juice state ---------------------------------------------------------
  const [combo, setCombo] = useState(0)
  const [comboPct, setComboPct] = useState(0)
  const [elapsedMs, setElapsedMs] = useState(0)

  const keysElRef = useRef<HTMLDivElement>(null)
  const boardRef = useRef<HTMLDivElement>(null)
  const burstRef = useRef<HTMLDivElement>(null)
  const flashRef = useRef<HTMLDivElement>(null)

  const prevCurrentRef = useRef<number | null>(null)
  const prevKeysRef = useRef(0)
  const comboRef = useRef(0)
  const comboDeadlineRef = useRef(0)
  const startRef = useRef<number | null>(null)

  // A new stage instance (stage switch or replay) resets all juice.
  useEffect(() => {
    prevCurrentRef.current = null
    prevKeysRef.current = 0
    comboRef.current = 0
    comboDeadlineRef.current = 0
    startRef.current = null
    setCombo(0)
    setComboPct(0)
    setElapsedMs(0)
  }, [runKey])

  // React to each fresh telemetry frame: detect hits + keystroke increments.
  useEffect(() => {
    if (!telemetry) return
    const reduced = prefersReducedMotion()

    const k = telemetry.keystrokes
    // Start the clock on the first real keystroke.
    if (k > 0 && startRef.current === null) startRef.current = Date.now()

    // Keystroke pop.
    if (k > prevKeysRef.current) {
      if (!reduced && keysElRef.current) {
        gsap.fromTo(keysElRef.current, { scale: 1.45 }, { scale: 1, duration: 0.3, ease: 'back.out(4)' })
      }
    }
    prevKeysRef.current = k

    // Hit detection: progress.current climbing means a target/puzzle was cleared.
    const cur = telemetry.progress?.current
    if (cur !== undefined) {
      const prev = prevCurrentRef.current
      if (prev !== null && cur > prev) {
        comboRef.current += 1
        comboDeadlineRef.current = Date.now() + COMBO_WINDOW
        setCombo(comboRef.current)
        setComboPct(100)
        const pts = 100 * Math.max(1, comboRef.current)
        spawnBurst(burstRef.current, pts, comboRef.current, reduced)
        if (!reduced) {
          if (flashRef.current) {
            gsap.fromTo(flashRef.current, { opacity: 0.4 }, { opacity: 0, duration: 0.45, ease: 'power2.out' })
          }
          if (boardRef.current) {
            gsap.fromTo(
              boardRef.current,
              { x: -4 },
              { x: 0, duration: 0.35, ease: 'elastic.out(1.2, 0.4)' },
            )
          }
        }
      }
      prevCurrentRef.current = cur
    }
  }, [telemetry])

  // Single 100ms ticker: advances the clock and drains the combo bar.
  useEffect(() => {
    const id = window.setInterval(() => {
      const now = Date.now()
      if (startRef.current !== null) {
        setElapsedMs((prev) => {
          const next = now - startRef.current!
          return Math.abs(next - prev) >= 200 ? next : prev
        })
      }
      if (comboRef.current > 0) {
        const remaining = comboDeadlineRef.current - now
        if (remaining <= 0) {
          comboRef.current = 0
          setCombo(0)
          setComboPct(0)
        } else {
          setComboPct((remaining / COMBO_WINDOW) * 100)
        }
      }
    }, 100)
    return () => window.clearInterval(id)
  }, [])

  const comboColor = combo >= 5 ? tokens.amber : combo >= 3 ? tokens.hot : tokens.bright

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

        {/* right: time / keystrokes / par */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 22, alignItems: 'center' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 10, color: tokens.dim, letterSpacing: '.3em' }}>TIME</div>
            <div style={{ fontFamily: fontMono, fontSize: 24, fontWeight: 800, color: tokens.text }}>
              {formatClock(elapsedMs)}
            </div>
          </div>
          {par !== undefined && (
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 10, color: tokens.dim, letterSpacing: '.3em' }}>PAR</div>
              <div style={{ fontFamily: fontMono, fontSize: 24, fontWeight: 800, color: tokens.text }}>{par}</div>
            </div>
          )}
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 10, color: tokens.dim, letterSpacing: '.3em' }}>KEYS</div>
            <div
              ref={keysElRef}
              className={overPar ? 'vs-glow-red' : 'vs-glow'}
              style={{
                fontFamily: fontMono,
                fontSize: 30,
                fontWeight: 800,
                color: overPar ? tokens.red : tokens.bright,
                lineHeight: 1,
                transformOrigin: 'right center',
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
          {/* combo meter */}
          {combo >= 2 && (
            <div
              style={{
                position: 'absolute',
                top: 18,
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 5,
                width: 180,
                textAlign: 'center',
                pointerEvents: 'none',
              }}
            >
              <div
                className="vs-glow"
                style={{
                  fontFamily: fontMono,
                  fontSize: 22,
                  fontWeight: 800,
                  color: comboColor,
                  letterSpacing: '.04em',
                  textShadow: `0 0 12px ${comboColor}`,
                }}
              >
                COMBO ×{combo}
              </div>
              <div
                style={{
                  marginTop: 4,
                  height: 5,
                  background: tokens.bgPanel2,
                  border: `1px solid ${tokens.line}`,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${comboPct}%`,
                    background: comboColor,
                    boxShadow: `0 0 8px ${comboColor}`,
                    transition: 'width .1s linear',
                  }}
                />
              </div>
            </div>
          )}

          {/* hit flash */}
          <div
            ref={flashRef}
            style={{
              position: 'absolute',
              inset: 0,
              opacity: 0,
              pointerEvents: 'none',
              background: 'radial-gradient(ellipse 60% 60% at 50% 50%, rgba(16,255,160,.35), transparent 70%)',
              zIndex: 4,
            }}
          />
          {/* score-burst layer */}
          <div ref={burstRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 6 }} />

          <div ref={boardRef} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
            {children}
          </div>
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
            <span>{formatClock(elapsedMs)}</span>
            {combo >= 2 && <span style={{ color: comboColor }}>×{combo}</span>}
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
