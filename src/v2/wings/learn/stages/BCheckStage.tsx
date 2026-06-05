import { useCallback, useEffect, useRef, useState } from 'react'
import { applyKey, motionRegistry } from '../../../engine/motions'
import { isCursorAt } from '../../../engine/grader'
import type { GridState } from '../../../engine/types'
import type { BCheckPuzzle, BGridStageDef } from '../units/types'
import { GridBoard } from '../level/views/GridBoard'
import type { OnStageCompleted, OnTelemetry } from '../level/types'

interface Props {
  def: BGridStageDef
  onCompleted: OnStageCompleted
  onTelemetry?: OnTelemetry
}

interface PuzzleResult {
  keystrokes: number
  par: number
}

function freshState(p: BCheckPuzzle): GridState {
  return { width: p.gridWidth, height: p.gridHeight, cursor: { ...p.start }, keystrokes: 0 }
}

export default function BCheckStage({ def, onCompleted, onTelemetry }: Props) {
  const [puzzleIdx, setPuzzleIdx] = useState(0)
  const [state, setState] = useState<GridState>(() => freshState(def.puzzles[0]))
  const [lastKey, setLastKey] = useState<string | undefined>(undefined)
  const resultsRef = useRef<PuzzleResult[]>([])
  const completedRef = useRef(false)
  const puzzle = def.puzzles[puzzleIdx]

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (completedRef.current) return
      if (!def.allowedKeys.includes(e.key)) return
      e.preventDefault()
      setLastKey(e.key)
      const { state: next } = applyKey(state, { key: e.key }, motionRegistry)
      if (isCursorAt(next, puzzle.goal)) {
        resultsRef.current.push({ keystrokes: next.keystrokes, par: puzzle.par })
        const nextIdx = puzzleIdx + 1
        if (nextIdx >= def.puzzles.length) {
          completedRef.current = true
          setState(next)
          const total = resultsRef.current.reduce(
            (acc, r) => ({ keystrokes: acc.keystrokes + r.keystrokes, par: acc.par + r.par }),
            { keystrokes: 0, par: 0 },
          )
          queueMicrotask(() => onCompleted(total))
        } else {
          setPuzzleIdx(nextIdx)
          setState(freshState(def.puzzles[nextIdx]))
        }
      } else {
        setState(next)
      }
    },
    [def.allowedKeys, def.puzzles, puzzle, puzzleIdx, state, onCompleted],
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  useEffect(() => {
    onTelemetry?.({
      keystrokes: state.keystrokes,
      lastKey,
      mode: 'normal',
      par: puzzle.par,
      progress: { current: puzzleIdx + 1, total: def.puzzles.length, label: 'PUZZLE' },
    })
  }, [state.keystrokes, lastKey, puzzle.par, puzzleIdx, def.puzzles.length, onTelemetry])

  return (
    <GridBoard
      width={puzzle.gridWidth}
      height={puzzle.gridHeight}
      cursor={state.cursor}
      target={puzzle.goal}
    />
  )
}
