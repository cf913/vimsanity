export interface GridState {
  width: number
  height: number
  cursor: { x: number; y: number }
  keystrokes: number
}

export interface KeyEvent {
  key: string
}

export interface MotionResult {
  state: GridState
  consumed: boolean
}

export type GridMotionFn = (state: GridState, event: KeyEvent) => MotionResult

export interface GridMotion {
  name: string
  keys: string[]
  apply: GridMotionFn
}
