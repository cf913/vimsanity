import { tokens } from '../../../../design/tokens'
import { CursorSprite, PixelStar } from '../../../../design/primitives'
import type { Point } from '../../../../engine/grader'
import type { StageMode } from '../types'

interface GridBoardProps {
  width: number
  height: number
  cursor: Point
  target?: Point | null
  mode?: StageMode
  cellSize?: number
}

/** CRT-styled 2D play grid: phosphor cursor sprite + pixel-star target. */
export function GridBoard({ width, height, cursor, target, mode = 'normal', cellSize = 46 }: GridBoardProps) {
  const gap = 4
  return (
    <div
      className="vs-checker"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${width}, ${cellSize}px)`,
        gridAutoRows: `${cellSize}px`,
        gap,
        padding: 12,
        border: `1px solid ${tokens.line}`,
        background: tokens.bg,
      }}
    >
      {Array.from({ length: width * height }).map((_, i) => {
        const x = i % width
        const y = Math.floor(i / width)
        const isCursor = cursor.x === x && cursor.y === y
        const isTarget = target && target.x === x && target.y === y
        if (isCursor) {
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CursorSprite size={cellSize} mode={mode} />
            </div>
          )
        }
        if (isTarget) {
          return (
            <div
              key={i}
              className="vs-heart"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(255,181,71,.06)',
                border: `2px solid ${tokens.amber}`,
                boxShadow: `0 0 16px ${tokens.amber}, inset 0 0 10px rgba(255,181,71,.3)`,
              }}
            >
              <PixelStar size={cellSize * 0.6} color={tokens.amber} />
            </div>
          )
        }
        return (
          <div
            key={i}
            style={{ background: tokens.bgPanel2, border: `1px solid ${tokens.grid}` }}
          />
        )
      })}
    </div>
  )
}
