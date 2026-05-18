import type { KeyEvent } from './types'
import type { TextMotion, TextMotionFn, TextMotionResult, TextState } from './text-types'
import {
  moveToNextWordBoundary,
  moveToPrevWordBoundary,
  moveToWordEnd,
  findLineStart,
  findLineEnd,
  findLineStartNonBlank,
  moveToNextLine,
  moveToPrevLine,
} from './text-utils'

const make = (name: string, keys: string[], fn: TextMotionFn): TextMotion => ({
  name,
  keys,
  apply: fn,
})

function moveCursor(state: TextState, nextIndex: number): TextState {
  return { ...state, cursorIndex: nextIndex }
}

export const w = make('w', ['w'], (s, _e) => ({
  state: moveCursor(s, moveToNextWordBoundary(s.text, s.cursorIndex)),
  consumed: true,
}))

export const b = make('b', ['b'], (s, _e) => ({
  state: moveCursor(s, moveToPrevWordBoundary(s.text, s.cursorIndex)),
  consumed: true,
}))

export const e = make('e', ['e'], (s, _ev) => ({
  state: moveCursor(s, moveToWordEnd(s.text, s.cursorIndex)),
  consumed: true,
}))

export const lineStart = make('lineStart', ['0'], (s, _e) => ({
  state: moveCursor(s, findLineStart(s.text, s.cursorIndex)),
  consumed: true,
}))

export const lineEnd = make('lineEnd', ['$'], (s, _e) => ({
  state: moveCursor(s, findLineEnd(s.text, s.cursorIndex)),
  consumed: true,
}))

export const lineStartNonBlank = make('lineStartNonBlank', ['^'], (s, _e) => ({
  state: moveCursor(s, findLineStartNonBlank(s.text, s.cursorIndex)),
  consumed: true,
}))

export const j = make('j', ['j'], (s, _e) => ({
  state: moveCursor(s, moveToNextLine(s.text, s.cursorIndex)),
  consumed: true,
}))

export const k = make('k', ['k'], (s, _e) => ({
  state: moveCursor(s, moveToPrevLine(s.text, s.cursorIndex)),
  consumed: true,
}))

export const textMotionRegistry: TextMotion[] = [
  w,
  b,
  e,
  lineStart,
  lineEnd,
  lineStartNonBlank,
  j,
  k,
]

export function findTextMotion(
  registry: TextMotion[],
  key: string,
): TextMotion | undefined {
  return registry.find((m) => m.keys.includes(key))
}

export function applyTextKey(
  state: TextState,
  event: KeyEvent,
  registry: TextMotion[],
): TextMotionResult {
  const motion = findTextMotion(registry, event.key)
  if (!motion) return { state, consumed: false }
  const result = motion.apply(state, event)
  if (!result.consumed) return { state, consumed: false }
  return {
    state: { ...result.state, keystrokes: state.keystrokes + 1 },
    consumed: true,
  }
}
