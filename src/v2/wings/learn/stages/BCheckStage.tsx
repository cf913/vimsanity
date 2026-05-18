import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { applyKey, motionRegistry } from '../../../engine/motions'
import { isCursorAt } from '../../../engine/grader'
import type { GridState } from '../../../engine/types'
import type { BCheckPuzzle, BGridStageDef } from '../units/types'

interface Props {
  def: BGridStageDef
  onCompleted: () => void
}

interface PuzzleResult {
  puzzleId: string
  keystrokes: number
  par: number
}

function freshState(p: BCheckPuzzle): GridState {
  return {
    width: p.gridWidth,
    height: p.gridHeight,
    cursor: { ...p.start },
    keystrokes: 0,
  }
}

export default function BCheckStage({ def, onCompleted }: Props) {
  const [puzzleIdx, setPuzzleIdx] = useState(0)
  const [state, setState] = useState<GridState>(() => freshState(def.puzzles[0]))
  const [results, setResults] = useState<PuzzleResult[]>([])
  const completedRef = useRef(false)
  const puzzle = def.puzzles[puzzleIdx]

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (completedRef.current) return
      if (!def.allowedKeys.includes(e.key)) return
      e.preventDefault()
      const { state: next } = applyKey(state, { key: e.key }, motionRegistry)
      if (isCursorAt(next, puzzle.goal)) {
        const result: PuzzleResult = {
          puzzleId: puzzle.id,
          keystrokes: next.keystrokes,
          par: puzzle.par,
        }
        setResults((prev) => [...prev, result])
        const nextIdx = puzzleIdx + 1
        if (nextIdx >= def.puzzles.length) {
          completedRef.current = true
          setState(next)
          queueMicrotask(onCompleted)
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

  const cells = useMemo(() => {
    const rows = []
    for (let y = 0; y < puzzle.gridHeight; y++) {
      const row = []
      for (let x = 0; x < puzzle.gridWidth; x++) {
        const isCursor = state.cursor.x === x && state.cursor.y === y
        const isGoal = puzzle.goal.x === x && puzzle.goal.y === y
        row.push(
          <div
            key={`${x},${y}`}
            className={`flex h-10 w-10 items-center justify-center rounded text-xs ${
              isCursor
                ? 'bg-orange-500 text-black'
                : isGoal
                ? 'bg-green-500 text-black'
                : 'bg-gray-800 text-gray-700'
            }`}
          >
            {isCursor ? '●' : isGoal ? '★' : ''}
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
  }, [puzzle, state.cursor.x, state.cursor.y])

  return (
    <div className="flex flex-col items-center gap-6 p-8">
      <div className="text-sm text-gray-400">
        Puzzle {puzzleIdx + 1} / {def.puzzles.length} · Par{' '}
        <span className="font-mono text-orange-300">{puzzle.par}</span> keystrokes
      </div>
      <div className="flex flex-col gap-1">{cells}</div>
      <div className="text-sm text-gray-300">
        Strokes:{' '}
        <span
          className={`font-mono ${
            state.keystrokes > puzzle.par ? 'text-red-400' : 'text-green-400'
          }`}
        >
          {state.keystrokes}
        </span>
      </div>
      {results.length > 0 && (
        <div className="mt-4 text-xs text-gray-500">
          {results.map((r) => (
            <div key={r.puzzleId}>
              {r.puzzleId}: {r.keystrokes} / par {r.par}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
