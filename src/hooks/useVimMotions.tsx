import { VIM_MODES, VimMode } from '../utils/constants'
import {
  findLineEnd,
  findLineStart,
  findNextLineStart,
  findPrevLineEnd,
  moveToNextWordBoundary,
  moveToPrevWordBoundary,
  moveToWordEnd,
} from '../utils/textUtils'

interface UseVimMotionsProps {
  setCursorIndex: (position: number) => void
  cursorIndex: number
  setVirtualColumn: (column: number) => void
  virtualColumn: number
  setMode: (mode: VimMode) => void
  mode: VimMode
  text: string
}

export const useVimMotions = ({
  setCursorIndex,
  cursorIndex,
  setVirtualColumn,
  virtualColumn,
  setMode,
  mode,
  text,
}: UseVimMotionsProps) => {
  const isInsertMode = mode === VIM_MODES.INSERT
  const isNormalMode = mode === VIM_MODES.NORMAL

  const editableText = text.split('')

  const getCurrentColumn = () => {
    const lineStart = findLineStart(text, cursorIndex)
    return cursorIndex - lineStart
  }

  const setCursorToLineAndColumn = (
    lineStart: number,
    targetColumn: number,
    lineLength: number,
  ) => {
    // For empty lines or if target column exceeds line length, place at line start or end
    if (lineLength === 0) {
      setCursorIndex(lineStart)
    } else {
      // Calculate actual column (bounded by line length)
      const actualColumn = Math.min(
        targetColumn,
        lineLength > 0 ? lineLength - 1 : 0,
      )
      setCursorIndex(lineStart + actualColumn)
    }
  }

  const keyActionMap = {
    h: () => {
      // Move left
      const lineStart = findLineStart(text, cursorIndex)
      // Move cursor left within the cell
      if (cursorIndex > lineStart) {
        setCursorIndex(cursorIndex - 1)
        setVirtualColumn(getCurrentColumn() - 1)
      }
    },
    l: () => {
      // Move right
      const lineEnd = findLineEnd(text, cursorIndex)
      // Move cursor right within the cell
      if (cursorIndex < lineEnd) {
        setCursorIndex(cursorIndex + 1)
        setVirtualColumn(getCurrentColumn() + 1)
      }
    },
    j: () => {
      // Move down
      const currentColumn = getCurrentColumn()

      // Remember this column if it's not already saved
      // or if horizontal movement has changed it
      if (currentColumn > virtualColumn) {
        setVirtualColumn(currentColumn)
      }

      // Find the next line boundaries
      const currentLineEnd = text.indexOf('\n', cursorIndex)
      if (currentLineEnd === -1) return // Already at the last line

      const nextLineStart = currentLineEnd + 1
      const nextLineEnd = text.indexOf('\n', nextLineStart)
      const nextLineLength =
        (nextLineEnd === -1 ? text.length : nextLineEnd) - nextLineStart

      // Set cursor to appropriate position in next line based on virtual column
      setCursorToLineAndColumn(nextLineStart, virtualColumn, nextLineLength)
    },
    k: () => {
      // Move up
      const lineStart = findLineStart(text, cursorIndex)
      if (lineStart <= 0) return // already at the first line

      const currentColumn = getCurrentColumn()

      // Cannot go up if already at first line
      if (currentColumn > virtualColumn) {
        setVirtualColumn(currentColumn)
      }

      // Find the previous line boundaries
      const prevLineEnd = findPrevLineEnd(text, cursorIndex)
      const prevLineStart = text.lastIndexOf('\n', prevLineEnd - 1) + 1
      const prevLineLength = prevLineEnd - prevLineStart

      // Set cursor to appropriate position in previous line based on virtual column
      setCursorToLineAndColumn(prevLineStart, virtualColumn, prevLineLength)
    },
    w: () => {
      // Move to the next word boundary
      setCursorIndex(moveToNextWordBoundary(editableText, cursorIndex))
    },
    b: () => {
      // Move to the previous word boundary
      setCursorIndex(moveToPrevWordBoundary(editableText, cursorIndex))
    },
    e: () => {
      // Move to the end of the current word
      setCursorIndex(moveToWordEnd(editableText, cursorIndex))
    },
    i: () => {
      if (!isInsertMode) {
        setMode(VIM_MODES.INSERT)
      }
    },
  }

  return { keyActionMap }
}
