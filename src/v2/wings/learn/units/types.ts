import type { Point } from '../../../engine/grader'

export interface AStageDef {
  kind: 'a-drill-grid'
  gridWidth: number
  gridHeight: number
  startCursor: Point
  targetCount: number
  allowedKeys: string[]
}

export interface BCheckPuzzle {
  id: string
  gridWidth: number
  gridHeight: number
  start: Point
  goal: Point
  par: number
}

export interface BStageDef {
  kind: 'b-check-cursor-puzzles'
  puzzles: BCheckPuzzle[]
  allowedKeys: string[]
}

export interface Unit {
  id: string
  title: string
  motionLabel: string
  aStage: AStageDef
  bStage: BStageDef
}
