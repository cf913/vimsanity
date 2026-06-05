import { useCallback, useEffect, useRef, useState } from 'react'
import { applyEditableKey, freshNormal } from '../../../engine/editable-engine'
import { matchesGoal } from '../../../engine/editable-grader'
import type { EditableState } from '../../../engine/editable-types'
import type { BEditPuzzle, BEditStageDef } from '../units/types'
import { EditorBoard } from '../level/views/EditorBoard'
import type { OnStageCompleted, OnTelemetry } from '../level/types'

interface Props {
  def: BEditStageDef
  onCompleted: OnStageCompleted
  onTelemetry?: OnTelemetry
}

interface PuzzleResult {
  keystrokes: number
  par: number
}

function freshFor(p: BEditPuzzle): EditableState {
  return freshNormal(p.startText, p.startCursorIndex)
}

export default function BCheckStageEdit({ def, onCompleted, onTelemetry }: Props) {
  const [puzzleIdx, setPuzzleIdx] = useState(0)
  const [state, setState] = useState<EditableState>(() => freshFor(def.puzzles[0]))
  const [lastKey, setLastKey] = useState<string | undefined>(undefined)
  const resultsRef = useRef<PuzzleResult[]>([])
  const completedRef = useRef(false)
  const puzzle = def.puzzles[puzzleIdx]

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (completedRef.current) return
      if (state.mode === 'normal' && !def.allowedKeys.includes(e.key)) return
      e.preventDefault()
      setLastKey(e.key)
      const { state: next } = applyEditableKey(state, { key: e.key })
      if (matchesGoal(next, puzzle.goal)) {
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
          setState(freshFor(def.puzzles[nextIdx]))
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
      mode: state.mode,
      pending: state.pendingOperator ?? undefined,
      par: puzzle.par,
      progress: { current: puzzleIdx + 1, total: def.puzzles.length, label: 'PUZZLE' },
    })
  }, [state.keystrokes, state.mode, state.pendingOperator, lastKey, puzzle.par, puzzleIdx, def.puzzles.length, onTelemetry])

  return (
    <EditorBoard
      text={state.text}
      cursorIndex={state.cursorIndex}
      mode={state.mode}
      goalText={puzzle.goal.text}
      hint={puzzle.hint}
    />
  )
}
