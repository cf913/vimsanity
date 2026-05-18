import { describe, it, expect } from 'vitest'
import {
  applyTextKey,
  w, b, e,
  lineStart, lineEnd, lineStartNonBlank,
  j, k,
  textMotionRegistry,
} from './text-motions'
import type { TextState } from './text-types'

function state(text: string, cursorIndex: number, keystrokes = 0): TextState {
  return { text, cursorIndex, keystrokes }
}

describe('w motion (next word)', () => {
  it('moves to the start of the next word', () => {
    const r = w.apply(state('the quick fox', 0), { key: 'w' })
    expect(r.consumed).toBe(true)
    expect(r.state.cursorIndex).toBe(4)
  })
  it('stays at end of text when no more words', () => {
    const r = w.apply(state('hello', 4), { key: 'w' })
    expect(r.state.cursorIndex).toBe(4)
  })
})

describe('b motion (previous word)', () => {
  it('moves to the start of the previous word', () => {
    const r = b.apply(state('the quick fox', 10), { key: 'b' })
    expect(r.state.cursorIndex).toBe(4)
  })
  it('clamps to 0', () => {
    const r = b.apply(state('hello', 2), { key: 'b' })
    expect(r.state.cursorIndex).toBe(0)
  })
})

describe('e motion (word end)', () => {
  it('moves to the end of the current word', () => {
    const r = e.apply(state('the quick fox', 0), { key: 'e' })
    expect(r.state.cursorIndex).toBe(2)
  })
})

describe('lineStart motion (0)', () => {
  it('moves to the start of the current line', () => {
    const r = lineStart.apply(state('foo\nbar baz', 8), { key: '0' })
    expect(r.state.cursorIndex).toBe(4)
  })
})

describe('lineEnd motion ($)', () => {
  it('moves to the last column of the current line', () => {
    const r = lineEnd.apply(state('hello\nworld', 1), { key: '$' })
    expect(r.state.cursorIndex).toBe(4)
  })
  it('handles a single-line buffer', () => {
    const r = lineEnd.apply(state('hello', 1), { key: '$' })
    expect(r.state.cursorIndex).toBe(4)
  })
})

describe('lineStartNonBlank motion (^)', () => {
  it('moves past leading spaces', () => {
    const r = lineStartNonBlank.apply(state('   hello', 5), { key: '^' })
    expect(r.state.cursorIndex).toBe(3)
  })
})

describe('j motion (down a line)', () => {
  it('moves to the same column on the next line', () => {
    const r = j.apply(state('abc\ndefgh', 1), { key: 'j' })
    expect(r.state.cursorIndex).toBe(5)
  })
  it('stays put on the last line', () => {
    const r = j.apply(state('only line', 3), { key: 'j' })
    expect(r.state.cursorIndex).toBe(3)
  })
})

describe('k motion (up a line)', () => {
  it('moves to the same column on the previous line', () => {
    const r = k.apply(state('abcde\nfg', 7), { key: 'k' })
    expect(r.state.cursorIndex).toBe(1)
  })
  it('stays put on the first line', () => {
    const r = k.apply(state('only line', 3), { key: 'k' })
    expect(r.state.cursorIndex).toBe(3)
  })
})

describe('applyTextKey dispatcher', () => {
  it('routes through registry and increments keystrokes', () => {
    const r = applyTextKey(state('the quick fox', 0), { key: 'w' }, textMotionRegistry)
    expect(r.consumed).toBe(true)
    expect(r.state.cursorIndex).toBe(4)
    expect(r.state.keystrokes).toBe(1)
  })
  it('does not increment for unmapped keys', () => {
    const r = applyTextKey(state('hello', 0), { key: 'z' }, textMotionRegistry)
    expect(r.consumed).toBe(false)
    expect(r.state.keystrokes).toBe(0)
  })
  it('increments keystrokes even when motion is a no-op (e.g. w at end of text)', () => {
    const r = applyTextKey(state('hello', 4), { key: 'w' }, textMotionRegistry)
    expect(r.consumed).toBe(true)
    expect(r.state.keystrokes).toBe(1)
  })
})
