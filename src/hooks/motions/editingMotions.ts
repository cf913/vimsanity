import { VIM_MODES } from '../../utils/constants'
import {
  findLineEnd,
  findLineStart,
  isEndOfLine,
  isLineEmpty,
} from '../../utils/textUtils'
import { VimMotion, MotionContext } from './types'

// Helper function to get current column
const getCurrentColumn = (context: MotionContext) => {
  const lineStart = findLineStart(context.text, context.cursorIndex)
  return context.cursorIndex - lineStart
}

export const editingMotions: VimMotion[] = [
  {
    key: 'x',
    description: 'Delete character under cursor',
    category: 'editing',
    execute: (context: MotionContext) => {
      if (isLineEmpty(context.text, context.cursorIndex)) {
        context.setVirtualColumn(0)
        return
      }

      const newText =
        context.text.substring(0, context.cursorIndex) +
        context.text.substring(context.cursorIndex + 1)
      context.setText(newText)

      if (isEndOfLine(context.text, context.cursorIndex)) {
        context.setCursorIndex(context.cursorIndex - 1)
        context.setVirtualColumn(getCurrentColumn(context) - 1)
      }

      context.setVirtualColumn(getCurrentColumn(context))
    },
    condition: (context: MotionContext) => context.mode === VIM_MODES.NORMAL,
  },

  {
    key: 'o',
    description: 'Open line below and enter insert mode',
    category: 'editing',
    execute: (context: MotionContext) => {
      if (context.mode === VIM_MODES.INSERT) return

      context.setMode(VIM_MODES.INSERT)
      const lineEnd = findLineEnd(context.text, context.cursorIndex)
      const newContent =
        context.text.substring(0, lineEnd + 1) +
        '\n' +
        context.text.substring(lineEnd + 1)

      context.setText(newContent)
      context.setCursorIndex(lineEnd + 2)
      context.setVirtualColumn(0)
    },
    condition: (context: MotionContext) => context.mode === VIM_MODES.NORMAL,
  },

  {
    key: 'O',
    description: 'Open line above and enter insert mode',
    category: 'editing',
    execute: (context: MotionContext) => {
      if (context.mode === VIM_MODES.INSERT) return

      context.setMode(VIM_MODES.INSERT)
      const lineStart = findLineStart(context.text, context.cursorIndex)
      const newContent =
        context.text.substring(0, lineStart) +
        '\n' +
        context.text.substring(lineStart)

      context.setText(newContent)
      context.setCursorIndex(lineStart)
      context.setVirtualColumn(0)
    },
    condition: (context: MotionContext) => context.mode === VIM_MODES.NORMAL,
  },

  {
    key: 'Backspace',
    description: 'Delete character before cursor',
    category: 'editing',
    execute: (context: MotionContext) => {
      if (context.cursorIndex <= 0) return

      const beforeCursor = context.text.substring(0, context.cursorIndex - 1)
      const afterCursor = context.text.substring(context.cursorIndex)
      const newText = beforeCursor + afterCursor

      context.setText(newText)
      context.setCursorIndex(context.cursorIndex - 1)
    },
    condition: (context: MotionContext) => context.mode === VIM_MODES.INSERT,
  },

  {
    key: 'Enter',
    description: 'Insert new line',
    category: 'editing',
    execute: (context: MotionContext) => {
      const newText =
        context.text.substring(0, context.cursorIndex) +
        '\n' +
        context.text.substring(context.cursorIndex)
      context.setText(newText)
      context.setCursorIndex(context.cursorIndex + 1)
    },
    condition: (context: MotionContext) => context.mode === VIM_MODES.INSERT,
  },
  {
    key: 'Tab',
    description: 'Insert tab character',
    category: 'editing',
    execute: (context: MotionContext) => {
      const SPACES_PER_TAB = 2
      if (context.mode !== VIM_MODES.INSERT) return
      context.setText(
        context.text.substring(0, context.cursorIndex) +
          ' '.repeat(SPACES_PER_TAB) +
          context.text.substring(context.cursorIndex),
      )
      context.setCursorIndex(context.cursorIndex + SPACES_PER_TAB)
    },
    condition: (context: MotionContext) => context.mode === VIM_MODES.INSERT,
  },
  {
    key: 'char',
    description: 'Insert character at cursor',
    category: 'editing',
    execute: (context: MotionContext, char: string) => {
      if (context.mode !== VIM_MODES.INSERT) return
      if (char.length !== 1) return
      if (['Escape', 'Backspace', 'Enter'].includes(char)) return

      const beforeCursor = context.text.substring(0, context.cursorIndex)
      const afterCursor = context.text.substring(context.cursorIndex)
      const newText = beforeCursor + char + afterCursor

      context.setText(newText)
      context.setCursorIndex(context.cursorIndex + 1)
    },
    condition: (context: MotionContext) => context.mode === VIM_MODES.INSERT,
  },
]
