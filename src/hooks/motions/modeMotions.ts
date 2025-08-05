import { VIM_MODES } from '../../utils/constants'
import {
  findLineEnd,
  findLineEndColumn,
  findLineStart,
  findLineStartNonBlank,
  isLineEmpty,
} from '../../utils/textUtils'
import { VimMotion, MotionContext } from './types'

export const modeMotions: VimMotion[] = [
  {
    key: 'i',
    description: 'Enter insert mode at cursor',
    category: 'mode',
    execute: (context: MotionContext) => {
      if (context.mode === VIM_MODES.INSERT) return
      context.setMode(VIM_MODES.INSERT)
    },
    condition: (context: MotionContext) => context.mode === VIM_MODES.NORMAL,
  },

  {
    key: 'a',
    description: 'Enter insert mode after cursor',
    category: 'mode',
    execute: (context: MotionContext) => {
      if (context.mode === VIM_MODES.INSERT) return
      context.setMode(VIM_MODES.INSERT)

      if (isLineEmpty(context.text, context.cursorIndex)) {
        // do nothing
      } else if (context.cursorIndex < context.text.length) {
        context.setCursorIndex(context.cursorIndex + 1)
      } else {
        context.setCursorIndex(context.text.length)
      }
    },
    condition: (context: MotionContext) => context.mode === VIM_MODES.NORMAL,
  },

  {
    key: 'I',
    description: 'Enter insert mode at first non-blank character',
    category: 'mode',
    execute: (context: MotionContext) => {
      if (context.mode === VIM_MODES.INSERT) return
      context.setMode(VIM_MODES.INSERT)
      context.setCursorIndex(
        findLineStartNonBlank(context.text, context.cursorIndex)
      )
      context.setVirtualColumn(0)
    },
    condition: (context: MotionContext) => context.mode === VIM_MODES.NORMAL,
  },

  {
    key: 'A',
    description: 'Enter insert mode at end of line',
    category: 'mode',
    execute: (context: MotionContext) => {
      if (context.mode === VIM_MODES.INSERT) return
      context.setMode(VIM_MODES.INSERT)
      context.setCursorIndex(findLineEnd(context.text, context.cursorIndex) + 1)
      context.setVirtualColumn(
        findLineEndColumn(context.text, context.cursorIndex)
      )
    },
    condition: (context: MotionContext) => context.mode === VIM_MODES.NORMAL,
  },

  {
    key: 'Escape',
    description: 'Enter normal mode',
    category: 'mode',
    execute: (context: MotionContext) => {
      context.setMode(VIM_MODES.NORMAL)
      let newCursorIndex = context.cursorIndex
      const lineStart = findLineStart(context.text, context.cursorIndex)

      if (context.cursorIndex > 0) {
        newCursorIndex = Math.max(lineStart, context.cursorIndex - 1)
        context.setCursorIndex(newCursorIndex)
        context.setVirtualColumn(newCursorIndex - lineStart)
      }
    },
    condition: (context: MotionContext) => context.mode === VIM_MODES.INSERT,
  },
]
