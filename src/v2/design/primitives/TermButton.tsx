import type { CSSProperties, ReactNode } from 'react'
import { tokens, fontMono } from '../tokens'

interface TermButtonProps {
  children: ReactNode
  hot?: boolean
  big?: boolean
  disabled?: boolean
  onClick?: () => void
  style?: CSSProperties
  type?: 'button' | 'submit'
}

/** Chunky terminal action button. `hot` = filled phosphor; default = outline. */
export function TermButton({
  children,
  hot,
  big,
  disabled,
  onClick,
  style,
  type = 'button',
}: TermButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={hot ? 'vs-glow' : undefined}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        fontFamily: fontMono,
        fontSize: big ? 16 : 13,
        fontWeight: 700,
        letterSpacing: '.12em',
        textTransform: 'uppercase',
        padding: big ? '14px 28px' : '10px 18px',
        color: hot ? tokens.bg : tokens.bright,
        background: hot ? tokens.bright : 'transparent',
        border: `1px solid ${hot ? tokens.bright : tokens.line2}`,
        borderRadius: 2,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.45 : 1,
        position: 'relative',
        boxShadow: hot
          ? '0 0 20px rgba(16,255,160,.4), 0 0 40px rgba(16,255,160,.15)'
          : 'inset 0 0 0 1px rgba(16,255,160,.05)',
        ...style,
      }}
    >
      {children}
    </button>
  )
}
