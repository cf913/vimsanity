import { useCallback, useEffect, useRef, useState } from 'react'
import { applyTextKey, textMotionRegistry } from '../../../engine/text-motions'
import { isCursorAtIndex } from '../../../engine/text-grader'
import type { TextState } from '../../../engine/text-types'
import type { BTextPuzzle, BTextStageDef } from '../units/types'
import { TextBoard } from '../level/views/TextBoard'
import type { OnStageCompleted, OnTelemetry } from '../level/types'

interface Props {
  def: BTextStageDef
  onCompleted: OnStageCompleted
  onTelemetry?: OnTelemetry
}

interface PuzzleResult {
  keystrokes: number
  par: number
}

function freshState(p: BTextPuzzle): TextState {
  return { text: p.text, cursorIndex: p.startCursorIndex, keystrokes: 0 }
}

export default function BCheckStageText({ def, onCompleted, onTelemetry }: Props) {
  const [puzzleIdx, setPuzzleIdx] = useState(0)
  const [state, setState] = useState<TextState>(() => freshState(def.puzzles[0]))
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
      const { state: next } = applyTextKey(state, { key: e.key }, textMotionRegistry)
      if (isCursorAtIndex(next, puzzle.goalIndex)) {
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
    <TextBoard
      text={puzzle.text}
      cursorIndex={state.cursorIndex}
      isTarget={(i) => i === puzzle.goalIndex}
      caption="Reach the highlighted character under par."
    />
  )
}
