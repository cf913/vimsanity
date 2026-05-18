import { describe, it, expect } from 'vitest'
import {
  moveToNextWordBoundary,
  moveToPrevWordBoundary,
  moveToWordEnd,
  findLineStart,
  findLineEnd,
  findLineStartNonBlank,
  moveToNextLine,
  moveToPrevLine,
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

describe('moveToNextLine', () => {
  it('moves down preserving column', () => {
    // 'abc\ndefgh' — pos 1 ('b'), col 1 → next line pos 5 ('e')
    expect(moveToNextLine('abc\ndefgh', 1)).toBe(5)
  })
  it('clamps to last column of shorter line', () => {
    // 'abcdef\nxy' — pos 4 ('e'), col 4 → next line is 'xy' (cols 0-1), clamp to col 1 = pos 8
    expect(moveToNextLine('abcdef\nxy', 4)).toBe(8)
  })
  it('returns same pos when already on last line', () => {
    expect(moveToNextLine('only line', 3)).toBe(3)
  })
  it('handles empty next line', () => {
    // 'a\n\nb' — pos 0, col 0, next line is empty (length 0) → pos 2 (the \n? no, nextLineStart)
    expect(moveToNextLine('a\n\nb', 0)).toBe(2)
  })
})

describe('moveToPrevLine', () => {
  it('moves up preserving column', () => {
    // 'abcde\nfg' — pos 7 ('g'), col 1 → prev line pos 1 ('b')
    expect(moveToPrevLine('abcde\nfg', 7)).toBe(1)
  })
  it('clamps to last column of shorter prev line', () => {
    // 'xy\nabcdef' — pos 8 ('f'), col 5 → prev line 'xy' (cols 0-1), clamp to col 1 = pos 1
    expect(moveToPrevLine('xy\nabcdef', 8)).toBe(1)
  })
  it('returns same pos when already on first line', () => {
    expect(moveToPrevLine('only line', 3)).toBe(3)
  })
  it('handles empty current line above non-empty line', () => {
    // 'abc\n\ndef' — pos 5 ('d'), col 0 → prev line is empty → pos 4 (the empty line's start)
    expect(moveToPrevLine('abc\n\ndef', 5)).toBe(4)
  })
})
