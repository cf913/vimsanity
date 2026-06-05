import { describe, it, expect } from 'vitest'
import { applyKey, h, j, k, l, motionRegistry } from './motions'
import type { GridState } from './types'

function state(x: number, y: number, w = 5, hgt = 5, keystrokes = 0): GridState {
  return { width: w, height: hgt, cursor: { x, y }, keystrokes }
}

describe('h motion (left)', () => {
  it('decrements x by 1', () => {
    const r = h.apply(state(2, 2), { key: 'h' })
    expect(r.consumed).toBe(true)
    expect(r.state.cursor).toEqual({ x: 1, y: 2 })
  })
  it('clamps at x=0', () => {
    const r = h.apply(state(0, 2), { key: 'h' })
    expect(r.consumed).toBe(true)
    expect(r.state.cursor).toEqual({ x: 0, y: 2 })
  })
})

describe('l motion (right)', () => {
  it('increments x by 1', () => {
    const r = l.apply(state(2, 2), { key: 'l' })
    expect(r.state.cursor).toEqual({ x: 3, y: 2 })
  })
  it('clamps at x=width-1', () => {
    const r = l.apply(state(4, 2, 5), { key: 'l' })
    expect(r.state.cursor).toEqual({ x: 4, y: 2 })
  })
})

describe('j motion (down)', () => {
  it('increments y by 1', () => {
    const r = j.apply(state(2, 2), { key: 'j' })
    expect(r.state.cursor).toEqual({ x: 2, y: 3 })
  })
  it('clamps at y=height-1', () => {
    const r = j.apply(state(2, 4, 5, 5), { key: 'j' })
    expect(r.state.cursor).toEqual({ x: 2, y: 4 })
  })
})

describe('k motion (up)', () => {
  it('decrements y by 1', () => {
    const r = k.apply(state(2, 2), { key: 'k' })
    expect(r.state.cursor).toEqual({ x: 2, y: 1 })
  })
  it('clamps at y=0', () => {
    const r = k.apply(state(2, 0), { key: 'k' })
    expect(r.state.cursor).toEqual({ x: 2, y: 0 })
  })
})

describe('applyKey dispatcher', () => {
  it('routes h/j/k/l through the registry and increments keystrokes when consumed', () => {
    const r = applyKey(state(2, 2), { key: 'l' }, motionRegistry)
    expect(r.consumed).toBe(true)
    expect(r.state.cursor).toEqual({ x: 3, y: 2 })
    expect(r.state.keystrokes).toBe(1)
  })
  it('does not increment keystrokes when no motion matches', () => {
    const r = applyKey(state(2, 2), { key: 'q' }, motionRegistry)
    expect(r.consumed).toBe(false)
    expect(r.state.cursor).toEqual({ x: 2, y: 2 })
    expect(r.state.keystrokes).toBe(0)
  })
  it('increments keystrokes even when motion is a no-op at the boundary', () => {
    const r = applyKey(state(0, 0), { key: 'h' }, motionRegistry)
    expect(r.consumed).toBe(true)
    expect(r.state.keystrokes).toBe(1)
  })
})
