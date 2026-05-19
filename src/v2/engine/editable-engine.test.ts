import { describe, it, expect } from 'vitest'
import { applyEditableKey, freshNormal } from './editable-engine'
import type { EditableState } from './editable-types'

function drive(start: EditableState, keys: string[]): EditableState {
  return keys.reduce(
    (acc, k) => applyEditableKey(acc, { key: k }).state,
    start,
  )
}

describe('applyEditableKey — motions', () => {
  it('routes w through the text motion registry in normal mode', () => {
    const r = applyEditableKey(freshNormal('the quick fox', 0), { key: 'w' })
    expect(r.consumed).toBe(true)
    expect(r.state.cursorIndex).toBe(4)
    expect(r.state.keystrokes).toBe(1)
  })
})

describe('applyEditableKey — insert mode entries', () => {
  it('i enters insert mode and counts as a keystroke', () => {
    const r = applyEditableKey(freshNormal('hello', 2), { key: 'i' })
    expect(r.state.mode).toBe('insert')
    expect(r.state.keystrokes).toBe(1)
  })
  it('a advances cursor and enters insert mode', () => {
    const r = applyEditableKey(freshNormal('hello', 2), { key: 'a' })
    expect(r.state.cursorIndex).toBe(3)
    expect(r.state.mode).toBe('insert')
  })
  it('o opens a line below and enters insert mode', () => {
    const r = applyEditableKey(freshNormal('foo', 1), { key: 'o' })
    expect(r.state.text).toBe('foo\n')
    expect(r.state.mode).toBe('insert')
    expect(r.state.cursorIndex).toBe(4)
  })
})

describe('applyEditableKey — insert mode behavior', () => {
  it('inserts a printable char and advances cursor', () => {
    const after = drive(freshNormal('he', 2), ['a', 'y'])
    expect(after.text).toBe('hey')
    expect(after.mode).toBe('insert')
    expect(after.cursorIndex).toBe(3)
  })
  it('Escape exits insert mode and moves cursor back one', () => {
    const after = drive(freshNormal('he', 2), ['a', 'y', 'Escape'])
    expect(after.text).toBe('hey')
    expect(after.mode).toBe('normal')
    expect(after.cursorIndex).toBe(2)
  })
  it('Enter inserts a newline in insert mode', () => {
    const after = drive(freshNormal('ab', 1), ['i', 'Enter'])
    expect(after.text).toBe('a\nb')
    expect(after.cursorIndex).toBe(2)
  })
  it('Backspace removes the char before the cursor', () => {
    const after = drive(freshNormal('abc', 1), ['i', 'Backspace'])
    expect(after.text).toBe('bc')
    expect(after.cursorIndex).toBe(0)
  })
  it('Backspace at start of line is a no-op (no line-joining in v1)', () => {
    const after = drive(freshNormal('a\nb', 2), ['i', 'Backspace'])
    expect(after.text).toBe('a\nb')
  })
  it('keystrokes increment for every consumed insert-mode key', () => {
    const after = drive(freshNormal('', 0), ['i', 'h', 'i'])
    expect(after.keystrokes).toBe(3)
  })
})

