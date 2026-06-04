import type { CSSProperties, ReactNode } from 'react'

interface CRTProps {
  children: ReactNode
  /** Adds the soft inner vignette. */
  vignette?: boolean
  className?: string
  style?: CSSProperties
}

/** CRT surface wrapper — scanlines + turbulence noise (+ optional vignette). */
export function CRT({ children, vignette, className = '', style }: CRTProps) {
  return (
    <div
      className={`vs-crt ${vignette ? 'vs-vignette' : ''} ${className}`.trim()}
      style={{ width: '100%', height: '100%', ...style }}
    >
      {children}
      <div className="vs-noise" />
    </div>
  )
}
