// Text processing utilities

/**
 * Process text to handle punctuation as separate words (like in Vim)
 */
export const processTextForVim = (text: string): string[] => {
  // Just split the text into characters
  return text.split('');
};

/**
 * Check if a character at the given index is at a word boundary
 */
export const isWordBoundary = (text: string[], index: number): boolean => {
  if (index <= 0 || index >= text.length) return false;
  const current = text[index];
  const prev = text[index - 1];
  
  // Word boundary conditions
  const isPrevSpace = /\s/.test(prev);
  const isPrevPunctuation = /[.,;:!?()[\]{}'"<>\/\\|+=\-*&^%$#@!~`]/.test(prev) && prev !== '_';
  const isCurrentPunctuation = /[.,;:!?()[\]{}'"<>\/\\|+=\-*&^%$#@!~`]/.test(current) && current !== '_';
  
  // Start of a word is:
  // 1. After a space
  // 2. A punctuation after a non-punctuation
  // 3. A non-punctuation after a punctuation
  return (isPrevSpace && !isCurrentPunctuation) || 
         (isCurrentPunctuation && !isPrevPunctuation) || 
         (!isCurrentPunctuation && isPrevPunctuation);
};

/**
 * Check if a character at the given index is at a word end
 */
export const isWordEnd = (text: string[], index: number): boolean => {
  if (index >= text.length - 1 || index < 0) return false;
  const current = text[index];
  const next = text[index + 1];
  
  // Word end conditions
  const isNextSpace = /\s/.test(next);
  const isCurrentPunctuation = /[.,;:!?()[\]{}'"<>\/\\|+=\-*&^%$#@!~`]/.test(current) && current !== '_';
  const isNextPunctuation = /[.,;:!?()[\]{}'"<>\/\\|+=\-*&^%$#@!~`]/.test(next) && next !== '_';
  
  // End of a word is:
  // 1. Before a space
  // 2. A punctuation before a non-punctuation
  // 3. A non-punctuation before a punctuation
  return (isNextSpace && !isCurrentPunctuation) || 
         (!isNextPunctuation && isCurrentPunctuation) || 
         (isNextPunctuation && !isCurrentPunctuation);
};

/**
 * Move to the next word boundary
 */
export const moveToNextWordBoundary = (text: string[], currentPos: number): number => {
  for (let i = currentPos + 1; i < text.length; i++) {
    if (isWordBoundary(text, i)) {
      return i;
    }
  }
  return currentPos;
};

/**
 * Move to the end of current or next word
 */
export const moveToWordEnd = (text: string[], currentPos: number): number => {
  for (let i = currentPos + 1; i < text.length - 1; i++) {
    if (isWordEnd(text, i)) {
      return i;
    }
  }
  return currentPos;
};

/**
 * Move to the previous word boundary
 */
export const moveToPrevWordBoundary = (text: string[], currentPos: number): number => {
  for (let i = currentPos - 1; i > 0; i--) {
    if (isWordBoundary(text, i)) {
      return i;
    }
  }
  return 0;
};

/**
 * Find the start of the current line
 */
export const findLineStart = (text: string, currentPos: number): number => {
  const lineStart = text.lastIndexOf('\n', currentPos) + 1;
  return lineStart === 0 && text.charAt(0) === '\n' ? 1 : lineStart;
};

/**
 * Find the end of the current line
 */
export const findLineEnd = (text: string, currentPos: number): number => {
  const endOfLine = text.indexOf('\n', currentPos);
  return endOfLine === -1 ? text.length - 1 : endOfLine - 1;
};

/**
 * Move to the next line at the same column
 */
export const moveToNextLine = (text: string, currentPos: number): number => {
  const currentLineStart = text.lastIndexOf('\n', currentPos) + 1;
  const currentLineEnd = text.indexOf('\n', currentPos);
  
  if (currentLineEnd === -1) return currentPos;
  
  const currentCol = currentPos - currentLineStart;
  const nextLineStart = currentLineEnd + 1;
  const nextLineEnd = text.indexOf('\n', nextLineStart);
  const nextLineLength = (nextLineEnd === -1 ? text.length : nextLineEnd) - nextLineStart;
  
  // Move to the same column in the next line, or the end of the next line if it's shorter
  return nextLineStart + Math.min(currentCol, nextLineLength);
};

/**
 * Move to the previous line at the same column
 */
export const moveToPrevLine = (text: string, currentPos: number): number => {
  const lineStart = text.lastIndexOf('\n', Math.max(0, currentPos - 1));
  if (lineStart <= 0) return currentPos;
  
  const col = currentPos - (lineStart + 1);
  const prevLineStart = text.lastIndexOf('\n', lineStart - 1) + 1;
  const prevLineLength = lineStart - prevLineStart;
  
  // Move to the same column in the previous line, or the end of the previous line if it's shorter
  return prevLineStart + Math.min(col, prevLineLength);
};
