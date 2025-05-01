import React, { useState } from "react"
import {
  useKeyboardHandler,
  KeyActionMap,
} from "../../hooks/useKeyboardHandler"
import {
  findLineEnd,
  findLineStart,
  moveToNextLine,
  moveToNextWordBoundary,
  moveToPrevLine,
  moveToPrevWordBoundary,
  moveToWordEnd,
} from "../../utils/textUtils"

interface PlaygroundLevelProps {
  isMuted: boolean
}

const PlaygroundLevel: React.FC<PlaygroundLevelProps> = ({ isMuted }) => {
  const [editableText, setEditableText] = useState<string>(
    "This is a Vim playground. Practice your motions here!\n\nYou can use h, j, k, l for movement.\nTry w, e, b for word navigation.\nUse i to enter insert mode, Escape to exit.\nPress x to delete characters."
  )
  const [cursorPosition, setCursorPosition] = useState<number>(0)
  const [mode, setMode] = useState<"normal" | "insert">("normal")
  const [lines, setLines] = useState<string[]>(editableText.split("\n"))
  // Store the "virtual" column for j/k navigation
  const [virtualColumn, setVirtualColumn] = useState<number>(0)

  const updateLines = (text: string) => {
    setEditableText(text)
    setLines(text.split("\n"))
  }

  // Helper to get the current column position
  const getCurrentColumn = () => {
    const lineStart = findLineStart(editableText, cursorPosition)
    return cursorPosition - lineStart
  }

  // Helper to set cursor based on line and virtual column
  const setCursorToLineAndColumn = (
    lineStart: number,
    targetColumn: number,
    lineLength: number
  ) => {
    // For empty lines or if target column exceeds line length, place at line start or end
    if (lineLength === 0) {
      setCursorPosition(lineStart)
    } else {
      // Calculate actual column (bounded by line length)
      const actualColumn = Math.min(
        targetColumn,
        lineLength > 0 ? lineLength - 1 : 0
      )
      setCursorPosition(lineStart + actualColumn)
    }
  }

  // Define normal mode key actions
  const normalModeActions: KeyActionMap = {
    h: () => {
      // Only move left if not at the beginning of a line
      const lineStart = findLineStart(editableText, cursorPosition)
      if (cursorPosition > lineStart) {
        setCursorPosition(cursorPosition - 1)
        // Update virtual column when moving horizontally
        setVirtualColumn(getCurrentColumn() - 1)
      }
    },
    l: () => {
      // Only move right if not at the end of a line
      const lineEnd = findLineEnd(editableText, cursorPosition)
      if (cursorPosition < lineEnd) {
        setCursorPosition(cursorPosition + 1)
        // Update virtual column when moving horizontally
        setVirtualColumn(getCurrentColumn() + 1)
      }
    },
    j: () => {
      // Get current line start and column
      const currentLineStart = findLineStart(editableText, cursorPosition)
      const currentColumn = cursorPosition - currentLineStart

      // Remember this column if it's not already saved
      // or if horizontal movement has changed it
      if (currentColumn > virtualColumn) {
        setVirtualColumn(currentColumn)
      }

      // Find the next line boundaries
      const currentLineEnd = editableText.indexOf("\n", cursorPosition)
      if (currentLineEnd === -1) return // Already at the last line

      const nextLineStart = currentLineEnd + 1
      const nextLineEnd = editableText.indexOf("\n", nextLineStart)
      const nextLineLength =
        (nextLineEnd === -1 ? editableText.length : nextLineEnd) - nextLineStart

      // Set cursor to appropriate position in next line based on virtual column
      setCursorToLineAndColumn(nextLineStart, virtualColumn, nextLineLength)
    },
    k: () => {
      // Get current line start and column
      const currentLineStart = findLineStart(editableText, cursorPosition)
      const currentColumn = cursorPosition - currentLineStart

      // Remember this column if it's not already saved
      // or if horizontal movement has changed it
      if (currentColumn > virtualColumn) {
        setVirtualColumn(currentColumn)
      }

      // Cannot go up if already at first line
      if (currentLineStart <= 0) return

      // Find the previous line boundaries
      const prevLineEnd = currentLineStart - 1
      const prevLineStart = editableText.lastIndexOf("\n", prevLineEnd - 1) + 1
      const prevLineLength = prevLineEnd - prevLineStart

      // Set cursor to appropriate position in previous line based on virtual column
      setCursorToLineAndColumn(prevLineStart, virtualColumn, prevLineLength)
    },
    w: () => {
      setCursorPosition(
        moveToNextWordBoundary(editableText.split(""), cursorPosition)
      )
    },
    e: () => {
      setCursorPosition(moveToWordEnd(editableText.split(""), cursorPosition))
    },
    b: () => {
      setCursorPosition(
        moveToPrevWordBoundary(editableText.split(""), cursorPosition)
      )
    },
    "0": () => {
      setCursorPosition(findLineStart(editableText, cursorPosition))
    },
    $: () => {
      setCursorPosition(findLineEnd(editableText, cursorPosition))
    },
    i: () => {
      setMode("insert")
    },
    x: () => {
      if (cursorPosition < editableText.length) {
        const newText =
          editableText.substring(0, cursorPosition) +
          editableText.substring(cursorPosition + 1)
        updateLines(newText)
      }
    },
    Escape: () => {
      setMode("normal")
    },
  }

  // Define insert mode key actions
  const insertModeActions: KeyActionMap = {
    Escape: () => {
      setMode("normal")
    },
    Backspace: () => {
      if (cursorPosition > 0) {
        const newText =
          editableText.substring(0, cursorPosition - 1) +
          editableText.substring(cursorPosition)
        updateLines(newText)
        setCursorPosition(cursorPosition - 1)
      }
    },
    Enter: () => {
      const newText =
        editableText.substring(0, cursorPosition) +
        "\n" +
        editableText.substring(cursorPosition)
      updateLines(newText)
      setCursorPosition(cursorPosition + 1)
    },
  }

  // Special handler for character input in insert mode
  const handleCharInput = (key: string) => {
    if (
      mode === "insert" &&
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
    keyActionMap: mode === "normal" ? normalModeActions : insertModeActions,
    dependencies: [cursorPosition, editableText, mode],
    onAnyKey: handleCharInput,
  })

  return (
    <div className="w-full">
      <div className="text-center mb-4">
        <p className="text-zinc-400">
          Vim Playground - {mode === "normal" ? "Normal Mode" : "Insert Mode"}
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
          <div className="flex-1 overflow-x-auto text-lg leading-relaxed font-mono">
            {lines.map((line, lineIdx) => {
              // Calculate line start position in the entire text
              const lineStartPosition =
                editableText.split("\n").slice(0, lineIdx).join("\n").length +
                (lineIdx > 0 ? 1 : 0)
              // Calculate if cursor is on this line
              const isCursorOnThisLine =
                cursorPosition >= lineStartPosition &&
                (lineIdx === lines.length - 1 ||
                  cursorPosition < lineStartPosition + line.length + 1)

              return (
                <div key={lineIdx} className="min-h-[1.5em] whitespace-pre">
                  {line.split("").map((char, charIdx) => {
                    const absoluteIdx = lineStartPosition + charIdx
                    const isCursorPosition = absoluteIdx === cursorPosition

                    return (
                      <span
                        key={charIdx}
                        className={`${
                          isCursorPosition
                            ? mode === "normal"
                              ? "bg-emerald-500 text-white rounded"
                              : "bg-amber-500 text-white rounded"
                            : ""
                        }`}
                      >
                        {char === " " ? "\u00A0" : char}
                      </span>
                    )
                  })}
                  {/* Display cursor on empty line */}
                  {line.length === 0 && isCursorOnThisLine && (
                    <span
                      className={
                        mode === "normal"
                          ? "bg-emerald-500 text-white rounded"
                          : "bg-amber-500 text-white rounded"
                      }
                    >
                      {"\u00A0"}
                    </span>
                  )}
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
              i (insert), x (delete)
            </p>
            <p>Insert mode: Type to insert text, Escape to exit</p>
          </div>
          <div className="px-3 py-1 bg-zinc-700 rounded text-zinc-300 text-sm font-mono">
            {(() => {
              // Calculate current row (1-indexed for display)
              const rowEndIndices = []
              let searchIndex = -1
              while (
                (searchIndex = editableText.indexOf("\n", searchIndex + 1)) !==
                -1
              ) {
                rowEndIndices.push(searchIndex)
              }

              const currentRow =
                rowEndIndices.filter((idx) => idx < cursorPosition).length + 1

              // Calculate current column (1-indexed for display)
              const lastNewlineBeforeCursor = editableText.lastIndexOf(
                "\n",
                cursorPosition - 1
              )
              const currentCol =
                cursorPosition -
                (lastNewlineBeforeCursor === -1
                  ? 0
                  : lastNewlineBeforeCursor + 1) +
                1

              return `Row: ${currentRow}, Col: ${currentCol}`
            })()}
          </div>
        </div>
      </div>

      <div className="flex gap-4 text-zinc-400 mt-4 justify-center">
        {mode === "normal" ? (
          <>
            <kbd
              className={`px-3 py-1 bg-zinc-800 rounded-lg transition-all duration-150 ${
                lastKeyPressed === "h"
                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/50 scale-110"
                  : ""
              }`}
            >
              h
            </kbd>
            <kbd
              className={`px-3 py-1 bg-zinc-800 rounded-lg transition-all duration-150 ${
                lastKeyPressed === "j"
                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/50 scale-110"
                  : ""
              }`}
            >
              j
            </kbd>
            <kbd
              className={`px-3 py-1 bg-zinc-800 rounded-lg transition-all duration-150 ${
                lastKeyPressed === "k"
                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/50 scale-110"
                  : ""
              }`}
            >
              k
            </kbd>
            <kbd
              className={`px-3 py-1 bg-zinc-800 rounded-lg transition-all duration-150 ${
                lastKeyPressed === "l"
                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/50 scale-110"
                  : ""
              }`}
            >
              l
            </kbd>
            <kbd
              className={`px-3 py-1 bg-zinc-800 rounded-lg transition-all duration-150 ${
                lastKeyPressed === "i"
                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/50 scale-110"
                  : ""
              }`}
            >
              i
            </kbd>
            <kbd
              className={`px-3 py-1 bg-zinc-800 rounded-lg transition-all duration-150 ${
                lastKeyPressed === "x"
                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/50 scale-110"
                  : ""
              }`}
            >
              x
            </kbd>
          </>
        ) : (
          <kbd
            className={`px-3 py-1 bg-zinc-800 rounded-lg transition-all duration-150 ${
              lastKeyPressed === "Escape"
                ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/50 scale-110"
                : ""
            }`}
          >
            Esc
          </kbd>
        )}
      </div>
    </div>
  )
}

export default PlaygroundLevel