describe('applyEditableKey — operators', () => {
  it('x deletes the character under the cursor', () => {
    const after = drive(freshNormal('hello', 2), ['x'])
    expect(after.text).toBe('helo')
    expect(after.cursorIndex).toBe(2)
  })
  it('dw composes operator + motion', () => {
    const after = drive(freshNormal('the quick brown', 0), ['d', 'w'])
    expect(after.text).toBe('quick brown')
    expect(after.pendingOperator).toBe(null)
  })
  it('dd deletes the current line', () => {
    const after = drive(freshNormal('alpha\nbeta\ngamma', 7), ['d', 'd'])
    expect(after.text).toBe('alpha\ngamma')
  })
  it('cc clears the current line content but keeps the newline, enters insert mode', () => {
    const after = drive(freshNormal('alpha\nbeta\ngamma', 7), ['c', 'c'])
    expect(after.text).toBe('alpha\n\ngamma')
    expect(after.cursorIndex).toBe(6)
    expect(after.mode).toBe('insert')
  })
  it('cw deletes only the word and enters insert mode', () => {
    // cw → ce semantics: trailing space stays so user can type replacement.
    const after = drive(freshNormal('the old fox', 4), ['c', 'w'])
    expect(after.text).toBe('the  fox')
    expect(after.mode).toBe('insert')
  })
  it('typing the replacement after cw produces the natural single-space result', () => {
    // The whole "change old to new" flow: cw + n + e + w + Escape on 'the |old fox'.
    const after = drive(freshNormal('the old fox', 4), [
      'c', 'w', 'n', 'e', 'w', 'Escape',
    ])
    expect(after.text).toBe('the new fox')
    expect(after.mode).toBe('normal')
  })
  it('D deletes to end of line', () => {
    const after = drive(freshNormal('keep me drop this', 7), ['D'])
    expect(after.text).toBe('keep me')
  })
  it('Escape during pending operator clears the pending state', () => {
    const after = drive(freshNormal('hello', 0), ['d', 'Escape'])
    expect(after.pendingOperator).toBe(null)
    expect(after.mode).toBe('normal')
  })
})

describe('applyEditableKey — keystroke accounting', () => {
  it('does not count an unmapped key in normal mode', () => {
    const r = applyEditableKey(freshNormal('hello', 0), { key: 'Q' })
    expect(r.consumed).toBe(false)
    expect(r.state.keystrokes).toBe(0)
  })
  it('counts every consumed normal-mode key including the operator prefix', () => {
    const after = drive(freshNormal('the quick brown', 0), ['d', 'w'])
    expect(after.keystrokes).toBe(2)
  })
})

describe('applyEditableKey — yank/put integration', () => {
  it('yw followed by P duplicates the word before itself', () => {
    const after = drive(freshNormal('red blue', 0), ['y', 'w', 'P'])
    expect(after.text).toBe('red red blue')
    expect(after.cursorIndex).toBe(3)
  })
  it('yy followed by p duplicates the current line below', () => {
    const after = drive(freshNormal('alpha\nbeta\ngamma', 6), ['y', 'y', 'p'])
    expect(after.text).toBe('alpha\nbeta\nbeta\ngamma')
  })
  it('yy followed by P duplicates the current line above', () => {
    const after = drive(freshNormal('header\nbody', 0), ['y', 'y', 'P'])
    expect(after.text).toBe('header\nheader\nbody')
  })
  it('y followed by Escape clears the pending state', () => {
    const after = drive(freshNormal('hello', 0), ['y', 'Escape'])
    expect(after.pendingOperator).toBe(null)
  })
  it('dd populates the register so subsequent p re-inserts the deleted line', () => {
    const after = drive(freshNormal('alpha\nbeta\ngamma', 6), ['d', 'd', 'p'])
    expect(after.text).toBe('alpha\ngamma\nbeta')
  })
  it('x followed by p swaps adjacent characters (classic vim idiom)', () => {
    // x removes char at cursor → cursor lands on next char. p pastes the
    // removed char AFTER the cursor, which is the position of what used
    // to be the char to the right. Net effect: the two original chars
    // swap places.
    const after = drive(freshNormal('abc', 0), ['x', 'p'])
    expect(after.text).toBe('bac')
  })
  it('p with an empty register is a silent no-op (but counts as a keystroke)', () => {
    const after = drive(freshNormal('hi', 0), ['p'])
    expect(after.text).toBe('hi')
    expect(after.cursorIndex).toBe(0)
    expect(after.keystrokes).toBe(1)
  })
  it('y at end of buffer with no motion target consumes the operator without erroring', () => {
    // 'w' from end of single word with no following word is a no-op motion.
    const after = drive(freshNormal('end', 2), ['y', 'w'])
    expect(after.text).toBe('end')
    expect(after.pendingOperator).toBe(null)
  })
})
