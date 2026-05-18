import type { GridMotion, GridMotionFn, GridState, KeyEvent, MotionResult } from './types'

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v))
}

function moveCursor(state: GridState, dx: number, dy: number): GridState {
  return {
    ...state,
    cursor: {
      x: clamp(state.cursor.x + dx, 0, state.width - 1),
      y: clamp(state.cursor.y + dy, 0, state.height - 1),
    },
  }
}

const makeMotion = (name: string, keys: string[], fn: GridMotionFn): GridMotion => ({
  name,
  keys,
  apply: fn,
})

export const h = makeMotion('h', ['h'], (s, _e) => ({
  state: moveCursor(s, -1, 0),
  consumed: true,
}))

export const l = makeMotion('l', ['l'], (s, _e) => ({
  state: moveCursor(s, 1, 0),
  consumed: true,
}))

export const j = makeMotion('j', ['j'], (s, _e) => ({
  state: moveCursor(s, 0, 1),
  consumed: true,
}))

export const k = makeMotion('k', ['k'], (s, _e) => ({
  state: moveCursor(s, 0, -1),
  consumed: true,
}))

export const motionRegistry: GridMotion[] = [h, j, k, l]

export function findMotion(
  registry: GridMotion[],
  key: string,
): GridMotion | undefined {
  return registry.find((m) => m.keys.includes(key))
}

export function applyKey(
  state: GridState,
  event: KeyEvent,
  registry: GridMotion[],
): MotionResult {
  const motion = findMotion(registry, event.key)
  if (!motion) return { state, consumed: false }
  const result = motion.apply(state, event)
  if (!result.consumed) return { state, consumed: false }
  return {
    state: { ...result.state, keystrokes: state.keystrokes + 1 },
    consumed: true,
  }
}
