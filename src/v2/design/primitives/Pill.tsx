import type { CSSProperties, ReactNode } from 'react'
import { tokens } from '../tokens'

export type PillTone = 'green' | 'dim' | 'amber' | 'purple' | 'red'

interface PillProps {
  children: ReactNode
  tone?: PillTone
  style?: CSSProperties
}

const toneStyles: Record<PillTone, { fg: string; bd: string; bg: string }> = {
  green: { fg: tokens.bright, bd: tokens.line2, bg: 'rgba(16,255,160,.08)' },
  dim: { fg: tokens.dim, bd: tokens.line, bg: 'rgba(16,255,160,.04)' },
  amber: { fg: tokens.amber, bd: '#5a3e10', bg: 'rgba(255,181,71,.08)' },
  purple: { fg: tokens.purple, bd: '#3a2a5a', bg: 'rgba(192,132,252,.08)' },
  red: { fg: tokens.red, bd: '#5a2030', bg: 'rgba(255,90,95,.08)' },
}

/** Phosphor pill — section labels, level chips, status badges. */
export function Pill({ children, tone = 'green', style }: PillProps) {
  const t = toneStyles[tone]
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '.14em',
        textTransform: 'uppercase',
        padding: '4px 10px',
        borderRadius: 2,
        color: t.fg,
        background: t.bg,
        border: `1px solid ${t.bd}`,
        ...style,
      }}
    >
      {children}
    </span>
  )
}
