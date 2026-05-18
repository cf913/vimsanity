import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { applyTextKey, textMotionRegistry } from '../../../engine/text-motions'
import { isCursorAtIndex } from '../../../engine/text-grader'
import type { TextState } from '../../../engine/text-types'
import type { BTextPuzzle, BTextStageDef } from '../units/types'

interface Props {
  def: BTextStageDef
  onCompleted: () => void
}

interface PuzzleResult {
  puzzleId: string
  keystrokes: number
  par: number
}

function freshState(p: BTextPuzzle): TextState {
  return { text: p.text, cursorIndex: p.startCursorIndex, keystrokes: 0 }
}

export default function BCheckStageText({ def, onCompleted }: Props) {
  const [puzzleIdx, setPuzzleIdx] = useState(0)
  const [state, setState] = useState<TextState>(() => freshState(def.puzzles[0]))
  const [results, setResults] = useState<PuzzleResult[]>([])
  const completedRef = useRef(false)
  const puzzle = def.puzzles[puzzleIdx]

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (completedRef.current) return
      if (!def.allowedKeys.includes(e.key)) return
      e.preventDefault()
      const { state: next } = applyTextKey(state, { key: e.key }, textMotionRegistry)
      if (isCursorAtIndex(next, puzzle.goalIndex)) {
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

  const rendered = useMemo(() => {
    const out: React.ReactNode[] = []
    for (let i = 0; i < puzzle.text.length; i++) {
      const ch = puzzle.text[i]
      const isCursor = state.cursorIndex === i
      const isGoal = puzzle.goalIndex === i
      out.push(
        <span
          key={i}
          className={
            isCursor
              ? 'bg-orange-500 text-black'
              : isGoal
              ? 'bg-green-500 text-black'
              : 'text-gray-300'
          }
        >
          {ch === '\n' ? <br /> : ch === ' ' ? ' ' : ch}
        </span>,
      )
    }
    return out
  }, [puzzle.text, puzzle.goalIndex, state.cursorIndex])

  return (
    <div className="flex flex-col items-center gap-6 p-8">
      <div className="text-sm text-gray-400">
        Puzzle {puzzleIdx + 1} / {def.puzzles.length} · Par{' '}
        <span className="font-mono text-orange-300">{puzzle.par}</span> keystrokes
      </div>
      <div className="max-w-3xl whitespace-pre-wrap font-mono text-base leading-relaxed">
        {rendered}
      </div>
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
