import type { Point } from '../../../engine/grader'
import type { EditableGoal } from '../../../engine/editable-grader'

export interface AGridDrillDef {
  kind: 'a-drill-grid'
  gridWidth: number
  gridHeight: number
  startCursor: Point
  targetCount: number
  allowedKeys: string[]
}

export interface ATextDrillDef {
  kind: 'a-drill-text'
  text: string
  startCursorIndex: number
  targetCount: number
  allowedKeys: string[]
}

export interface EditChallenge {
  id: string
  hint: string
  startText: string
  startCursorIndex: number
  goal: EditableGoal
}

export interface AEditDrillDef {
  kind: 'a-drill-edit'
  challenges: EditChallenge[]
  allowedKeys: string[]
}

export type AStageDef = AGridDrillDef | ATextDrillDef | AEditDrillDef

export interface BCheckPuzzle {
  id: string
  gridWidth: number
  gridHeight: number
  start: Point
  goal: Point
  par: number
}

export interface BGridStageDef {
  kind: 'b-check-cursor-puzzles'
  puzzles: BCheckPuzzle[]
  allowedKeys: string[]
}

export interface BTextPuzzle {
  id: string
  text: string
  startCursorIndex: number
  goalIndex: number
  par: number
}

export interface BTextStageDef {
  kind: 'b-check-text-puzzles'
  puzzles: BTextPuzzle[]
  allowedKeys: string[]
}

export interface BEditPuzzle {
  id: string
  hint: string
  startText: string
  startCursorIndex: number
  goal: EditableGoal
  par: number
}

export interface BEditStageDef {
  kind: 'b-check-edit-puzzles'
  puzzles: BEditPuzzle[]
  allowedKeys: string[]
}

export type BStageDef = BGridStageDef | BTextStageDef | BEditStageDef

export interface Unit {
  id: string
  title: string
  motionLabel: string
  aStage: AStageDef
  bStage: BStageDef
}
