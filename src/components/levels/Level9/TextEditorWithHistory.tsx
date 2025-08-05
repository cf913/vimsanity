import { useState } from 'react'
import { VIM_MODES, VimMode } from '../../../utils/constants'
import { useVimMotionsV2 } from '../../../hooks/useVimMotionsV2'
import { useHistory } from '../../../hooks/useHistory'
import {
  KeyActionMap,
  useKeyboardHandler,
} from '../../../hooks/useKeyboardHandler'
import { EditorProps, TextArea } from '../../common/TextArea'

export interface TextEditorWithHistoryProps {
  initialText: string
  mode: VimMode
  setMode: (mode: VimMode) => void
  setLastKeyPressed: (key: string | null) => void
  activeKeys?: string[]
  onCompleted?: ({ newText, undoCount, redoCount }: { newText: string; undoCount: number; redoCount: number }) => void
  editor: EditorProps
}

export function TextEditorWithHistory({
  initialText,
  mode,
  setMode,
  setLastKeyPressed,
  activeKeys,
  onCompleted,
  editor,
}: TextEditorWithHistoryProps) {
  const [cursorIndex, setCursorIndex] = useState(0)
  const [virtualColumn, setVirtualColumn] = useState(0)
  const [text, setText] = useState<string>(initialText)
  const [undoCount, setUndoCount] = useState(0)
  const [redoCount, setRedoCount] = useState(0)

  const isInsertMode = mode === VIM_MODES.INSERT

  // Initialize history with the initial state
  const history = useHistory({
    text: initialText,
    cursorIndex: 0,
  })

  // Custom setText function - doesn't automatically save to history
  const setTextWithHistory = (newText: string) => {
    setText(newText)
  }

  const { keyActionMap } = useVimMotionsV2({
    setCursorIndex,
    cursorIndex,
    setVirtualColumn,
    virtualColumn,
    setMode,
    mode,
    text,
    setText: setTextWithHistory,
    history, // Pass history to the motion context
  })

  // generate keyActions from an array of keys
  const keys: string[] | undefined = activeKeys

  const keyActionsDefault: KeyActionMap = keys
    ? Object.fromEntries(keys.map((key) => [key, keyActionMap[key]]))
    : keyActionMap

  const keyActions: KeyActionMap = {
    ...keyActionsDefault,
    u: () => {
      if (keyActionMap['u']) {
        keyActionMap['u']()
        setUndoCount(prev => prev + 1)
      }
    },
    'ctrl+r': () => {
      if (keyActionMap['ctrl+r']) {
        keyActionMap['ctrl+r']()
        setRedoCount(prev => prev + 1)
      }
    },
    Escape: () => {
      keyActionMap['Escape']()
      if (onCompleted) {
        onCompleted({ newText: text, undoCount, redoCount })
      }
    },
  }

  const insertModeActions: KeyActionMap = {
    Escape: () => {
      keyActionMap['Escape']()

      // Save current state to history when exiting insert mode (following Vim behavior)
      let newCursorIndex = cursorIndex
      if (cursorIndex > 0) {
        newCursorIndex = cursorIndex - 1
      }

      // Save current state to history
      history.pushToHistory({
        text: text,
        cursorIndex: newCursorIndex,
      })

      if (onCompleted) {
        onCompleted({ newText: text, undoCount, redoCount })
      }
    },
    Backspace: keyActionMap['Backspace'],
    Enter: keyActionMap['Enter'],
    Tab: keyActionMap['Tab'],
  }

  // Handle character input in insert mode
  const handleCharInput = (char: string) => {
    keyActionMap['char'](char)
  }

  // Register keyboard handler
  useKeyboardHandler({
    keyActionMap: mode === VIM_MODES.INSERT ? insertModeActions : keyActions,
    dependencies: [isInsertMode],
    onAnyKey: handleCharInput,
    onSetLastKeyPressed: setLastKeyPressed,
  })

  const textAreaProps = {
    lines: text.split('\n'),
    text,
    cursorIndex,
    mode,
    editor,
  }

  return <TextArea {...textAreaProps} />
}
