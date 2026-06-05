import { describe, it, expect } from 'vitest'
import { innerWordRange, aWordRange } from './text-utils'
import { applyEditableKey, freshNormal } from './editable-engine'
import type { EditableState } from './editable-types'

describe('innerWordRange', () => {
  it('selects the word under the cursor (mid-word)', () => {
    expect(innerWordRange('foo bar baz', 5)).toEqual({ start: 4, end: 7 }) // "bar"
  })
  it('selects a leading/trailing word', () => {
    expect(innerWordRange('foo bar', 0)).toEqual({ start: 0, end: 3 })
    expect(innerWordRange('foo bar', 6)).toEqual({ start: 4, end: 7 })
  })
  it('does not cross a newline', () => {
    expect(innerWordRange('ab\ncd', 1)).toEqual({ start: 0, end: 2 })
  })
})

describe('aWordRange', () => {
  it('includes trailing whitespace', () => {
    expect(aWordRange('foo bar baz', 5)).toEqual({ start: 4, end: 8 }) // "bar "
  })
  it('falls back to leading whitespace at end of line', () => {
    expect(aWordRange('foo bar', 5)).toEqual({ start: 3, end: 7 }) // " bar"
  })
})

// Drive a key sequence through the editable engine.
function run(text: string, cursor: number, keys: string[]): EditableState {
  let state = freshNormal(text, cursor)
  for (const key of keys) state = applyEditableKey(state, { key }).state
  return state
}

describe('text objects in the editable engine', () => {
  it('diw deletes the inner word (spaces stay), mid-word', () => {
    const s = run('foo bar baz', 5, ['d', 'i', 'w'])
    expect(s.text).toBe('foo  baz')
    expect(s.mode).toBe('normal')
    expect(s.keystrokes).toBe(3)
  })

  it('daw deletes the word and its trailing space', () => {
    const s = run('foo bar baz', 5, ['d', 'a', 'w'])
    expect(s.text).toBe('foo baz')
    expect(s.mode).toBe('normal')
  })

  it('ciw changes the whole word from mid-word', () => {
    const s = run('the kat sat', 5, ['c', 'i', 'w', 'c', 'a', 't', 'Escape'])
    expect(s.text).toBe('the cat sat')
    expect(s.mode).toBe('normal')
    expect(s.keystrokes).toBe(7)
  })

  it('ciw works on a word at the end of the line', () => {
    const s = run('fix the bg', 8, ['c', 'i', 'w', 'f', 'g', 'Escape'])
    expect(s.text).toBe('fix the fg')
    expect(s.mode).toBe('normal')
  })

  it('caw replaces a word including its space', () => {
    const s = run('say hi there', 5, ['c', 'a', 'w', 'h', 'e', 'y', ' ', 'Escape'])
    expect(s.text).toBe('say hey there')
    expect(s.mode).toBe('normal')
  })

  it('yiw yanks the inner word without deleting, then p duplicates it', () => {
    const s = run('go fast', 1, ['y', 'i', 'w'])
    expect(s.text).toBe('go fast')
    expect(s.register?.text).toBe('go')
  })

  it('Escape aborts a pending text object', () => {
    const s = run('foo bar', 5, ['d', 'i', 'Escape'])
    expect(s.text).toBe('foo bar')
    expect(s.pendingOperator).toBeNull()
    expect(s.pendingTextObject).toBeNull()
  })

  it('does not break dd (operator doubled)', () => {
    const s = run('a\nb\nc', 2, ['d', 'd'])
    expect(s.text).toBe('a\nc')
  })
})
