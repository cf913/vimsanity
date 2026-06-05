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
  const yanked = state.text.slice(idx, idx + 1)
  const text = deleteRange(state.text, idx, idx + 1)
  const cursorIndex = clampToLine(text, idx)
  return { ...state, text, cursorIndex, register: { text: yanked, linewise: false } }
}

export function deleteToEndOfLine(state: EditableState): EditableState {
  const end = findLineEnd(state.text, state.cursorIndex)
  const yanked = state.text.slice(state.cursorIndex, end + 1)
  const text = deleteRange(state.text, state.cursorIndex, end + 1)
  if (text.length === 0) {
    return { ...state, text, cursorIndex: 0, register: { text: yanked, linewise: false } }
  }
  const lineStart = findLineStart(text, state.cursorIndex)
  const cursorIndex = Math.max(lineStart, state.cursorIndex - 1)
  return { ...state, text, cursorIndex, register: { text: yanked, linewise: false } }
}

export function changeToEndOfLine(state: EditableState): EditableState {
  const end = findLineEnd(state.text, state.cursorIndex)
  const yanked = state.text.slice(state.cursorIndex, end + 1)
  const text = deleteRange(state.text, state.cursorIndex, end + 1)
  return { ...state, text, mode: 'insert', register: { text: yanked, linewise: false } }
}

export function deleteLine(state: EditableState): EditableState {
  const lineStart = findLineStart(state.text, state.cursorIndex)
  const nlAhead = state.text.indexOf('\n', state.cursorIndex)
  if (nlAhead !== -1) {
    const lineContent = state.text.slice(lineStart, nlAhead)
    const text = deleteRange(state.text, lineStart, nlAhead + 1)
    const cursorIndex = Math.min(text.length, lineStart)
    return { ...state, text, cursorIndex, register: { text: lineContent, linewise: true } }
  }
  if (lineStart === 0) {
    return { ...state, text: '', cursorIndex: 0, register: { text: state.text, linewise: true } }
  }
  const lineContent = state.text.slice(lineStart)
  const text = state.text.slice(0, lineStart - 1)
  const cursorIndex = findLineStart(text, text.length)
  return { ...state, text, cursorIndex, register: { text: lineContent, linewise: true } }
}

// Clear current line's content but KEEP the newline. Used by cc.
export function clearLine(state: EditableState): EditableState {
  const lineStart = findLineStart(state.text, state.cursorIndex)
  const nl = state.text.indexOf('\n', state.cursorIndex)
  const rangeEnd = nl === -1 ? state.text.length : nl
  const lineContent = state.text.slice(lineStart, rangeEnd)
  const text = deleteRange(state.text, lineStart, rangeEnd)
  return { ...state, text, cursorIndex: lineStart, register: { text: lineContent, linewise: false } }
}

// Yank the current line content linewise — non-destructive. Used by yy.
export function yankCurrentLine(state: EditableState): EditableState {
  const lineStart = findLineStart(state.text, state.cursorIndex)
  const nl = state.text.indexOf('\n', state.cursorIndex)
  const lineContent = nl === -1
    ? state.text.slice(lineStart)
    : state.text.slice(lineStart, nl)
  return { ...state, register: { text: lineContent, linewise: true } }
}

/**
 * Apply an operator over an explicit half-open [start, end) range — the basis
 * for text objects (diw/daw/ciw/caw). `c` enters insert mode at the range start.
 */
export function applyOperatorOverRange(
  state: EditableState,
  op: OperatorKind,
  start: number,
  end: number,
): EditableState {
  if (start >= end) {
    if (op === 'y') return state
    return { ...state, mode: op === 'c' ? 'insert' : 'normal' }
  }
  const yanked = state.text.slice(start, end)
  const register = { text: yanked, linewise: false }
  if (op === 'y') {
    return { ...state, cursorIndex: start, register }
  }
  const text = deleteRange(state.text, start, end)
  if (op === 'c') {
    // Insert mode types at the range start exactly — never clamp it back (which
    // would corrupt a change whose object sits at the end of the line).
    return { ...state, text, cursorIndex: start, mode: 'insert', register }
  }
  const cursorIndex = clampToLine(text, start)
  return { ...state, text, cursorIndex, mode: 'normal', register }
}

export function applyOperatorWithMotion(
  state: EditableState,
  op: OperatorKind,
  motionKey: string,
): EditableState {
  // Vim quirk: `cw` is treated as `ce`. `yw` and `dw` keep their natural range.
  const effectiveMotionKey =
    op === 'c' && motionKey === 'w' ? 'e' : motionKey
  const motion = findTextMotion(textMotionRegistry, effectiveMotionKey)
  if (!motion) return state
  const target = motion.apply(
    { text: state.text, cursorIndex: state.cursorIndex, keystrokes: 0 },
    { key: effectiveMotionKey },
  ).state.cursorIndex
  if (target === state.cursorIndex) {
    if (op === 'y') return state
    return { ...state, mode: op === 'c' ? 'insert' : 'normal' }
  }
  const start = Math.min(state.cursorIndex, target)
  const endRaw = Math.max(state.cursorIndex, target)
  const end = INCLUSIVE_MOTIONS.has(effectiveMotionKey)
    ? Math.min(state.text.length, endRaw + 1)
    : endRaw
  const yanked = state.text.slice(start, end)
  const register = { text: yanked, linewise: false }
  if (op === 'y') {
    // Yank only — no deletion, no mode change, cursor stays put.
    return { ...state, register }
  }
  const text = deleteRange(state.text, start, end)
  const cursorIndex = clampToLine(text, start)
  return {
    ...state,
    text,
    cursorIndex,
    mode: op === 'c' ? 'insert' : 'normal',
    register,
  }
}
