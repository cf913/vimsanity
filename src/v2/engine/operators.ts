import type { EditableState, OperatorKind } from './editable-types'
import { deleteRange } from './edits'
import { findLineStart, findLineEnd } from './text-utils'
import { findTextMotion, textMotionRegistry } from './text-motions'

// Motions whose deletion range includes the target character (vim semantics).
const INCLUSIVE_MOTIONS = new Set(['e', '$'])

function clampToLine(text: string, idx: number): number {
  if (text.length === 0) return 0
  const lineStart = findLineStart(text, idx)
  const nl = text.indexOf('\n', lineStart)
  const lineEnd = nl === -1 ? text.length - 1 : Math.max(lineStart, nl - 1)
  return Math.min(Math.max(0, idx), Math.max(lineStart, lineEnd))
}

export function deleteUnderCursor(state: EditableState): EditableState {
  if (state.text.length === 0) return state
  const idx = state.cursorIndex
  if (idx < 0 || idx >= state.text.length) return state
  const text = deleteRange(state.text, idx, idx + 1)
  const cursorIndex = clampToLine(text, idx)
  return { ...state, text, cursorIndex }
}

export function deleteToEndOfLine(state: EditableState): EditableState {
  const end = findLineEnd(state.text, state.cursorIndex)
  // findLineEnd points at the last char on the line; end-exclusive is end + 1.
  const text = deleteRange(state.text, state.cursorIndex, end + 1)
  if (text.length === 0) return { ...state, text, cursorIndex: 0 }
  const lineStart = findLineStart(text, state.cursorIndex)
  // After deletion, step the cursor back one within the (now-shorter) line.
  const cursorIndex = Math.max(lineStart, state.cursorIndex - 1)
  return { ...state, text, cursorIndex }
}

export function changeToEndOfLine(state: EditableState): EditableState {
  const end = findLineEnd(state.text, state.cursorIndex)
  const text = deleteRange(state.text, state.cursorIndex, end + 1)
  return { ...state, text, mode: 'insert' }
}

export function deleteLine(state: EditableState): EditableState {
  const lineStart = findLineStart(state.text, state.cursorIndex)
  const nlAhead = state.text.indexOf('\n', state.cursorIndex)
  if (nlAhead !== -1) {
    // First or middle line — delete content + trailing newline.
    const text = deleteRange(state.text, lineStart, nlAhead + 1)
    const cursorIndex = Math.min(text.length, lineStart)
    return { ...state, text, cursorIndex }
  }
  if (lineStart === 0) {
    // Only line in the buffer — delete to end of text.
    return { ...state, text: '', cursorIndex: 0 }
  }
  // Last line of multi-line — delete leading newline + content.
  const text = state.text.slice(0, lineStart - 1)
  const cursorIndex = findLineStart(text, text.length)
  return { ...state, text, cursorIndex }
}

// Clear current line's content but KEEP the newline. Used by cc.
export function clearLine(state: EditableState): EditableState {
  const lineStart = findLineStart(state.text, state.cursorIndex)
  const nl = state.text.indexOf('\n', state.cursorIndex)
  const rangeEnd = nl === -1 ? state.text.length : nl
  const text = deleteRange(state.text, lineStart, rangeEnd)
  return { ...state, text, cursorIndex: lineStart }
}

export function applyOperatorWithMotion(
  state: EditableState,
  op: OperatorKind,
  motionKey: string,
): EditableState {
  // Vim quirk: `cw` is treated as `ce` so it doesn't eat trailing whitespace.
  const effectiveMotionKey =
    op === 'c' && motionKey === 'w' ? 'e' : motionKey
  const motion = findTextMotion(textMotionRegistry, effectiveMotionKey)
  if (!motion) return state
  const target = motion.apply(
    { text: state.text, cursorIndex: state.cursorIndex, keystrokes: 0 },
    { key: effectiveMotionKey },
  ).state.cursorIndex
  // No-op motion (target === cursor): consume the operator but make no change.
  if (target === state.cursorIndex) {
    return { ...state, mode: op === 'c' ? 'insert' : 'normal' }
  }
  const start = Math.min(state.cursorIndex, target)
  const endRaw = Math.max(state.cursorIndex, target)
  const end = INCLUSIVE_MOTIONS.has(effectiveMotionKey)
    ? Math.min(state.text.length, endRaw + 1)
    : endRaw
  const text = deleteRange(state.text, start, end)
  const cursorIndex = clampToLine(text, start)
  return {
    ...state,
    text,
    cursorIndex,
    mode: op === 'c' ? 'insert' : 'normal',
  }
}
