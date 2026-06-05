import type { CSSProperties, ReactNode } from 'react'
import { tokens } from '../tokens'

export type StatusMode = 'NORMAL' | 'INSERT' | 'VISUAL' | 'COMMAND'

interface StatusBarProps {
  mode?: StatusMode
  file?: ReactNode
  info?: ReactNode
  right?: ReactNode
  style?: CSSProperties
}

const modeColors: Record<StatusMode, string> = {
  NORMAL: tokens.bright,
  INSERT: tokens.amber,
  VISUAL: tokens.purple,
  COMMAND: tokens.cyan,
}

/** Vim-style modeline at the bottom of a screen. */
export function StatusBar({ mode = 'NORMAL', file, info, right, style }: StatusBarProps) {
  const modeColor = modeColors[mode]
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'stretch',
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: '.06em',
        borderTop: `1px solid ${tokens.line2}`,
        background: tokens.bgPanel,
        ...style,
      }}
    >
      <div style={{ padding: '8px 14px', background: modeColor, color: tokens.bg }}>
        <span style={{ letterSpacing: '.15em' }}>-- {mode} --</span>
      </div>
      <div
        style={{
          padding: '8px 14px',
          color: tokens.text,
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 14,
        }}
      >
        {file && <span style={{ color: tokens.bright }}>{file}</span>}
        {info && <span style={{ color: tokens.dim }}>{info}</span>}
      </div>
      <div
        style={{
          padding: '8px 14px',
          color: tokens.dim,
          display: 'flex',
          alignItems: 'center',
          gap: 14,
        }}
      >
        {right}
      </div>
    </div>
  )
}
