import { VimMode } from '../../utils/constants'

export interface MotionContext {
  setCursorIndex: (position: number) => void
  cursorIndex: number
  setVirtualColumn: (column: number) => void
  virtualColumn: number
  setMode: (mode: VimMode) => void
  mode: VimMode
  text: string
  setText: (text: string) => void
}

export interface VimMotion {
  key: string
  description: string
  category: 'movement' | 'editing' | 'mode' | 'text-object'
  execute: (context: MotionContext, args?: any) => void
  condition?: (context: MotionContext) => boolean
}

export type MotionRegistry = Record<string, VimMotion>
