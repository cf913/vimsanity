import { describe, it, expect } from 'vitest'
import {
  enterInsertBefore,
  enterInsertAfter,
  openLineBelow,
  openLineAbove,
  exitInsert,
} from './mode-motions'
import type { EditableState } from './editable-types'

function state(
  text: string,
  cursorIndex: number,
  mode: 'normal' | 'insert' = 'normal',
): EditableState {
  return { text, cursorIndex, mode, pendingOperator: null, keystrokes: 0, register: null }
}

describe('enterInsertBefore (i)', () => {
  it('switches to insert mode and keeps cursor', () => {
    const r = enterInsertBefore(state('hello', 2))
    expect(r.mode).toBe('insert')
    expect(r.cursorIndex).toBe(2)
    expect(r.text).toBe('hello')
  })
})

describe('enterInsertAfter (a)', () => {
  it('switches to insert mode and advances cursor by 1', () => {
    const r = enterInsertAfter(state('hello', 2))
    expect(r.mode).toBe('insert')
    expect(r.cursorIndex).toBe(3)
  })
  it('clamps to text length at end of buffer', () => {
    const r = enterInsertAfter(state('hi', 1))
    expect(r.cursorIndex).toBe(2)
  })
})

describe('openLineBelow (o)', () => {
  it('inserts a newline after the current line and positions cursor at start of new line', () => {
    const r = openLineBelow(state('foo\nbar', 1))
    expect(r.text).toBe('foo\n\nbar')
    expect(r.cursorIndex).toBe(4)
    expect(r.mode).toBe('insert')
  })
  it('appends a newline at end of buffer when cursor is on last line', () => {
    const r = openLineBelow(state('foo', 2))
    expect(r.text).toBe('foo\n')
    expect(r.cursorIndex).toBe(4)
    expect(r.mode).toBe('insert')
  })
})

describe('openLineAbove (O)', () => {
  it('inserts a newline before the current line and positions cursor at start of new line', () => {
    const r = openLineAbove(state('foo\nbar', 4))
    expect(r.text).toBe('foo\n\nbar')
    expect(r.cursorIndex).toBe(4)
    expect(r.mode).toBe('insert')
  })
  it('prepends a newline when cursor is on first line', () => {
    const r = openLineAbove(state('foo', 1))
    expect(r.text).toBe('\nfoo')
    expect(r.cursorIndex).toBe(0)
    expect(r.mode).toBe('insert')
  })
})

describe('exitInsert (Esc)', () => {
  it('switches mode to normal and moves cursor back one within the line', () => {
    const r = exitInsert(state('hello', 3, 'insert'))
    expect(r.mode).toBe('normal')
    expect(r.cursorIndex).toBe(2)
  })
  it('does not move cursor past the start of the line', () => {
    const r = exitInsert(state('foo\nbar', 4, 'insert'))
    expect(r.mode).toBe('normal')
    expect(r.cursorIndex).toBe(4)
  })
  it('does not move cursor below 0', () => {
    const r = exitInsert(state('foo', 0, 'insert'))
    expect(r.mode).toBe('normal')
    expect(r.cursorIndex).toBe(0)
  })
})
