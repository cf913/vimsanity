// Text processing utilities

/**
 * Process text to handle punctuation as separate words (like in Vim)
 */
export const processTextForVim = (text: string): string[] => {
  // Just split the text into characters
  return text.split('')
}

/**
 * Check if a character at the given index is at a word boundary
 */
export const isWordBoundary = (text: string[], index: number): boolean => {
  // Check if index is out of bounds
  if (index <= 0 || index >= text.length) return false

  // Get the current and previous characters
  const current = text[index]
  const prev = text[index - 1]

  // Word boundary conditions
  const isPrevSpace = /\s/.test(prev)
  const isPrevPunctuation =
    /[.,;:!?()[\]{}'"<>\/\\|+=\-*&^%$#@!~`]/.test(prev) && prev !== '_'
  const isCurrentPunctuation =
    /[.,;:!?()[\]{}'"<>\/\\|+=\-*&^%$#@!~`]/.test(current) && current !== '_'
  const isCurrentSpace = /\s/.test(current)

  // Start of a word is:
  // 1. After a space
  // 2. A punctuation after a non-punctuation
  // 4. A non-space and non-punctuation after a punctuation
  return (
    (isPrevSpace && !isCurrentPunctuation) ||
    (isCurrentPunctuation && !isPrevPunctuation) ||
    (!isCurrentPunctuation && isPrevPunctuation && !isCurrentSpace)
  )
}

/**
 * Check if a character at the given index is at a word end
 */
export const isWordEnd = (text: string[], index: number): boolean => {
  if (index < 0) return false
  const current = text[index]
  const next = text[index + 1]

  // Word end conditions
  const isNextSpace = /\s/.test(next)
  const isNextEndOfLine = index >= text.length - 1
  const isCurrentPunctuation =
    /[.,;:!?()[\]{}'"<>\/\\|+=\-*&^%$#@!~`]/.test(current) && current !== '_'
  const isNextPunctuation =
    /[.,;:!?()[\]{}'"<>\/\\|+=\-*&^%$#@!~`]/.test(next) && next !== '_'
  const isCurrentSpace = /\s/.test(current)

  // End of a word is:
  // 1. Before a space
  // 2. A punctuation before a non-punctuation
  // 3. A non-punctuation and non-space before a punctuation
  return (
    isNextEndOfLine ||
    (isNextSpace && !isCurrentPunctuation) ||
    (!isNextPunctuation && isCurrentPunctuation) ||
    (isNextPunctuation && !isCurrentPunctuation && !isCurrentSpace)
  )
}

/**
 * Move to the next word boundary
 */
export const moveToNextWordBoundary = (
  text: string[],
  currentPos: number,
): number => {
  for (let i = currentPos + 1; i < text.length; i++) {
    if (isWordBoundary(text, i)) {
      return i
    }
  }
  return currentPos
}

/**
 * Move to the end of current or next word
 */
export const moveToWordEnd = (text: string[], currentPos: number): number => {
  for (let i = currentPos + 1; i < text.length; i++) {
    if (isWordEnd(text, i)) {
      return i
    }
  }
  return currentPos
}

/**
 * Move to the previous word boundary
 */
export const moveToPrevWordBoundary = (
  text: string[],
  currentPos: number,
): number => {
  for (let i = currentPos - 1; i > 0; i--) {
    if (isWordBoundary(text, i)) {
      return i
    }
  }
  return 0
}

/**
 * Find the start of the current line
 */
export const findLineStart = (text: string, currentPos: number): number => {
  const lineStart = text.lastIndexOf('\n', currentPos - 1) + 1
  return lineStart === 0 && text.charAt(0) === '\n' ? 1 : lineStart
}

/**
 * Find the end of the current line
 */
export const findLineEnd = (text: string, currentPos: number): number => {
  const endOfLine = text.indexOf('\n', currentPos)
  return endOfLine === -1 ? text.length - 1 : endOfLine - 1
}

export const findPrevLineEnd = (text: string, currentPos: number): number => {
  const lineStart = findLineStart(text, currentPos)
  return lineStart - 1
}

export const findNextLineStart = (text: string, currentPos: number): number => {
  const lineEnd = findLineEnd(text, currentPos)
  return lineEnd + 1
}

export const isLastLine = (text: string, currentPos: number): boolean => {
  const endOfLine = text.indexOf('\n', currentPos)
  return endOfLine === -1 ? true : false
}

export const findLineEndColumn = (text: string, currentPos: number): number => {
  const endOfLine = text.indexOf('\n', currentPos)
  const trueEndOfLine = endOfLine === -1 ? text.length - 1 : endOfLine - 1
  const lineStart = text.lastIndexOf('\n', currentPos - 1) + 1
  return trueEndOfLine - lineStart
}

export const findLineLength = (text: string, currentPos: number): number => {
  const lineEnd = text.indexOf('\n', currentPos)
  const trueLineEnd = lineEnd === -1 ? text.length - 1 : lineEnd - 1
  const lineStart = text.lastIndexOf('\n', currentPos - 1) + 1
  return trueLineEnd - lineStart
}

export const isLineEmpty = (text: string, currentPos: number): boolean => {
  const lineEnd = findLineEnd(text, currentPos) + 1
  const lineStart = findLineStart(text, currentPos)
  console.log({ lineEnd, lineStart })
  return lineEnd - lineStart === 0
}

/**
 * Move to the next line at the same column
 */
export const moveToNextLine = (text: string, currentPos: number): number => {
  // First find the current line's newline character
  const currentLineEnd = text.indexOf('\n', currentPos)

  // If we're at the last line, return current position
  if (currentLineEnd === -1) return currentPos

  // Get the next line start (character after the newline)
  const nextLineStart = currentLineEnd + 1

  // Calculate our current column
  const currentLineStart = text.lastIndexOf('\n', currentPos - 1) + 1
  const currentCol = currentPos - currentLineStart

  // Find the end of the next line
  const nextLineEnd = text.indexOf('\n', nextLineStart)
  const nextLineLength =
    (nextLineEnd === -1 ? text.length : nextLineEnd) - nextLineStart

  // Handle special case for empty lines
  if (currentCol === 0 && nextLineLength === 0) {
    return nextLineStart
  }

  // Otherwise, follow standard vim rules
  return (
    nextLineStart +
    Math.min(currentCol, nextLineLength > 0 ? nextLineLength - 1 : 0)
  )
}

/**
 * Move to the previous line at the same column
 */
export const moveToPrevLine = (text: string, currentPos: number): number => {
  // Find the current line start
  const currentLineStart = text.lastIndexOf('\n', currentPos) + 1

  // If we're on the first line, stay put
  if (currentLineStart <= 0) return currentPos

  // Calculate our current column
  const currentCol = currentPos - currentLineStart

  // Find the start of the previous line
  const prevLineStart = text.lastIndexOf('\n', currentLineStart - 2) + 1
  const prevLineEnd = currentLineStart - 1
  const prevLineLength = prevLineEnd - prevLineStart

  // Handle special case for empty lines
  if (currentCol === 0 && prevLineLength === 0) {
    return prevLineStart
  }

  // Otherwise use standard vim rules
  return (
    prevLineStart +
    Math.min(currentCol, prevLineLength > 0 ? prevLineLength - 1 : 0)
  )
}
