import { describe, it, expect } from 'vitest'
import { matchesGoal } from './editable-grader'
import { freshNormal } from './editable-engine'

describe('matchesGoal', () => {
  it('matches when text alone is required and matches', () => {
    expect(matchesGoal(freshNormal('hello', 0), { text: 'hello' })).toBe(true)
  })
  it('rejects on text mismatch', () => {
    expect(matchesGoal(freshNormal('hello', 0), { text: 'helo' })).toBe(false)
  })
  it('matches cursorIndex when specified', () => {
    expect(matchesGoal(freshNormal('hello', 3), { text: 'hello', cursorIndex: 3 })).toBe(true)
    expect(matchesGoal(freshNormal('hello', 2), { text: 'hello', cursorIndex: 3 })).toBe(false)
  })
  it('matches mode when specified', () => {
    expect(matchesGoal({ ...freshNormal('hi', 0), mode: 'normal' }, { text: 'hi', mode: 'normal' })).toBe(true)
    expect(matchesGoal({ ...freshNormal('hi', 0), mode: 'insert' }, { text: 'hi', mode: 'normal' })).toBe(false)
  })
})
