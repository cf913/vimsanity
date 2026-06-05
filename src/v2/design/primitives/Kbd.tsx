import type { CSSProperties, ReactNode } from 'react'
import { tokens, fontMono } from '../tokens'

interface KbdProps {
  children: ReactNode
  hot?: boolean
  style?: CSSProperties
}

/** Chunky terminal keycap. */
export function Kbd({ children, hot, style }: KbdProps) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: '1.8em',
        height: '1.8em',
        padding: '0 .55em',
        borderRadius: 4,
        background: tokens.bgPanel2,
        color: hot ? tokens.bright : tokens.text,
        // Longhand only — mixing `border` shorthand with `borderBottomWidth`
        // triggers a React re-render warning.
        borderStyle: 'solid',
        borderColor: hot ? tokens.line2 : tokens.line,
        borderWidth: '1px 1px 3px 1px',
        boxShadow: `0 1px 0 ${tokens.grid}, inset 0 1px 0 rgba(255,255,255,.04)`,
        font: `600 .9em ${fontMono}`,
        letterSpacing: '.04em',
        ...style,
      }}
    >
      {children}
    </span>
  )
}
