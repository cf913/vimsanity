import type { GridState } from './types'

export interface Point {
  x: number
  y: number
}

export function isCursorAt(state: GridState, target: Point): boolean {
  return state.cursor.x === target.x && state.cursor.y === target.y
}

export function manhattanPar(from: Point, to: Point): number {
  return Math.abs(from.x - to.x) + Math.abs(from.y - to.y)
}
