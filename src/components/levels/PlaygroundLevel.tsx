import React, { useEffect, useRef, useState } from 'react'
import {
  KeyActionMap,
  KeyHandler,
  useKeyboardHandler,
} from '../../hooks/useKeyboardHandler'
import {
  findLineEnd,
  findLineEndColumn,
  findLineStart,
  isLineEmpty,
  moveToNextWordBoundary,
  moveToPrevWordBoundary,
  moveToWordEnd,
} from '../../utils/textUtils'
import WarningSplash from '../common/WarningSplash'
import { VIM_MODES, VimMode } from '../../utils/constants'
import { useVimMotions } from '../../hooks/useVimMotions'

interface PlaygroundLevelProps {
  isMuted: boolean
}

const PlaygroundLevel: React.FC<PlaygroundLevelProps> = ({ isMuted }) => {
  const [editableText, setEditableText] = useState<string>(
    'This is a Vim playground. Practice your motions here!\n\nNew levels are being added every week!\n\nYou can use h, j, k, l for movement.\nTry w, e, b for word navigation.\nUse i to enter insert mode, Escape to exit.\nPress x to delete characters.',
  )
  const [cursorPosition, setCursorPosition] = useState<number>(0)
  const [mode, setMode] = useState<VimMode>('normal')
  const [lines, setLines] = useState<string[]>(editableText.split('\n'))
  // Store the "virtual" column for j/k navigation
  const [virtualColumn, setVirtualColumn] = useState<number>(0)
  // Track the pending command for multi-key sequences
  const [pendingCommand, setPendingCommand] = useState<string | null>(null)

  // Refs for auto-scrolling
  const editorRef = useRef<HTMLDivElement>(null)
  const cursorRef = useRef<HTMLSpanElement>(null)

  const { keyActionMap } = useVimMotions({
    setCursorIndex: setCursorPosition,
    cursorIndex: cursorPosition,
    setVirtualColumn,
    virtualColumn,
    setMode,
    mode,
    text: editableText,
    setText: setEditableText,
  })

  // Effect to scroll to cursor when position changes
  useEffect(() => {
    if (cursorRef.current && editorRef.current) {
      // Get cursor and container positions
      const cursor = cursorRef.current
      const container = editorRef.current

      // Calculate if cursor is in view
      const cursorRect = cursor.getBoundingClientRect()
      const containerRect = container.getBoundingClientRect()

      // Handle horizontal scrolling
      if (cursorRect.left < containerRect.left) {
        // Cursor is to the left of visible area
        container.scrollLeft -= containerRect.left - cursorRect.left + 10
      } else if (cursorRect.right > containerRect.right) {
        // Cursor is to the right of visible area
        container.scrollLeft += cursorRect.right - containerRect.right + 10
      }
    }
  }, [cursorPosition])

  const updateLines = (text: string) => {
    setEditableText(text)
    setLines(text.split('\n'))
  }

  // const generateKeyActions: () => KeyActionMap = () => {
  //   const KEYS: string[] = ['h', 'l', 'j', 'k']
  //   const template = (key: string) => {
  //     setPendingCommand(null)
  //     keyActionMap[key]()
  //   }
  //
  //   return KEYS.reduce((acc, next) => {
  //     return { ...acc, [next]: template(next) }
  //   }, {})
  // }

  // Define normal mode key actions
  const normalModeActions: KeyActionMap = {
    h: () => {
      // Clear any pending commands
      setPendingCommand(null)
      keyActionMap.h()
    },
    l: () => {
      // Clear any pending commands
      setPendingCommand(null)
      keyActionMap.l()
    },
    j: () => {
      // Clear any pending commands
      setPendingCommand(null)
      keyActionMap.j()
    },
    k: () => {
      // Clear any pending commands
      setPendingCommand(null)
      keyActionMap.k()
    },
    w: () => {
      // Clear any pending commands
      setPendingCommand(null)
      keyActionMap.w()
    },
    e: () => {
      // Clear any pending commands
      setPendingCommand(null)
      keyActionMap.e()
    },
    b: () => {
      // Clear any pending commands
      setPendingCommand(null)
      keyActionMap.b()
    },
    '0': () => {
      // Clear any pending commands
      setPendingCommand(null)
      keyActionMap['0']()
    },
    $: () => {
      // Clear any pending commands
      setPendingCommand(null)
      keyActionMap.$()
    },
    i: () => {
      // Clear any pending commands
      setPendingCommand(null)
      keyActionMap.i()
    },
    I: () => {
      // Clear any pending commands
      setPendingCommand(null)
      keyActionMap.I()
    },
    a: () => {
      // Clear any pending commands
      setPendingCommand(null)
      keyActionMap.a()
    },
    A: () => {
      // Clear any pending commands
      setPendingCommand(null)
      keyActionMap.A()
    },
    o: () => {
      setPendingCommand(null)
      keyActionMap.o(editableText, updateLines)
    },
    O: () => {
      setPendingCommand(null)
      keyActionMap.O(editableText, updateLines)
    },
    x: () => {
      // Clear any pending commands
      setPendingCommand(null)
      keyActionMap.x(updateLines)
    },
    d: () => {
      // If 'd' is already pending, execute the 'dd' command
      if (pendingCommand === 'd') {
        // Get current line start position
        const currentLineStart = findLineStart(editableText, cursorPosition)

        // The findLineEnd function returns the position of the last character in the line
        // (not including the newline). We need to find the actual end of the line including the newline.
        const lineEndPos = findLineEnd(editableText, cursorPosition)
        // Check if there is a newline character after the line end position
        const hasNewline =
          lineEndPos + 1 < editableText.length &&
          editableText[lineEndPos + 1] === '\n'
        // Real end position including the newline if it exists
        const realLineEnd = hasNewline ? lineEndPos + 1 : lineEndPos

        // Check if this is the last line
        const isLastLine = realLineEnd + 1 >= editableText.length

        // Handle the deletion based on line position
        let newText
        let newCursorPosition

        if (lines.length === 1) {
          // If there's only one line, clear it but keep an empty line
          newText = ''
          newCursorPosition = 0
        } else if (isLastLine) {
          // If it's the last line, remove the line including the newline before it
          // Find the previous newline character
          const previousNewlinePos = editableText.lastIndexOf(
            '\n',
            currentLineStart - 1,
          )

          if (previousNewlinePos === -1) {
            // Edge case: First line is also last line but not the only line
            newText = ''
            newCursorPosition = 0
          } else {
            // Normal last line case - delete up to the previous newline
            newText = editableText.substring(0, previousNewlinePos)
            newCursorPosition = previousNewlinePos
          }
        } else {
          // Standard case: delete the entire line including its newline character
          newText =
            editableText.substring(0, currentLineStart) +
            editableText.substring(realLineEnd + 1)
          // Position cursor at the beginning of the next line (which is now at currentLineStart)
          newCursorPosition = currentLineStart
        }

        // Update text and cursor position
        updateLines(newText)
        setCursorPosition(newCursorPosition)
        // Reset virtual column since we're at the start of a line
        setVirtualColumn(0)

        // Clear the pending command
        setPendingCommand(null)
      } else {
        // Set 'd' as the pending command
        setPendingCommand('d')
      }
    },
    Escape: () => {
      // Clear any pending commands
      setPendingCommand(null)
      // setMode("normal");
    },
  }

  // Define insert mode key actions
  const insertModeActions: KeyActionMap = {
    Escape: () => {
      // Clear any pending commands
      setPendingCommand(null)
      // if cursor is at the end of the line move one character to the left
      const lineStart = findLineStart(editableText, cursorPosition)
      const nextCursorPosition = Math.max(lineStart, cursorPosition - 1)
      setCursorPosition(nextCursorPosition)
      setVirtualColumn(nextCursorPosition - lineStart)
      setMode('normal')
    },
    Backspace: () => {
      // Clear any pending commands
      setPendingCommand(null)
      if (cursorPosition > 0) {
        const newText =
          editableText.substring(0, cursorPosition - 1) +
          editableText.substring(cursorPosition)
        updateLines(newText)
        setCursorPosition(cursorPosition - 1)
      }
    },
    Enter: () => {
      // Clear any pending commands
      setPendingCommand(null)
      const newText =
        editableText.substring(0, cursorPosition) +
        '\n' +
        editableText.substring(cursorPosition)
      updateLines(newText)
      setCursorPosition(cursorPosition + 1)
    },
  }

  // Special handler for character input in insert mode
  const handleCharInput = (key: string) => {
    // Clear any pending commands in insert mode
    if (mode === 'normal' && pendingCommand && key !== pendingCommand) {
      setPendingCommand(null)
    }

    if (
      mode === VIM_MODES.INSERT &&
      key.length === 1 &&
      !Object.keys(insertModeActions).includes(key)
    ) {
      const newText =
        editableText.substring(0, cursorPosition) +
        key +
        editableText.substring(cursorPosition)
      updateLines(newText)
      setCursorPosition(cursorPosition + 1)
    }
  }

  // Use our custom keyboard handler
  const { lastKeyPressed } = useKeyboardHandler({
    keyActionMap: mode === 'normal' ? normalModeActions : insertModeActions,
    dependencies: [cursorPosition, editableText, mode],
    onAnyKey: handleCharInput,
  })

  return (
    <div className="w-full">
      <div className="text-center mb-4">
        <p className="text-zinc-400">
          Vim Playground - {mode === 'normal' ? 'Normal Mode' : 'Insert Mode'}
        </p>
      </div>

      <div className="relative w-full max-w-2xl bg-zinc-800 p-6 rounded-lg">
        <div className="flex relative">
          {/* Line number column - fixed position */}
          <div className="pr-3 text-right text-zinc-500 select-none border-r border-zinc-700 mr-3 min-w-[2.5rem] sticky left-0 z-10 bg-zinc-800">
            {lines.map((_, lineIdx) => (
              <div
                key={lineIdx}
                className="min-h-[1.5em] text-lg leading-relaxed font-mono"
              >
                {lineIdx + 1}
              </div>
            ))}
          </div>

          {/* Text content - scrollable */}
          <div
            ref={editorRef}
            className="flex-1 overflow-x-auto text-lg leading-relaxed font-mono"
          >
            {lines.map((line, lineIdx) => {
              // Calculate line start position in the entire text
              const lineStartPosition =
                editableText.split('\n').slice(0, lineIdx).join('\n').length +
                (lineIdx > 0 ? 1 : 0)
              // Calculate if cursor is on this line
              const isCursorOnThisLine =
                cursorPosition >= lineStartPosition &&
                (lineIdx === lines.length - 1 ||
                  cursorPosition < lineStartPosition + line.length + 1)

              return (
                <div key={lineIdx} className="min-h-[1.5em] whitespace-pre">
                  {line.split('').map((char, charIdx) => {
                    const absoluteIdx = lineStartPosition + charIdx
                    const isCursorPosition = absoluteIdx === cursorPosition
                    const isCursorOnLastChar =
                      absoluteIdx + 1 === cursorPosition

                    const isInsertMode = mode === 'insert'

                    const isCursorOnLastCharInInsertMode =
                      isInsertMode &&
                      isCursorOnLastChar &&
                      charIdx === line.length - 1

                    return (
                      <>
                        <span
                          key={charIdx}
                          ref={isCursorPosition ? cursorRef : null}
                          className={`${
                            isCursorPosition
                              ? mode === 'normal'
                                ? 'bg-emerald-500 text-white rounded'
                                : 'bg-amber-500 text-white rounded'
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
                  {/* empty line */}
                  {/* Display cursor on empty line */}
                  {line.length === 0 &&
                    (isCursorOnThisLine ? (
                      <span
                        ref={cursorRef}
                        className={
                          mode === 'normal'
                            ? 'bg-emerald-500 text-white rounded'
                            : 'bg-amber-500 text-white rounded'
                        }
                      >
                        {'\u00A0'}
                      </span>
                    ) : (
                      <span ref={cursorRef} className="">
                        {'\u00A0'}
                      </span>
                    ))}
                </div>
              )
            })}
          </div>
        </div>

        {/* Position display */}
        <div className="mt-4 flex justify-between items-center">
          <div className="text-sm text-zinc-400">
            <p>
              Normal mode: h,j,k,l (movement), w,e,b (word nav), 0,$ (line nav),
              i (insert), x (delete), dd (delete line)
            </p>
            <p>Insert mode: Type to insert text, Escape to exit</p>
          </div>
          <div className="px-3 py-1 bg-zinc-700 rounded text-zinc-300 text-sm font-mono">
            {(() => {
              // Calculate current row (1-indexed for display)
              const rowEndIndices = []
              let searchIndex = -1
              while (
                (searchIndex = editableText.indexOf('\n', searchIndex + 1)) !==
                -1
              ) {
                rowEndIndices.push(searchIndex)
              }

              const currentRow =
                rowEndIndices.filter((idx) => idx < cursorPosition).length + 1

              // Calculate current column (1-indexed for display)
              const lastNewlineBeforeCursor = editableText.lastIndexOf(
                '\n',
                cursorPosition - 1,
              )
              const currentCol =
                cursorPosition -
                (lastNewlineBeforeCursor === -1
                  ? 0
                  : lastNewlineBeforeCursor + 1) +
                1

              return `Char: ${cursorPosition}, Row: ${currentRow}, Col: ${currentCol}`
            })()}
          </div>
        </div>
      </div>

      <div className="flex gap-4 text-zinc-400 mt-4 justify-center">
        {mode === 'normal' ? (
          <>
            <kbd
              className={`px-3 py-1 bg-zinc-800 rounded-lg transition-all duration-150 ${
                lastKeyPressed === 'h'
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/50 scale-110'
                  : ''
              }`}
            >
              h
            </kbd>
            <kbd
              className={`px-3 py-1 bg-zinc-800 rounded-lg transition-all duration-150 ${
                lastKeyPressed === 'j'
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/50 scale-110'
                  : ''
              }`}
            >
              j
            </kbd>
            <kbd
              className={`px-3 py-1 bg-zinc-800 rounded-lg transition-all duration-150 ${
                lastKeyPressed === 'k'
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/50 scale-110'
                  : ''
              }`}
            >
              k
            </kbd>
            <kbd
              className={`px-3 py-1 bg-zinc-800 rounded-lg transition-all duration-150 ${
                lastKeyPressed === 'l'
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/50 scale-110'
                  : ''
              }`}
            >
              l
            </kbd>
            <kbd
              className={`px-3 py-1 bg-zinc-800 rounded-lg transition-all duration-150 ${
                lastKeyPressed === 'i'
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/50 scale-110'
                  : ''
              }`}
            >
              i
            </kbd>
            <kbd
              className={`px-3 py-1 bg-zinc-800 rounded-lg transition-all duration-150 ${
                lastKeyPressed === 'x'
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/50 scale-110'
                  : ''
              }`}
            >
              x
            </kbd>
            <kbd
              className={`px-3 py-1 bg-zinc-800 rounded-lg transition-all duration-150 ${
                lastKeyPressed === 'd'
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/50 scale-110'
                  : ''
              }`}
            >
              d
            </kbd>
            <kbd
              className={`px-3 py-1 bg-zinc-800 rounded-lg transition-all duration-150 ${
                lastKeyPressed === 'd'
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/50 scale-110'
                  : ''
              }`}
            >
              d
            </kbd>
          </>
        ) : (
          <kbd
            className={`px-3 py-1 bg-zinc-800 rounded-lg transition-all duration-150 ${
              lastKeyPressed === 'Escape'
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/50 scale-110'
                : ''
            }`}
          >
            Esc
          </kbd>
        )}
      </div>
      <WarningSplash />
    </div>
  )
}

export default PlaygroundLevel
