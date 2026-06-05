import { useCallback, useEffect, useRef, useState } from 'react'
import { applyKey, motionRegistry } from '../../../engine/motions'
import { isCursorAt } from '../../../engine/grader'
import type { Point } from '../../../engine/grader'
import type { GridState } from '../../../engine/types'
import type { AGridDrillDef } from '../units/types'
import { GridBoard } from '../level/views/GridBoard'
import type { OnStageCompleted, OnTelemetry } from '../level/types'

interface Props {
  def: AGridDrillDef
  onCompleted: OnStageCompleted
  onTelemetry?: OnTelemetry
}

function randomTarget(width: number, height: number, exclude: Point): Point {
  while (true) {
    const x = Math.floor(Math.random() * width)
    const y = Math.floor(Math.random() * height)
    if (x !== exclude.x || y !== exclude.y) return { x, y }
  }
}

export default function ADrillStage({ def, onCompleted, onTelemetry }: Props) {
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
  const [lastKey, setLastKey] = useState<string | undefined>(undefined)
  const completedRef = useRef(false)

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (completedRef.current) return
      if (!def.allowedKeys.includes(e.key)) return
      e.preventDefault()
      setLastKey(e.key)
      const { state: next } = applyKey(state, { key: e.key }, motionRegistry)
      setState(next)
      if (isCursorAt(next, target)) {
        const nextHits = hits + 1
        setHits(nextHits)
        if (nextHits >= def.targetCount) {
          completedRef.current = true
          queueMicrotask(() => onCompleted())
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

  // Publish live HUD telemetry.
  useEffect(() => {
    onTelemetry?.({
      keystrokes: state.keystrokes,
      lastKey,
      mode: 'normal',
      progress: { current: hits, total: def.targetCount, label: 'TARGETS' },
    })
  }, [state.keystrokes, hits, lastKey, def.targetCount, onTelemetry])

  return (
    <GridBoard
      width={def.gridWidth}
      height={def.gridHeight}
      cursor={state.cursor}
      target={target}
    />
  )
}
