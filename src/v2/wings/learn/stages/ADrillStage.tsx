import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { applyKey, motionRegistry } from '../../../engine/motions'
import { isCursorAt } from '../../../engine/grader'
import type { Point } from '../../../engine/grader'
import type { GridState } from '../../../engine/types'
import type { AStageDef } from '../units/types'

interface Props {
  def: AStageDef
  onCompleted: () => void
}

function randomTarget(width: number, height: number, exclude: Point): Point {
  while (true) {
    const x = Math.floor(Math.random() * width)
    const y = Math.floor(Math.random() * height)
    if (x !== exclude.x || y !== exclude.y) return { x, y }
  }
}

export default function ADrillStage({ def, onCompleted }: Props) {
  const [state, setState] = useState<GridState>({
    width: def.gridWidth,
    height: def.gridHeight,
    cursor: { ...def.startCursor },
    keystrokes: 0,
  })
  const [target, setTarget] = useState<Point>(() =>
    randomTarget(def.gridWidth, def.gridHeight, def.startCursor),
  )
  const [hits, setHits] = useState(0)
  const completedRef = useRef(false)

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (completedRef.current) return
      if (!def.allowedKeys.includes(e.key)) return
      e.preventDefault()
      const { state: next } = applyKey(state, { key: e.key }, motionRegistry)
      setState(next)
      if (isCursorAt(next, target)) {
        const nextHits = hits + 1
        setHits(nextHits)
        if (nextHits >= def.targetCount) {
          completedRef.current = true
          queueMicrotask(onCompleted)
        } else {
          setTarget(randomTarget(def.gridWidth, def.gridHeight, next.cursor))
        }
      }
    },
    [def.allowedKeys, def.gridWidth, def.gridHeight, def.targetCount, state, hits, target, onCompleted],
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  const cells = useMemo(() => {
    const rows = []
    for (let y = 0; y < def.gridHeight; y++) {
      const row = []
      for (let x = 0; x < def.gridWidth; x++) {
        const isCursor = state.cursor.x === x && state.cursor.y === y
        const isTarget = target.x === x && target.y === y
        row.push(
          <div
            key={`${x},${y}`}
            className={`flex h-10 w-10 items-center justify-center rounded text-xs ${
              isCursor
                ? 'bg-orange-500 text-black'
                : isTarget
                  ? 'bg-green-500 text-black'
                  : 'bg-gray-800 text-gray-700'
            }`}
          >
            {isCursor ? '●' : isTarget ? '★' : ''}
          </div>,
        )
      }
      rows.push(
        <div key={y} className="flex gap-1">
          {row}
        </div>,
      )
    }
    return rows
  }, [state.cursor.x, state.cursor.y, target, def.gridWidth, def.gridHeight])

  return (
    <div className="flex flex-col items-center gap-6 p-8">
      <div className="text-sm text-gray-400">
        Drill · Hit the <span className="text-green-400">★</span> with{' '}
        <span className="font-mono text-orange-300">h j k l</span>
      </div>
      <div className="flex flex-col gap-1">{cells}</div>
      <div className="text-sm text-gray-300">
        <span className="font-mono">{hits}</span> / {def.targetCount} targets
      </div>
    </div>
  )
}
