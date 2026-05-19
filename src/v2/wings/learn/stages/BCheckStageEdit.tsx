import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { applyEditableKey, freshNormal } from '../../../engine/editable-engine'
import { matchesGoal } from '../../../engine/editable-grader'
import type { EditableState } from '../../../engine/editable-types'
import type { BEditPuzzle, BEditStageDef } from '../units/types'

interface Props {
  def: BEditStageDef
  onCompleted: () => void
}

interface PuzzleResult {
  puzzleId: string
  keystrokes: number
  par: number
}

function freshFor(p: BEditPuzzle): EditableState {
  return freshNormal(p.startText, p.startCursorIndex)
}

export default function BCheckStageEdit({ def, onCompleted }: Props) {
  const [puzzleIdx, setPuzzleIdx] = useState(0)
  const [state, setState] = useState<EditableState>(() => freshFor(def.puzzles[0]))
  const [results, setResults] = useState<PuzzleResult[]>([])
  const completedRef = useRef(false)
  const puzzle = def.puzzles[puzzleIdx]

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (completedRef.current) return
      if (state.mode === 'normal' && !def.allowedKeys.includes(e.key)) return
      e.preventDefault()
      const { state: next } = applyEditableKey(state, { key: e.key })
      if (matchesGoal(next, puzzle.goal)) {
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

  const renderedCurrent = useMemo(
    () => renderText(state.text, state.cursorIndex, state.mode),
    [state.text, state.cursorIndex, state.mode],
  )
  const renderedGoal = useMemo(
    () => renderText(puzzle.goal.text, -1, 'normal'),
    [puzzle.goal.text],
  )

  return (
    <div className="flex flex-col items-center gap-6 p-8">
      <div className="text-sm text-gray-400">
        Puzzle {puzzleIdx + 1} / {def.puzzles.length} · Par{' '}
        <span className="font-mono text-orange-300">{puzzle.par}</span> keystrokes ·{' '}
        <span className="text-gray-500">{puzzle.hint}</span>
      </div>
      <div className="flex w-full max-w-3xl flex-col gap-2 font-mono text-base">
        <div className="text-xs uppercase tracking-wider text-gray-500">You</div>
        <div className="whitespace-pre-wrap rounded border border-gray-800 bg-gray-900/50 p-4 leading-relaxed">
          {renderedCurrent}
        </div>
        <div className="mt-3 text-xs uppercase tracking-wider text-gray-500">Goal</div>
        <div className="whitespace-pre-wrap rounded border border-green-900 bg-green-950/30 p-4 leading-relaxed text-green-300">
          {renderedGoal}
        </div>
      </div>
      <div className="text-sm text-gray-300">
        Strokes:{' '}
        <span
          className={`font-mono ${
            state.keystrokes > puzzle.par ? 'text-red-400' : 'text-green-400'
          }`}
        >
          {state.keystrokes}
        </span>{' '}
        · Mode:{' '}
        <span className="font-mono text-orange-300">{state.mode.toUpperCase()}</span>
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

function renderText(text: string, cursorIndex: number, mode: 'normal' | 'insert') {
  const out: React.ReactNode[] = []
  const len = text.length
  for (let i = 0; i <= len; i++) {
    const isCursor = i === cursorIndex
    if (i === len) {
      if (isCursor) {
        out.push(
          <span key={`cursor-${i}`} className="bg-orange-500 text-black">
            {mode === 'insert' ? '|' : ' '}
          </span>,
        )
      }
      continue
    }
    const ch = text[i]
    out.push(
      <span
        key={i}
        className={
          isCursor
            ? mode === 'insert'
              ? 'border-l-2 border-orange-400 text-gray-100'
              : 'bg-orange-500 text-black'
            : 'text-gray-300'
        }
      >
        {ch === '\n' ? <br /> : ch === ' ' ? ' ' : ch}
      </span>,
    )
  }
  return out
}
