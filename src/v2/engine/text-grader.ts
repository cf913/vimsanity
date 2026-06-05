import type { TextState } from './text-types'

export function isCursorAtIndex(state: TextState, target: number): boolean {
  return state.cursorIndex === target
}
