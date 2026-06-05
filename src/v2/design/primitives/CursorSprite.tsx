import type { CSSProperties } from 'react'
import { type VimMode, modeColor, modeGlow, tokens } from '../tokens'

interface CursorSpriteProps {
  size?: number
  mode?: VimMode
  style?: CSSProperties
}

/** The protagonist: a phosphor pixel block with a little face. Mode-colored. */
export function CursorSprite({ size = 28, mode = 'normal', style }: CursorSpriteProps) {
  const color = modeColor[mode]
  const glow = modeGlow[mode]
  return (
    <div
      style={{
        width: size,
        height: size,
        position: 'relative',
        background: color,
        boxShadow: `0 0 12px ${glow}, 0 0 28px ${glow}, inset 0 0 0 2px rgba(255,255,255,.18)`,
        ...style,
      }}
    >
      {/* eyes + mouth — gives the cursor a character */}
      <span
        style={{
          position: 'absolute',
          top: '30%',
          left: '25%',
          width: size * 0.12,
          height: size * 0.18,
          background: tokens.bg,
        }}
      />
      <span
        style={{
          position: 'absolute',
          top: '30%',
          right: '25%',
          width: size * 0.12,
          height: size * 0.18,
          background: tokens.bg,
        }}
      />
      <span
        style={{
          position: 'absolute',
          bottom: '22%',
          left: '30%',
          right: '30%',
          height: size * 0.08,
          background: tokens.bg,
          borderRadius: 1,
        }}
      />
    </div>
  )
}
