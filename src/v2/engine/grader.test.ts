import { describe, it, expect } from 'vitest'
import { isCursorAt, manhattanPar } from './grader'
import type { GridState } from './types'

function state(x: number, y: number): GridState {
  return { width: 10, height: 10, cursor: { x, y }, keystrokes: 0 }
}

describe('isCursorAt', () => {
  it('returns true when cursor equals target', () => {
    expect(isCursorAt(state(3, 4), { x: 3, y: 4 })).toBe(true)
  })
  it('returns false when cursor differs', () => {
    expect(isCursorAt(state(3, 4), { x: 3, y: 5 })).toBe(false)
    expect(isCursorAt(state(3, 4), { x: 2, y: 4 })).toBe(false)
  })
})

describe('manhattanPar', () => {
  it('computes |dx| + |dy|', () => {
    expect(manhattanPar({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(7)
    expect(manhattanPar({ x: 5, y: 5 }, { x: 2, y: 1 })).toBe(7)
  })
  it('returns 0 when start equals goal', () => {
    expect(manhattanPar({ x: 2, y: 2 }, { x: 2, y: 2 })).toBe(0)
  })
})
