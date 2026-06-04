import type { CSSProperties, ReactNode } from 'react'
import { tokens } from '../tokens'

interface BlockBarProps {
  value: number
  max?: number
  color?: string
  height?: number
  label?: ReactNode
  /** Animate the fill on mount (disabled automatically under reduced motion via CSS). */
  animate?: boolean
  style?: CSSProperties
}

/** Phosphor block-character progress bar with 10% notches. */
export function BlockBar({
  value,
  max = 100,
  color = tokens.bright,
  height = 10,
  label,
  animate = true,
  style,
}: BlockBarProps) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100))
  return (
    <div style={style}>
      {label && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 11,
            color: tokens.dim,
            letterSpacing: '.1em',
            marginBottom: 4,
            textTransform: 'uppercase',
          }}
        >
          <span>{label}</span>
          <span style={{ color }}>
            {value}
            <span style={{ color: tokens.dim }}>/{max}</span>
          </span>
        </div>
      )}
      <div
        style={{
          position: 'relative',
          height,
          background: tokens.bgPanel2,
          border: `1px solid ${tokens.line}`,
        }}
      >
        <div
          className={animate ? 'vs-fillbar' : undefined}
          style={{
            position: 'absolute',
            inset: 0,
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${color}88, ${color})`,
            boxShadow: `0 0 8px ${color}99`,
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `repeating-linear-gradient(90deg, transparent 0 calc(10% - 1px), ${tokens.bg} calc(10% - 1px) 10%)`,
          }}
        />
      </div>
    </div>
  )
}
