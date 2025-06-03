import { VIM_MODES } from '../../utils/constants'
import {
  findLineEnd,
  findLineEndColumn,
  findLineStart,
  findLineStartNonBlank,
  findPrevLineEnd,
  isLineEmpty,
  moveToNextWordBoundary,
  moveToPrevWordBoundary,
  moveToWordEnd,
} from '../../utils/textUtils'
import { VimMotion, MotionContext } from './types'

// Helper functions for cursor movement
const getCurrentColumn = (context: MotionContext) => {
  const lineStart = findLineStart(context.text, context.cursorIndex)
  return context.cursorIndex - lineStart
}

const setCursorToLineAndColumn = (
  context: MotionContext,
  lineStart: number,
  targetColumn: number,
  lineLength: number
) => {
  if (lineLength === 0) {
    context.setCursorIndex(lineStart)
  } else {
    const actualColumn = Math.min(
      targetColumn,
      lineLength > 0 ? lineLength - 1 : 0
    )
    context.setCursorIndex(lineStart + actualColumn)
  }
}

export const movementMotions: VimMotion[] = [
  {
    key: 'h',
    description: 'Move cursor left',
    category: 'movement',
    execute: (context: MotionContext) => {
      const lineStart = findLineStart(context.text, context.cursorIndex)
      if (context.cursorIndex > lineStart) {
        context.setCursorIndex(context.cursorIndex - 1)
        context.setVirtualColumn(getCurrentColumn(context) - 1)
      }
    },
    condition: (context: MotionContext) => context.mode === VIM_MODES.NORMAL,
  },

  {
    key: 'l',
    description: 'Move cursor right',
    category: 'movement',
    execute: (context: MotionContext) => {
      const lineEnd = findLineEnd(context.text, context.cursorIndex)
      if (context.cursorIndex < lineEnd) {
        context.setCursorIndex(context.cursorIndex + 1)
        context.setVirtualColumn(getCurrentColumn(context) + 1)
      }
    },
    condition: (context: MotionContext) => context.mode === VIM_MODES.NORMAL,
  },

  {
    key: 'j',
    description: 'Move cursor down',
    category: 'movement',
    execute: (context: MotionContext) => {
      const currentColumn = getCurrentColumn(context)
      if (currentColumn > context.virtualColumn) {
        context.setVirtualColumn(currentColumn)
      }

      const currentLineEnd = context.text.indexOf('\n', context.cursorIndex)
      if (currentLineEnd === -1) return

      const nextLineStart = currentLineEnd + 1
      const nextLineEnd = context.text.indexOf('\n', nextLineStart)
      const nextLineLength =
        (nextLineEnd === -1 ? context.text.length : nextLineEnd) - nextLineStart

      setCursorToLineAndColumn(
        context,
        nextLineStart,
        context.virtualColumn,
        nextLineLength
      )
    },
    condition: (context: MotionContext) => context.mode === VIM_MODES.NORMAL,
  },

  {
    key: 'k',
    description: 'Move cursor up',
    category: 'movement',
    execute: (context: MotionContext) => {
      const lineStart = findLineStart(context.text, context.cursorIndex)
      if (lineStart <= 0) return

      const currentColumn = getCurrentColumn(context)
      if (currentColumn > context.virtualColumn) {
        context.setVirtualColumn(currentColumn)
      }

      const prevLineEnd = findPrevLineEnd(context.text, context.cursorIndex)
      const prevLineStart = context.text.lastIndexOf('\n', prevLineEnd - 1) + 1
      const prevLineLength = prevLineEnd - prevLineStart

      setCursorToLineAndColumn(
        context,
        prevLineStart,
        context.virtualColumn,
        prevLineLength
      )
    },
    condition: (context: MotionContext) => context.mode === VIM_MODES.NORMAL,
  },

  {
    key: 'w',
    description: 'Move to next word boundary',
    category: 'movement',
    execute: (context: MotionContext) => {
      const editableText = context.text.split('')
      context.setCursorIndex(
        moveToNextWordBoundary(editableText, context.cursorIndex)
      )
    },
    condition: (context: MotionContext) => context.mode === VIM_MODES.NORMAL,
  },

  {
    key: 'b',
    description: 'Move to previous word boundary',
    category: 'movement',
    execute: (context: MotionContext) => {
      const editableText = context.text.split('')
      context.setCursorIndex(
        moveToPrevWordBoundary(editableText, context.cursorIndex)
      )
    },
    condition: (context: MotionContext) => context.mode === VIM_MODES.NORMAL,
  },

  {
    key: 'e',
    description: 'Move to end of current word',
    category: 'movement',
    execute: (context: MotionContext) => {
      const editableText = context.text.split('')
      context.setCursorIndex(moveToWordEnd(editableText, context.cursorIndex))
    },
    condition: (context: MotionContext) => context.mode === VIM_MODES.NORMAL,
  },

  {
    key: '0',
    description: 'Move to beginning of line',
    category: 'movement',
    execute: (context: MotionContext) => {
      context.setCursorIndex(findLineStart(context.text, context.cursorIndex))
      context.setVirtualColumn(0)
    },
    condition: (context: MotionContext) => context.mode === VIM_MODES.NORMAL,
  },

  {
    key: '^',
    description: 'Move to first non-blank character',
    category: 'movement',
    execute: (context: MotionContext) => {
      context.setCursorIndex(
        findLineStartNonBlank(context.text, context.cursorIndex)
      )
      context.setVirtualColumn(0)
    },
    condition: (context: MotionContext) => context.mode === VIM_MODES.NORMAL,
  },

  {
    key: '_',
    description: 'Move to first non-blank character',
    category: 'movement',
    execute: (context: MotionContext) => {
      context.setCursorIndex(
        findLineStartNonBlank(context.text, context.cursorIndex)
      )
      context.setVirtualColumn(0)
    },
    condition: (context: MotionContext) => context.mode === VIM_MODES.NORMAL,
  },

  {
    key: '$',
    description: 'Move to end of line',
    category: 'movement',
    execute: (context: MotionContext) => {
      if (isLineEmpty(context.text, context.cursorIndex)) return
      context.setCursorIndex(findLineEnd(context.text, context.cursorIndex))
      context.setVirtualColumn(
        findLineEndColumn(context.text, context.cursorIndex)
      )
    },
    condition: (context: MotionContext) => context.mode === VIM_MODES.NORMAL,
  },
]
