import type { EditableState } from './editable-types'
import { insertAt } from './edits'
import { findLineStart, findLineEnd } from './text-utils'

export function putAfter(state: EditableState): EditableState {
  if (!state.register) return state
  const { text: regText, linewise } = state.register
  if (linewise) {
    const lineEnd = findLineEnd(state.text, state.cursorIndex)
    const insertIdx = lineEnd + 1
    const text = insertAt(state.text, insertIdx, '\n' + regText)
    return { ...state, text, cursorIndex: insertIdx + 1 }
  }
  // Charwise: insert AFTER cursor (i.e. at cursor + 1).
  const insertIdx = Math.min(state.text.length, state.cursorIndex + 1)
  const text = insertAt(state.text, insertIdx, regText)
  const cursorIndex = regText.length === 0
    ? state.cursorIndex
    : insertIdx + regText.length - 1
  return { ...state, text, cursorIndex }
}

export function putBefore(state: EditableState): EditableState {
  if (!state.register) return state
  const { text: regText, linewise } = state.register
  if (linewise) {
    const lineStart = findLineStart(state.text, state.cursorIndex)
    const text = insertAt(state.text, lineStart, regText + '\n')
    return { ...state, text, cursorIndex: lineStart }
  }
  // Charwise: insert BEFORE cursor.
  const text = insertAt(state.text, state.cursorIndex, regText)
  const cursorIndex = regText.length === 0
    ? state.cursorIndex
    : state.cursorIndex + regText.length - 1
  return { ...state, text, cursorIndex }
}
