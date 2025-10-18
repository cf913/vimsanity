import { VimMode } from '../../../utils/constants'

export interface KeyPosition {
  key: string
  label: string
  displayLabel: string
  shiftLabel?: string // Optional shift character (e.g., '!' for key '1')
  row: number
  column: number
  width?: number
  isSpecial?: boolean
  offsetX?: number // Horizontal offset for staggered layout
}

export interface VimCommand {
  key: string
  modes: VimMode[]
  description: string
  example: {
    before: string
    after: string
  }
  category: 'movement' | 'editing' | 'mode' | 'search' | 'delete' | 'history'
  colorClass: string
}

export type ProficiencyLevel = 'beginner' | 'intermediate' | 'advanced' | 'vim-btw'

export interface ProficiencyPreset {
  level: ProficiencyLevel
  title: string
  description: string
  highlightedKeys: string[]
}
