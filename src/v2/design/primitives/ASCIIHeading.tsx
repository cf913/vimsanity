import type { CSSProperties, ReactNode } from 'react'
import { tokens, fontMono } from '../tokens'

interface ASCIIHeadingProps {
  children: ReactNode
  sub?: ReactNode
  size?: number
  style?: CSSProperties
}

/** Big phosphor display heading inside a dashed terminal rule. */
export function ASCIIHeading({ children, sub, size = 64, style }: ASCIIHeadingProps) {
  return (
    <div style={style}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          color: tokens.dim,
          fontSize: 12,
          letterSpacing: '.2em',
          marginBottom: 8,
        }}
      >
        <span>┌─</span>
        <span>{sub}</span>
        <span style={{ flex: 1, borderTop: `1px dashed ${tokens.line}`, marginTop: 6 }} />
      </div>
      <div
        className="vs-glow-strong"
        style={{
          fontFamily: fontMono,
          fontWeight: 800,
          fontSize: size,
          lineHeight: 1,
          color: tokens.bright,
          letterSpacing: '-.02em',
        }}
      >
        {children}
      </div>
    </div>
  )
}
