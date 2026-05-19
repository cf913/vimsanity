import { describe, it, expect } from 'vitest'
import { putAfter, putBefore } from './put'
import type { EditableState, Register } from './editable-types'

function st(
  text: string,
  cursorIndex: number,
  register: Register | null,
): EditableState {
  return {
    text,
    cursorIndex,
    mode: 'normal',
    pendingOperator: null,
    keystrokes: 0,
    register,
  }
}

describe('putAfter (p) — charwise', () => {
  it('inserts after the cursor and moves cursor to last inserted char', () => {
    const r = putAfter(st('xy', 0, { text: 'AB', linewise: false }))
    expect(r.text).toBe('xABy')
    expect(r.cursorIndex).toBe(2)
  })
  it('appends when cursor is at end of buffer', () => {
    const r = putAfter(st('xy', 1, { text: 'AB', linewise: false }))
    expect(r.text).toBe('xyAB')
    expect(r.cursorIndex).toBe(3)
  })
  it('is a no-op when register is null', () => {
    const r = putAfter(st('xy', 0, null))
    expect(r.text).toBe('xy')
    expect(r.cursorIndex).toBe(0)
  })
})

describe('putAfter (p) — linewise', () => {
  it('inserts the register content as a new line below current line', () => {
    const r = putAfter(st('alpha\nbeta', 2, { text: 'NEW', linewise: true }))
    expect(r.text).toBe('alpha\nNEW\nbeta')
    expect(r.cursorIndex).toBe(6)
  })
  it('appends a new line at end of buffer when on the last line', () => {
    const r = putAfter(st('alpha', 2, { text: 'NEW', linewise: true }))
    expect(r.text).toBe('alpha\nNEW')
    expect(r.cursorIndex).toBe(6)
  })
})

describe('putBefore (P) — charwise', () => {
  it('inserts before the cursor and moves cursor to last inserted char', () => {
    const r = putBefore(st('xy', 1, { text: 'AB', linewise: false }))
    expect(r.text).toBe('xABy')
    expect(r.cursorIndex).toBe(2)
  })
  it('handles cursor at index 0', () => {
    const r = putBefore(st('xy', 0, { text: 'AB', linewise: false }))
    expect(r.text).toBe('ABxy')
    expect(r.cursorIndex).toBe(1)
  })
})

describe('putBefore (P) — linewise', () => {
  it('inserts the register content as a new line above current line', () => {
    const r = putBefore(st('alpha\nbeta', 7, { text: 'NEW', linewise: true }))
    expect(r.text).toBe('alpha\nNEW\nbeta')
    expect(r.cursorIndex).toBe(6)
  })
  it('prepends a new line at start of buffer', () => {
    const r = putBefore(st('alpha', 2, { text: 'NEW', linewise: true }))
    expect(r.text).toBe('NEW\nalpha')
    expect(r.cursorIndex).toBe(0)
  })
})
