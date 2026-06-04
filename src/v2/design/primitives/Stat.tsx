import type { CSSProperties, ReactNode } from 'react'
import { tokens, fontMono } from '../tokens'

export type StatTone = 'green' | 'amber' | 'purple' | 'red'

interface StatProps {
  label: ReactNode
  value: ReactNode
  tone?: StatTone
  sub?: ReactNode
  style?: CSSProperties
}

const toneColor: Record<StatTone, string> = {
  green: tokens.bright,
  amber: tokens.amber,
  purple: tokens.purple,
  red: tokens.red,
}

const toneGlow: Record<StatTone, string> = {
  green: 'vs-glow',
  amber: 'vs-glow-amber',
  purple: 'vs-glow-purple',
  red: 'vs-glow-red',
}

/** Label-over-big-number stat block. */
export function Stat({ label, value, tone = 'green', sub, style }: StatProps) {
  return (
    <div style={style}>
      <div
        style={{
          fontSize: 11,
          color: tokens.dim,
          letterSpacing: '.18em',
          textTransform: 'uppercase',
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      <div
        className={toneGlow[tone]}
        style={{
          fontFamily: fontMono,
          fontSize: 40,
          fontWeight: 700,
          color: toneColor[tone],
          lineHeight: 1,
        }}
      >
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: 11, color: tokens.dim, marginTop: 4, letterSpacing: '.06em' }}>
          {sub}
        </div>
      )}
    </div>
  )
}
