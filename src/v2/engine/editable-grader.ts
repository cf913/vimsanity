import type { EditableState, Mode } from './editable-types'

export interface EditableGoal {
  text: string
  cursorIndex?: number
  mode?: Mode
}

export function matchesGoal(state: EditableState, goal: EditableGoal): boolean {
  if (state.text !== goal.text) return false
  if (goal.cursorIndex !== undefined && state.cursorIndex !== goal.cursorIndex) {
    return false
  }
  // Default to requiring normal mode: a vim edit isn't "done" until Esc.
  // Without this, insert-mode puzzles complete mid-insert and the trailing
  // Esc leaks into the next puzzle's keystroke counter.
  const requiredMode: Mode = goal.mode ?? 'normal'
  if (state.mode !== requiredMode) return false
  return true
}
