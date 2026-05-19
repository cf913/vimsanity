import type { KeyEvent } from './types'

export type Mode = 'normal' | 'insert'
export type OperatorKind = 'd' | 'c' | 'y'

export interface Register {
  text: string
  linewise: boolean
}

export interface EditableState {
  text: string
  cursorIndex: number
  mode: Mode
  pendingOperator: OperatorKind | null
  keystrokes: number
  register: Register | null
}

export interface EditableResult {
  state: EditableState
  consumed: boolean
}

export type EditableFn = (state: EditableState, event: KeyEvent) => EditableResult
