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

  const lines = text.split('\n')

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

  const keyActions: KeyActionMap = {
    // move - arrow keys
    h: keyActionMap.h,
    l: keyActionMap.l,
    k: keyActionMap.k,
    j: keyActionMap.j,
    // move - word navigation
    w: keyActionMap.w,
    e: keyActionMap.e,
    b: keyActionMap.b,
    // move - line navigation
    0: keyActionMap['0'],
    // '_': keyActionMap['_'],
    $: keyActionMap.$,
    // insert
    i: keyActionMap.i,
    a: keyActionMap.a,
    A: keyActionMap.A,
    I: keyActionMap.I,
    o: keyActionMap.o,
    O: keyActionMap.O,
    // delete
    x: keyActionMap.x,
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
    lines,
    text,
    cursorIndex,
    mode,
  }
  return <TextArea {...textAreaProps} />
}
