import type { CSSProperties } from 'react'
import { tokens } from '../tokens'

interface PixelStarProps {
  size?: number
  filled?: boolean
  color?: string
  style?: CSSProperties
}

// 7x7 star bitmap — drawn from divs, no SVG.
const STAR_MAP = [
  [0, 0, 0, 1, 0, 0, 0],
  [0, 0, 0, 1, 0, 0, 0],
  [1, 1, 1, 1, 1, 1, 1],
  [0, 1, 1, 1, 1, 1, 0],
  [0, 1, 1, 1, 1, 1, 0],
  [1, 1, 0, 0, 0, 1, 1],
  [1, 0, 0, 0, 0, 0, 1],
]

/** Pixel-grid star icon. */
export function PixelStar({ size = 24, filled = true, color = tokens.amber, style }: PixelStarProps) {
  const u = size / 7
  return (
    <div style={{ position: 'relative', width: size, height: size, ...style }}>
      {STAR_MAP.flatMap((row, y) =>
        row.map((v, x) =>
          v ? (
            <div
              key={`${x}-${y}`}
              style={{
                position: 'absolute',
                left: x * u,
                top: y * u,
                width: u,
                height: u,
                background: filled ? color : tokens.bgPanel2,
                boxShadow: filled ? `0 0 4px ${color}99` : 'none',
              }}
            />
          ) : null,
        ),
      )}
    </div>
  )
}
