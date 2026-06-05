import type { KeyEvent } from './types'
import type { EditableResult, EditableState, OperatorKind } from './editable-types'
import { applyTextKey, findTextMotion, textMotionRegistry } from './text-motions'
import {
  enterInsertBefore,
  enterInsertAfter,
  openLineBelow,
  openLineAbove,
  exitInsert,
} from './mode-motions'
import {
  applyOperatorWithMotion,
  applyOperatorOverRange,
  changeToEndOfLine,
  clearLine,
  deleteLine,
  deleteToEndOfLine,
  deleteUnderCursor,
  yankCurrentLine,
} from './operators'
import { putAfter, putBefore } from './put'
import { deleteRange, insertAt } from './edits'
import { findLineStart, innerWordRange, aWordRange } from './text-utils'

export function freshNormal(text: string, cursorIndex: number): EditableState {
  return {
    text,
    cursorIndex,
    mode: 'normal',
    pendingOperator: null,
    pendingTextObject: null,
    keystrokes: 0,
    register: null,
  }
}

function inc(state: EditableState): EditableState {
  return { ...state, keystrokes: state.keystrokes + 1 }
}

function isPrintable(key: string): boolean {
  return key.length === 1
}

function handleInsertMode(state: EditableState, key: string): EditableResult {
  if (key === 'Escape') {
    return { state: inc(exitInsert(state)), consumed: true }
  }
  if (key === 'Backspace') {
    if (state.cursorIndex === 0) {
      return { state: inc(state), consumed: true }
    }
    const lineStart = findLineStart(state.text, state.cursorIndex)
    if (state.cursorIndex === lineStart) {
      // No line-joining in v1; consume the keystroke but don't mutate.
      return { state: inc(state), consumed: true }
    }
    const text = deleteRange(state.text, state.cursorIndex - 1, state.cursorIndex)
    return {
      state: inc({ ...state, text, cursorIndex: state.cursorIndex - 1 }),
      consumed: true,
    }
  }
  if (key === 'Enter') {
    const text = insertAt(state.text, state.cursorIndex, '\n')
    return {
      state: inc({ ...state, text, cursorIndex: state.cursorIndex + 1 }),
      consumed: true,
    }
  }
  if (isPrintable(key)) {
    const text = insertAt(state.text, state.cursorIndex, key)
    return {
      state: inc({ ...state, text, cursorIndex: state.cursorIndex + 1 }),
      consumed: true,
    }
  }
  return { state, consumed: false }
}

function handlePendingOperator(
  state: EditableState,
  key: string,
): EditableResult {
  const op = state.pendingOperator as OperatorKind

  // Resolving a text object: an operator + 'i'/'a' has been captured; this key
  // selects the object (e.g. the 'w' in diw / caw).
  if (state.pendingTextObject) {
    const sel = state.pendingTextObject
    const cleared: EditableState = { ...state, pendingOperator: null, pendingTextObject: null }
    if (key === 'Escape') return { state: inc(cleared), consumed: true }
    if (key === 'w') {
      const { start, end } =
        sel === 'i' ? innerWordRange(state.text, state.cursorIndex) : aWordRange(state.text, state.cursorIndex)
      return { state: inc(applyOperatorOverRange(cleared, op, start, end)), consumed: true }
    }
    // Unsupported object — abort the operator without consuming the key.
    return { state: cleared, consumed: false }
  }

  if (key === 'Escape') {
    return {
      state: inc({ ...state, pendingOperator: null }),
      consumed: true,
    }
  }
  // dd / cc / yy — repeat operator on the current line.
  if (key === op) {
    const cleared: EditableState = { ...state, pendingOperator: null }
    if (op === 'd') {
      return { state: inc(deleteLine(cleared)), consumed: true }
    }
    if (op === 'y') {
      return { state: inc(yankCurrentLine(cleared)), consumed: true }
    }
    // cc: clear the line but keep the newline; enter insert mode at line start.
    const lineCleared = clearLine(cleared)
    return {
      state: inc({ ...lineCleared, mode: 'insert' }),
      consumed: true,
    }
  }
  // Operator + text-object selector (e.g. di… / ca…). Capture i/a, await object.
  if (key === 'i' || key === 'a') {
    return { state: inc({ ...state, pendingTextObject: key }), consumed: true }
  }
  // Operator + motion (e.g. dw, cw, d$).
  const motion = findTextMotion(textMotionRegistry, key)
  if (motion) {
    const cleared: EditableState = { ...state, pendingOperator: null }
    const next = applyOperatorWithMotion(cleared, op, key)
    return { state: inc(next), consumed: true }
  }
  // Unknown follow-up — clear pending state but do NOT consume the key.
  return {
    state: { ...state, pendingOperator: null },
    consumed: false,
  }
}

function handleNormalMode(state: EditableState, key: string): EditableResult {
  switch (key) {
    case 'i':
      return { state: inc(enterInsertBefore(state)), consumed: true }
    case 'a':
      return { state: inc(enterInsertAfter(state)), consumed: true }
    case 'o':
      return { state: inc(openLineBelow(state)), consumed: true }
    case 'O':
      return { state: inc(openLineAbove(state)), consumed: true }
    case 'Escape':
      return { state: inc({ ...state, pendingOperator: null }), consumed: true }
    case 'x':
      return { state: inc(deleteUnderCursor(state)), consumed: true }
    case 'D':
      return { state: inc(deleteToEndOfLine(state)), consumed: true }
    case 'C':
      return { state: inc(changeToEndOfLine(state)), consumed: true }
    case 'd':
      return { state: inc({ ...state, pendingOperator: 'd' }), consumed: true }
    case 'c':
      return { state: inc({ ...state, pendingOperator: 'c' }), consumed: true }
    case 'y':
      return { state: inc({ ...state, pendingOperator: 'y' }), consumed: true }
    case 'p':
      return { state: inc(putAfter(state)), consumed: true }
    case 'P':
      return { state: inc(putBefore(state)), consumed: true }
  }
  // Motion: delegate to the text engine for the cursor update, then re-emit.
  const textResult = applyTextKey(
    { text: state.text, cursorIndex: state.cursorIndex, keystrokes: state.keystrokes },
    { key },
    textMotionRegistry,
  )
  if (!textResult.consumed) return { state, consumed: false }
  return {
    state: {
      ...state,
      cursorIndex: textResult.state.cursorIndex,
      keystrokes: textResult.state.keystrokes,
    },
    consumed: true,
  }
}

export function applyEditableKey(
  state: EditableState,
  event: KeyEvent,
): EditableResult {
  if (state.mode === 'insert') return handleInsertMode(state, event.key)
  if (state.pendingOperator) return handlePendingOperator(state, event.key)
  return handleNormalMode(state, event.key)
}
