import { tokens, fontMono } from '../../../../design/tokens'
import { modeColor } from '../../../../design/tokens'
import type { StageMode } from '../types'

interface EditorBoardProps {
  text: string
  cursorIndex: number
  mode: StageMode
  goalText: string
  hint?: string
}

/** Renders one buffer with a mode-aware cursor (block in normal, bar in insert). */
function renderBuffer(text: string, cursorIndex: number, mode: StageMode) {
  const out: React.ReactNode[] = []
  const len = text.length
  const cur = modeColor[mode]
  for (let i = 0; i <= len; i++) {
    const isCursor = i === cursorIndex
    if (i === len) {
      if (isCursor) {
        out.push(
          <span key={`c-${i}`} style={{ background: cur, color: tokens.bg, boxShadow: `0 0 10px ${cur}` }}>
            {mode === 'insert' ? ' ' : ' '}
          </span>,
        )
      }
      continue
    }
    const ch = text[i]
    const base = { color: tokens.text } as React.CSSProperties
    let style: React.CSSProperties = base
    if (isCursor) {
      style =
        mode === 'insert'
          ? { borderLeft: `2px solid ${cur}`, color: tokens.white }
          : { background: cur, color: tokens.bg, boxShadow: `0 0 10px ${cur}` }
    }
    out.push(
      <span key={i} style={style}>
        {ch === '\n' ? '\n' : ch}
      </span>,
    )
  }
  return out
}

/** CRT "You vs Goal" editor view for editable (mutating) stages. */
export function EditorBoard({ text, cursorIndex, mode, goalText, hint }: EditorBoardProps) {
  return (
    <div style={{ width: '100%', maxWidth: '52rem', display: 'flex', flexDirection: 'column', gap: 8 }}>
      {hint && (
        <div style={{ fontSize: 13, color: tokens.amber, marginBottom: 4 }}>{hint}</div>
      )}
      <div style={{ fontSize: 10, color: tokens.dim, letterSpacing: '.3em' }}>~/YOU</div>
      <div
        className="vs-frame-hot"
        style={{
          whiteSpace: 'pre-wrap',
          padding: 18,
          background: tokens.bg,
          fontFamily: fontMono,
          fontSize: 17,
          lineHeight: 1.7,
          minHeight: 56,
        }}
      >
        {renderBuffer(text, cursorIndex, mode)}
      </div>
      <div style={{ fontSize: 10, color: tokens.dim, letterSpacing: '.3em', marginTop: 8 }}>~/GOAL</div>
      <div
        style={{
          whiteSpace: 'pre-wrap',
          padding: 18,
          border: `1px solid ${tokens.line2}`,
          background: 'rgba(16,255,160,.04)',
          fontFamily: fontMono,
          fontSize: 17,
          lineHeight: 1.7,
          color: tokens.bright,
          minHeight: 56,
        }}
      >
        {goalText === '' ? ' ' : goalText}
      </div>
    </div>
  )
}
