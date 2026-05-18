import type { Point } from '../../../engine/grader'

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

export type AStageDef = AGridDrillDef | ATextDrillDef

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

export type BStageDef = BGridStageDef | BTextStageDef

export interface Unit {
  id: string
  title: string
  motionLabel: string
  aStage: AStageDef
  bStage: BStageDef
}
