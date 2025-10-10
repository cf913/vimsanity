import { VimMode } from '../../../utils/constants'

export interface KeyPosition {
  key: string
  label: string
  displayLabel: string
  row: number
  column: number
  width?: number
  isSpecial?: boolean
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

export type ProficiencyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert'

export interface ProficiencyPreset {
  level: ProficiencyLevel
  title: string
  description: string
  highlightedKeys: string[]
}
