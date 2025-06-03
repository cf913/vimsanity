import { VIM_MODES } from '../utils/constants'
import { VimMotion } from '../hooks/motions/types'

// Example: Adding a custom "undo" motion (Ctrl+R)
export const customUndoMotion: VimMotion = {
  key: 'ctrl+r',
  description: 'Undo last action',
  category: 'editing',
  execute: (context) => {
    // Implementation would depend on your undo system
    // This is just a placeholder
    console.log('Undo action executed')
  },
  condition: (context) => context.mode === VIM_MODES.NORMAL,
}

// Example: Adding a motion to jump to line start and delete to end
export const deleteToEndOfLineMotion: VimMotion = {
  key: 'D',
  description: 'Delete from cursor to end of line',
  category: 'editing',
  execute: (context) => {
    const currentLineEnd = context.text.indexOf('\n', context.cursorIndex)
    const endIndex =
      currentLineEnd === -1 ? context.text.length : currentLineEnd

    const newText =
      context.text.substring(0, context.cursorIndex) +
      context.text.substring(endIndex)
    context.setText(newText)
  },
  condition: (context) => context.mode === VIM_MODES.NORMAL,
}

// Example: Adding a motion to repeat last motion
export const repeatMotion: VimMotion = {
  key: '.',
  description: 'Repeat last action',
  category: 'editing',
  execute: (context) => {
    // Would need to implement motion history tracking
    console.log('Repeat last action')
  },
  condition: (context) => context.mode === VIM_MODES.NORMAL,
}

// Export all custom motions
export const customMotions: VimMotion[] = [
  customUndoMotion,
  deleteToEndOfLineMotion,
  repeatMotion,
]

// Example usage in a component:
/*
const TextEditorWithCustomMotions = () => {
  // ... other state ...
  
  const { keyActionMap, availableKeys } = useVimMotionsV2({
    // ... other props ...
    customMotions: customMotions,
    enabledMotions: ['h', 'j', 'k', 'l', 'i', 'a', 'ctrl+r', 'D'], // Only enable specific motions
  })
  
  return (
    // ... component JSX ...
  )
}
*/
