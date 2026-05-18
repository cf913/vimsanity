import { describe, it, expect } from 'vitest'
import { isCursorAtIndex } from './text-grader'
import type { TextState } from './text-types'

function state(text: string, cursorIndex: number): TextState {
  return { text, cursorIndex, keystrokes: 0 }
}

describe('isCursorAtIndex', () => {
  it('returns true when cursorIndex matches target', () => {
    expect(isCursorAtIndex(state('hello', 3), 3)).toBe(true)
  })
  it('returns false otherwise', () => {
    expect(isCursorAtIndex(state('hello', 3), 2)).toBe(false)
    expect(isCursorAtIndex(state('hello', 3), 4)).toBe(false)
  })
})
