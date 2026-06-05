const PUNCT = /[.,;:!?()[\]{}'"<>/\\|+=\-*&^%$#@!~`]/

function isPunct(c: string | undefined): boolean {
  return c !== undefined && c !== '_' && PUNCT.test(c)
}

function isSpace(c: string | undefined): boolean {
  return c !== undefined && /\s/.test(c)
}

function isWordBoundary(text: string, index: number): boolean {
  if (index <= 0 || index >= text.length) return false
  const cur = text[index]
  const prev = text[index - 1]
  if (cur === '\n' && prev === '\n') return true
  if (isSpace(prev) && !isPunct(cur) && !isSpace(cur)) return true
  if (isPunct(cur) && !isPunct(prev)) return true
  if (!isPunct(cur) && isPunct(prev) && !isSpace(cur)) return true
  return false
}

function isWordEnd(text: string, index: number): boolean {
  if (index < 0 || index >= text.length) return false
  const cur = text[index]
  const next = text[index + 1]
  if (index === text.length - 1) return true
  if (isSpace(next) && !isPunct(cur) && !isSpace(cur)) return true
  if (isPunct(cur) && !isPunct(next)) return true
  if (isPunct(next) && !isPunct(cur) && !isSpace(cur)) return true
  return false
}

export function moveToNextWordBoundary(text: string, pos: number): number {
  for (let i = pos + 1; i < text.length; i++) {
    if (isWordBoundary(text, i)) return i
  }
  return pos
}

export function moveToPrevWordBoundary(text: string, pos: number): number {
  for (let i = pos - 1; i > 0; i--) {
    if (isWordBoundary(text, i)) return i
  }
  return 0
}

export function moveToWordEnd(text: string, pos: number): number {
  for (let i = pos + 1; i < text.length; i++) {
    if (isWordEnd(text, i)) return i
  }
  return pos
}

// ── Text objects (iw / aw) ──────────────────────────────────────────────
// A char belongs to one of three classes; an "inner word" is the maximal run
// of the same class around the cursor (matching vim's w/b/e word model).
type CharKind = 'space' | 'punct' | 'word'

function charKind(c: string | undefined): CharKind {
  if (c === undefined || isSpace(c)) return 'space'
  if (isPunct(c)) return 'punct'
  return 'word'
}

/** Half-open [start, end) character range. */
export interface TextRange {
  start: number
  end: number
}

/** `iw` — the run of same-class characters under the cursor (end-exclusive). */
export function innerWordRange(text: string, index: number): TextRange {
  if (text.length === 0) return { start: 0, end: 0 }
  const i = Math.max(0, Math.min(index, text.length - 1))
  const kind = charKind(text[i])
  let start = i
  let end = i + 1
  while (start > 0 && charKind(text[start - 1]) === kind) start--
  while (end < text.length && charKind(text[end]) === kind) end++
  return { start, end }
}

/**
 * `aw` — the inner word plus its trailing whitespace (same line). If there's no
 * trailing whitespace, the leading whitespace is taken instead, matching vim.
 */
export function aWordRange(text: string, index: number): TextRange {
  const inner = innerWordRange(text, index)
  if (text.length === 0) return inner
  let { start } = inner
  let end = inner.end
  let extended = false
  while (end < text.length && text[end] !== '\n' && isSpace(text[end])) {
    end++
    extended = true
  }
  if (!extended) {
    while (start > 0 && text[start - 1] !== '\n' && isSpace(text[start - 1])) start--
  }
  return { start, end }
}

export function findLineStart(text: string, pos: number): number {
  return text.lastIndexOf('\n', pos - 1) + 1
}

export function findLineEnd(text: string, pos: number): number {
  const nl = text.indexOf('\n', pos)
  return nl === -1 ? text.length - 1 : nl - 1
}

export function findLineStartNonBlank(text: string, pos: number): number {
  let i = findLineStart(text, pos)
  while (i < text.length && text[i] === ' ') i++
  return i
}

export function moveToNextLine(text: string, pos: number): number {
  const currentLineEnd = text.indexOf('\n', pos)
  if (currentLineEnd === -1) return pos
  const nextLineStart = currentLineEnd + 1
  const currentLineStart = text.lastIndexOf('\n', pos - 1) + 1
  const currentCol = pos - currentLineStart
  const nextLineEndOrEof = text.indexOf('\n', nextLineStart)
  const nextLineLength =
    (nextLineEndOrEof === -1 ? text.length : nextLineEndOrEof) - nextLineStart
  if (currentCol === 0 && nextLineLength === 0) return nextLineStart
  return nextLineStart + Math.min(currentCol, Math.max(0, nextLineLength - 1))
}

export function moveToPrevLine(text: string, pos: number): number {
  const currentLineStart = text.lastIndexOf('\n', pos - 1) + 1
  if (currentLineStart === 0) return pos
  const currentCol = pos - currentLineStart
  const prevLineStart = text.lastIndexOf('\n', currentLineStart - 2) + 1
  const prevLineEnd = currentLineStart - 1
  const prevLineLength = prevLineEnd - prevLineStart
  if (currentCol === 0 && prevLineLength === 0) return prevLineStart
  return prevLineStart + Math.min(currentCol, Math.max(0, prevLineLength - 1))
}
