import { describe, it, expect } from 'vitest'
import {
  deleteUnderCursor,
  deleteToEndOfLine,
  changeToEndOfLine,
  applyOperatorWithMotion,
  deleteLine,
} from './operators'
import type { EditableState } from './editable-types'

function s(text: string, cursorIndex: number): EditableState {
  return {
    text,
    cursorIndex,
    mode: 'normal',
    pendingOperator: null,
    keystrokes: 0,
    register: null,
  }
}

describe('deleteUnderCursor (x)', () => {
  it('removes the character at the cursor', () => {
    const r = deleteUnderCursor(s('hello', 2))
    expect(r.text).toBe('helo')
    expect(r.cursorIndex).toBe(2)
  })
  it('clamps cursor back when removing the last char of a line', () => {
    const r = deleteUnderCursor(s('hi', 1))
    expect(r.text).toBe('h')
    expect(r.cursorIndex).toBe(0)
  })
  it('is a no-op on an empty buffer', () => {
    const r = deleteUnderCursor(s('', 0))
    expect(r.text).toBe('')
    expect(r.cursorIndex).toBe(0)
  })
})

describe('deleteToEndOfLine (D)', () => {
  it('deletes from cursor to end of line, not including newline', () => {
    const r = deleteToEndOfLine(s('hello world\nnext', 6))
    expect(r.text).toBe('hello \nnext')
    expect(r.cursorIndex).toBe(5)
  })
  it('handles a single-line buffer', () => {
    const r = deleteToEndOfLine(s('hello', 2))
    expect(r.text).toBe('he')
    expect(r.cursorIndex).toBe(1)
  })
})

describe('changeToEndOfLine (C)', () => {
  it('deletes to end of line and enters insert mode', () => {
    const r = changeToEndOfLine(s('hello world', 6))
    expect(r.text).toBe('hello ')
    expect(r.mode).toBe('insert')
    expect(r.cursorIndex).toBe(6)
  })
})

describe('deleteLine (dd)', () => {
  it('deletes the only line and leaves empty text', () => {
    const r = deleteLine(s('alone', 2))
    expect(r.text).toBe('')
    expect(r.cursorIndex).toBe(0)
  })
  it('deletes a middle line including its trailing newline', () => {
    const r = deleteLine(s('alpha\nbeta\ngamma', 7))
    expect(r.text).toBe('alpha\ngamma')
    expect(r.cursorIndex).toBe(6)
  })
  it('deletes the last line including its leading newline', () => {
    const r = deleteLine(s('alpha\nbeta', 7))
    expect(r.text).toBe('alpha')
    expect(r.cursorIndex).toBe(0)
  })
  it('deletes the first line of a multi-line buffer', () => {
    const r = deleteLine(s('alpha\nbeta', 2))
    expect(r.text).toBe('beta')
    expect(r.cursorIndex).toBe(0)
  })
})

describe('applyOperatorWithMotion (d + w)', () => {
  it('deletes the range from cursor to the motion target', () => {
    const start = s('the quick brown', 0)
    const r = applyOperatorWithMotion(start, 'd', 'w')
    expect(r.text).toBe('quick brown')
    expect(r.cursorIndex).toBe(0)
    expect(r.mode).toBe('normal')
  })
  it('with a backward motion, deletes the range and moves cursor back', () => {
    const start = s('the quick brown', 10)
    const r = applyOperatorWithMotion(start, 'd', 'b')
    expect(r.text).toBe('the brown')
    expect(r.cursorIndex).toBe(4)
  })
})

describe('applyOperatorWithMotion (c + w)', () => {
  it('deletes only the word (not trailing whitespace) and enters insert mode', () => {
    // Vim quirk: cw is treated as ce. Two spaces remain so the user can
    // re-type the word in place without retyping the trailing space.
    const start = s('the quick brown', 4)
    const r = applyOperatorWithMotion(start, 'c', 'w')
    expect(r.text).toBe('the  brown')
    expect(r.cursorIndex).toBe(4)
    expect(r.mode).toBe('insert')
  })
})

describe('applyOperatorWithMotion (e is inclusive)', () => {
  it('d e includes the end-of-word character', () => {
    const start = s('the quick brown', 4)
    const r = applyOperatorWithMotion(start, 'd', 'e')
    expect(r.text).toBe('the  brown')
    expect(r.cursorIndex).toBe(4)
  })
})

describe('applyOperatorWithMotion ($)', () => {
  it('d $ removes through end of line inclusive', () => {
    const start = s('keep drop now', 5)
    const r = applyOperatorWithMotion(start, 'd', '$')
    expect(r.text).toBe('keep ')
    // Cursor clamps back to last char on the (now-shorter) line.
    expect(r.cursorIndex).toBe(4)
  })
})
