import { describe, it, expect } from 'vitest'
import { deleteRange, insertAt } from './edits'

describe('deleteRange', () => {
  it('deletes the half-open range [start, end)', () => {
    expect(deleteRange('the quick fox', 4, 10)).toBe('the fox')
  })
  it('returns text unchanged when start === end', () => {
    expect(deleteRange('hello', 2, 2)).toBe('hello')
  })
  it('clamps negative start to 0', () => {
    expect(deleteRange('hello', -3, 2)).toBe('llo')
  })
  it('clamps end past length', () => {
    expect(deleteRange('hello', 2, 99)).toBe('he')
  })
  it('swaps args when start > end', () => {
    expect(deleteRange('the quick fox', 10, 4)).toBe('the fox')
  })
})

describe('insertAt', () => {
  it('inserts text at the given index', () => {
    expect(insertAt('foobar', 3, '_BAZ_')).toBe('foo_BAZ_bar')
  })
  it('handles index 0 (prepend)', () => {
    expect(insertAt('bar', 0, 'foo')).toBe('foobar')
  })
  it('handles index === length (append)', () => {
    expect(insertAt('foo', 3, 'bar')).toBe('foobar')
  })
  it('clamps negative index to 0', () => {
    expect(insertAt('bar', -5, 'foo')).toBe('foobar')
  })
  it('clamps oversize index to length', () => {
    expect(insertAt('foo', 10, 'bar')).toBe('foobar')
  })
})
