import { Fragment, useState } from 'react'
import { VIM_MODES, VimMode } from '../../../utils/constants'
import { useVimMotions } from '../../../hooks/useVimMotions'
import {
  KeyActionMap,
  useKeyboardHandler,
} from '../../../hooks/useKeyboardHandler'

interface TextAreaProps {
  initialText: string
  mode: VimMode
  setMode: (mode: VimMode) => void
}

export function TextArea({ initialText, mode, setMode }: TextAreaProps) {
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
  })

  const keyActions: KeyActionMap = {
    h: keyActionMap.h,
    l: keyActionMap.l,
    k: keyActionMap.k,
    j: keyActionMap.j,
    i: keyActionMap.i,
    a: keyActionMap.a,
    A: keyActionMap.A,
    I: keyActionMap.I,
    $: keyActionMap.$,
    0: keyActionMap['0'],
    o: () => keyActionMap.o(text, setText),
  }

  const insertModeActions: KeyActionMap = {
    Escape: keyActionMap['Escape'],
  }

  // Register keyboard handler
  const { lastKeyPressed } = useKeyboardHandler({
    keyActionMap: mode === VIM_MODES.INSERT ? insertModeActions : keyActions,
    dependencies: [isInsertMode],
    // onAnyKey: handleCharInput,
    // onCtrlKeys: handleCtrlR,
    // disabled: !isActive,
  })

  return (
    <div
      className={`relative flex flex-col justify-center items-center p-4 rounded-lg transition-all duration-200`}
    >
      <div className="text-2xl font-mono mb-2 min-h-[2rem]">
        {lines.map((line, lineIdx) => {
          // Calculate line start position in the entire text
          const lineStartPosition =
            text.split('\n').slice(0, lineIdx).join('\n').length +
            (lineIdx > 0 ? 1 : 0)
          // Calculate if cursor is on this line
          const isCursorOnThisLine =
            cursorIndex >= lineStartPosition &&
            (lineIdx === lines.length - 1 ||
              cursorIndex < lineStartPosition + line.length + 1)
          return (
            <div key={lineIdx}>
              {line.split('').map((char, charIdx) => {
                const absoluteIdx = lineStartPosition + charIdx
                const isCursorPosition = absoluteIdx === cursorIndex
                const isCursorOnLastChar = absoluteIdx + 1 === cursorIndex
                const isCursorOnLastCharInInsertMode =
                  isInsertMode &&
                  isCursorOnLastChar &&
                  charIdx === line.length - 1
                return (
                  <>
                    <span
                      key={charIdx}
                      className={`${
                        isCursorPosition
                          ? isInsertMode
                            ? 'bg-orange-400 text-white rounded'
                            : 'bg-emerald-400 text-white rounded'
                          : ''
                      }`}
                    >
                      {char === ' ' ? '\u00A0' : char}
                    </span>
                    {isCursorOnLastCharInInsertMode && (
                      <span className="bg-amber-500 text-white rounded">
                        {'\u00A0'}
                      </span>
                    )}
                  </>
                )
              })}
              {/* Show cursor if content is empty */}
              {line.length === 0 &&
                (isCursorOnThisLine ? (
                  <span
                    className={
                      mode === 'normal'
                        ? 'bg-emerald-500 text-white rounded'
                        : 'bg-amber-500 text-white rounded'
                    }
                  >
                    {'\u00A0'}
                  </span>
                ) : (
                  <span className="">{'\u00A0'}</span>
                ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}
