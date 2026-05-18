import type { KeyEvent } from './types'

export interface TextState {
  text: string
  cursorIndex: number
  keystrokes: number
}

export interface TextMotionResult {
  state: TextState
  consumed: boolean
}

export type TextMotionFn = (state: TextState, event: KeyEvent) => TextMotionResult

export interface TextMotion {
  name: string
  keys: string[]
  apply: TextMotionFn
}
