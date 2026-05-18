import { describe, it, expect } from 'vitest'
import {
  moveToNextWordBoundary,
  moveToPrevWordBoundary,
  moveToWordEnd,
  findLineStart,
  findLineEnd,
  findLineStartNonBlank,
} from './text-utils'

describe('moveToNextWordBoundary', () => {
  it('moves from start of first word to start of second word', () => {
    expect(moveToNextWordBoundary('the quick fox', 0)).toBe(4)
  })
  it('skips punctuation as its own word', () => {
    expect(moveToNextWordBoundary('foo, bar', 0)).toBe(3)
    expect(moveToNextWordBoundary('foo, bar', 3)).toBe(5)
  })
  it('returns currentPos when no boundary remains', () => {
    expect(moveToNextWordBoundary('hello', 4)).toBe(4)
  })
  it('crosses newlines', () => {
    expect(moveToNextWordBoundary('foo\nbar', 0)).toBe(4)
  })
})

describe('moveToPrevWordBoundary', () => {
  it('moves from start of second word back to start of first word', () => {
    expect(moveToPrevWordBoundary('the quick fox', 10)).toBe(4)
  })
  it('returns 0 when no earlier boundary exists', () => {
    expect(moveToPrevWordBoundary('hello', 2)).toBe(0)
  })
  it('handles punctuation as a word boundary', () => {
    expect(moveToPrevWordBoundary('foo, bar', 5)).toBe(3)
  })
})

describe('moveToWordEnd', () => {
  it('moves to the end of the current word', () => {
    expect(moveToWordEnd('the quick fox', 0)).toBe(2)
  })
  it('jumps to the end of the next word when already at end', () => {
    expect(moveToWordEnd('the quick fox', 2)).toBe(8)
  })
  it('treats punctuation as its own word ending', () => {
    expect(moveToWordEnd('foo, bar', 0)).toBe(2)
    expect(moveToWordEnd('foo, bar', 2)).toBe(3)
  })
})

describe('findLineStart', () => {
  it('returns 0 for a position on the first line', () => {
    expect(findLineStart('hello world', 6)).toBe(0)
  })
  it('returns the index after the previous newline for later lines', () => {
    expect(findLineStart('foo\nbar\nbaz', 5)).toBe(4)
    expect(findLineStart('foo\nbar\nbaz', 9)).toBe(8)
  })
})

describe('findLineEnd', () => {
  it('returns the last index of a single-line string', () => {
    expect(findLineEnd('hello', 2)).toBe(4)
  })
  it('returns the index of the char before the newline', () => {
    expect(findLineEnd('foo\nbar', 1)).toBe(2)
    expect(findLineEnd('foo\nbar', 5)).toBe(6)
  })
})

describe('findLineStartNonBlank', () => {
  it('returns the first non-space index of the line', () => {
    expect(findLineStartNonBlank('   hello', 5)).toBe(3)
  })
  it('returns the original line start when the line has no leading spaces', () => {
    expect(findLineStartNonBlank('hello', 2)).toBe(0)
  })
})
