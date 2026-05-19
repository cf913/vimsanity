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
  if (goal.mode !== undefined && state.mode !== goal.mode) return false
  return true
}
