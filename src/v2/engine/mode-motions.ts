import type { EditableState } from './editable-types'
import { insertAt } from './edits'
import { findLineStart, findLineEnd } from './text-utils'

export function enterInsertBefore(state: EditableState): EditableState {
  return { ...state, mode: 'insert' }
}

export function enterInsertAfter(state: EditableState): EditableState {
  const nextCursor = Math.min(state.text.length, state.cursorIndex + 1)
  return { ...state, mode: 'insert', cursorIndex: nextCursor }
}

export function openLineBelow(state: EditableState): EditableState {
  const lineEnd = findLineEnd(state.text, state.cursorIndex)
  // findLineEnd returns the last non-newline column; insert AFTER that index.
  const insertAtIndex = lineEnd + 1
  const text = insertAt(state.text, insertAtIndex, '\n')
  return {
    ...state,
    text,
    cursorIndex: insertAtIndex + 1,
    mode: 'insert',
  }
}

export function openLineAbove(state: EditableState): EditableState {
  const lineStart = findLineStart(state.text, state.cursorIndex)
  const text = insertAt(state.text, lineStart, '\n')
  return {
    ...state,
    text,
    cursorIndex: lineStart,
    mode: 'insert',
  }
}

export function exitInsert(state: EditableState): EditableState {
  const lineStart = findLineStart(state.text, state.cursorIndex)
  const nextCursor = Math.max(lineStart, state.cursorIndex - 1)
  return { ...state, mode: 'normal', cursorIndex: nextCursor }
}
