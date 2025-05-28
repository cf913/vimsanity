import { Fragment, useState } from 'react'
import { VIM_MODES, VimMode } from '../../../utils/constants'
import { useVimMotions } from '../../../hooks/useVimMotions'
import {
  KeyActionMap,
  useKeyboardHandler,
} from '../../../hooks/useKeyboardHandler'
import { TextArea } from '../../common/TextArea'

interface TextEditorProps {
  initialText: string
  mode: VimMode
  setMode: (mode: VimMode) => void
}

export function TextEditor({ initialText, mode, setMode }: TextEditorProps) {
  const [cursorIndex, setCursorIndex] = useState(0)
  const [virtualColumn, setVirtualColumn] = useState(0)
  const [text, setText] = useState<string>(initialText)

  const isInsertMode = mode === VIM_MODES.INSERT

  // TODO: make this a hook: useHistory()
  const initialHistory = [
    {
      text: initialText,
      cursorIndex: 0,
    },
  ]

  const { keyActionMap } = useVimMotions({
    setCursorIndex,
    cursorIndex,
    setVirtualColumn,
    virtualColumn,
    setMode,
    mode,
    text,
    setText,
  })

  // generate keyActions from an array of keys
  const keys: string[] = [
    'h',
    'l',
    'k',
    'j',
    'w',
    'e',
    'b',
    '0',
    '_',
    '^',
    '$',
    'i',
    'a',
    'A',
    'I',
    'o',
    'O',
    'x',
  ]

  const keyActionsDefault: KeyActionMap = Object.fromEntries(
    keys.map((key) => [key, keyActionMap[key]]),
  )

  const keyActions: KeyActionMap = {
    ...keyActionsDefault,
  }

  const insertModeActions: KeyActionMap = {
    Escape: keyActionMap['Escape'],
    Backspace: keyActionMap['Backspace'],
    Enter: keyActionMap['Enter'],
  }

  // Handle character input in insert mode
  const handleCharInput = (char: string) => {
    keyActionMap['char'](char)
  }

  // Register keyboard handler
  const { lastKeyPressed } = useKeyboardHandler({
    keyActionMap: mode === VIM_MODES.INSERT ? insertModeActions : keyActions,
    dependencies: [isInsertMode],
    onAnyKey: handleCharInput,
    // onCtrlKeys: handleCtrlR,
    // disabled: !isActive,
  })

  const textAreaProps = {
    lines: text.split('\n'),
    text,
    cursorIndex,
    mode,
  }

  return <TextArea {...textAreaProps} />
}
