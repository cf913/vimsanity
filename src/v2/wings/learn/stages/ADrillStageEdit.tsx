import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { applyEditableKey, freshNormal } from '../../../engine/editable-engine'
import { matchesGoal } from '../../../engine/editable-grader'
import type { EditableState } from '../../../engine/editable-types'
import type { AEditDrillDef, EditChallenge } from '../units/types'

interface Props {
  def: AEditDrillDef
  onCompleted: () => void
}

function freshFor(c: EditChallenge): EditableState {
  return freshNormal(c.startText, c.startCursorIndex)
}

function isEventKey(e: KeyboardEvent): string {
  return e.key
}

export default function ADrillStageEdit({ def, onCompleted }: Props) {
  const [idx, setIdx] = useState(0)
  const [state, setState] = useState<EditableState>(() => freshFor(def.challenges[0]))
  const completedRef = useRef(false)
  const challenge = def.challenges[idx]

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (completedRef.current) return
      const key = isEventKey(e)
      // Insert mode accepts anything; normal mode is filtered.
      if (state.mode === 'normal' && !def.allowedKeys.includes(key)) return
      e.preventDefault()
      const { state: next } = applyEditableKey(state, { key })
      if (matchesGoal(next, challenge.goal)) {
        const nextIdx = idx + 1
        if (nextIdx >= def.challenges.length) {
          completedRef.current = true
          setState(next)
          queueMicrotask(onCompleted)
        } else {
          setIdx(nextIdx)
          setState(freshFor(def.challenges[nextIdx]))
        }
      } else {
        setState(next)
      }
    },
    [def.allowedKeys, def.challenges, state, idx, challenge.goal, onCompleted],
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
    () => renderText(challenge.goal.text, -1, 'normal'),
    [challenge.goal.text],
  )

  return (
    <div className="flex flex-col items-center gap-6 p-8">
      <div className="text-sm text-gray-400">
        Drill {idx + 1} / {def.challenges.length} ·{' '}
        <span className="text-orange-300">{challenge.hint}</span>
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
      <div className="text-xs text-gray-500">
        Mode:{' '}
        <span className="font-mono text-orange-300">{state.mode.toUpperCase()}</span>
        {state.pendingOperator && (
          <>
            {' '}
            · Pending:{' '}
            <span className="font-mono text-orange-300">{state.pendingOperator}</span>
          </>
        )}
      </div>
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
