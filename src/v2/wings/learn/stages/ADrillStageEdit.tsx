import { useCallback, useEffect, useRef, useState } from 'react'
import { applyEditableKey, freshNormal } from '../../../engine/editable-engine'
import { matchesGoal } from '../../../engine/editable-grader'
import type { EditableState } from '../../../engine/editable-types'
import type { AEditDrillDef, EditChallenge } from '../units/types'
import { EditorBoard } from '../level/views/EditorBoard'
import type { OnStageCompleted, OnTelemetry } from '../level/types'

interface Props {
  def: AEditDrillDef
  onCompleted: OnStageCompleted
  onTelemetry?: OnTelemetry
}

function freshFor(c: EditChallenge): EditableState {
  return freshNormal(c.startText, c.startCursorIndex)
}

export default function ADrillStageEdit({ def, onCompleted, onTelemetry }: Props) {
  const [idx, setIdx] = useState(0)
  const [state, setState] = useState<EditableState>(() => freshFor(def.challenges[0]))
  const [lastKey, setLastKey] = useState<string | undefined>(undefined)
  const completedRef = useRef(false)
  const challenge = def.challenges[idx]

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (completedRef.current) return
      const key = e.key
      // Insert mode accepts anything; normal mode is filtered.
      if (state.mode === 'normal' && !def.allowedKeys.includes(key)) return
      e.preventDefault()
      setLastKey(key)
      const { state: next } = applyEditableKey(state, { key })
      if (matchesGoal(next, challenge.goal)) {
        const nextIdx = idx + 1
        if (nextIdx >= def.challenges.length) {
          completedRef.current = true
          setState(next)
          queueMicrotask(() => onCompleted())
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

  useEffect(() => {
    onTelemetry?.({
      keystrokes: state.keystrokes,
      lastKey,
      mode: state.mode,
      pending: state.pendingOperator ?? undefined,
      progress: { current: idx + 1, total: def.challenges.length, label: 'DRILL' },
    })
  }, [state.keystrokes, state.mode, state.pendingOperator, lastKey, idx, def.challenges.length, onTelemetry])

  return (
    <EditorBoard
      text={state.text}
      cursorIndex={state.cursorIndex}
      mode={state.mode}
      goalText={challenge.goal.text}
      hint={challenge.hint}
    />
  )
}
