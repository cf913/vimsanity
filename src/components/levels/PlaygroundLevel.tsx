import React, { useEffect, useRef, useState } from 'react'
import { useVimMotionsV2 } from '../../hooks/useVimMotionsV2'
import { VimMode } from '../../utils/constants'
import WarningSplash from '../common/WarningSplash'
import { TextEditor } from './Level8/TextEditor'

interface PlaygroundLevelProps {
  isMuted: boolean
}

const PlaygroundLevel: React.FC<PlaygroundLevelProps> = () => {
  const [editableText, setEditableText] = useState<string>(
    'This is a Vim playground. Practice your motions here!\n\nNew levels are being added every week!\n\nYou can use h, j, k, l for movement.\nTry w, e, b for word navigation.\nUse i to enter insert mode, Escape to exit.\nPress x to delete characters.',
  )
  const [cursorPosition, setCursorPosition] = useState<number>(0)
  const [mode, setMode] = useState<VimMode>('normal')
  const [lastKeyPressed, setLastKeyPressed] = useState<string | null>(null)
  // Store the "virtual" column for j/k navigation
  const [virtualColumn, setVirtualColumn] = useState<number>(0)

  // Refs for auto-scrolling
  const editorRef = useRef<HTMLDivElement>(null)
  const cursorRef = useRef<HTMLSpanElement>(null)

  useVimMotionsV2({
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

  const editorProps = {
    initialText: editableText,
    mode,
    setMode,
    setLastKeyPressed,
    editor: {
      showLineNumbers: true,
    },
  }

  return (
    <div className="w-full">
      <div className="text-center mb-4">
        <p className="text-text-muted">
          Vim Playground - {mode === 'normal' ? 'Normal Mode' : 'Insert Mode'}
        </p>
      </div>

      <div className="relative w-full max-w-2xl bg-bg-secondary p-6 rounded-lg">
        <TextEditor {...editorProps} />
      </div>

      <div className="mt-8">
        {/* Position display */}
        <div className="mt-4 flex justify-between items-center">
          <div className="text-sm text-text-muted">
            <p>
              Normal mode: h,j,k,l (movement), w,e,b (word nav), 0,$ (line nav),
              i (insert), x (delete), dd (delete line)
            </p>
            <p>Insert mode: Type to insert text, Escape to exit</p>
          </div>
          <div className="px-3 py-1 bg-bg-tertiary rounded text-text-secondary text-sm font-mono">
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

      <div className="flex gap-4 text-text-muted mt-4 justify-center">
        {mode === 'normal' ? (
          <>
            <kbd
              className={`px-3 py-1 bg-bg-secondary rounded-lg transition-all duration-150 ${
                lastKeyPressed === 'h'
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/50 scale-110'
                  : ''
              }`}
            >
              h
            </kbd>
            <kbd
              className={`px-3 py-1 bg-bg-secondary rounded-lg transition-all duration-150 ${
                lastKeyPressed === 'j'
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/50 scale-110'
                  : ''
              }`}
            >
              j
            </kbd>
            <kbd
              className={`px-3 py-1 bg-bg-secondary rounded-lg transition-all duration-150 ${
                lastKeyPressed === 'k'
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/50 scale-110'
                  : ''
              }`}
            >
              k
            </kbd>
            <kbd
              className={`px-3 py-1 bg-bg-secondary rounded-lg transition-all duration-150 ${
                lastKeyPressed === 'l'
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/50 scale-110'
                  : ''
              }`}
            >
              l
            </kbd>
            <kbd
              className={`px-3 py-1 bg-bg-secondary rounded-lg transition-all duration-150 ${
                lastKeyPressed === 'i'
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/50 scale-110'
                  : ''
              }`}
            >
              i
            </kbd>
            <kbd
              className={`px-3 py-1 bg-bg-secondary rounded-lg transition-all duration-150 ${
                lastKeyPressed === 'x'
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/50 scale-110'
                  : ''
              }`}
            >
              x
            </kbd>
            <kbd
              className={`px-3 py-1 bg-bg-secondary rounded-lg transition-all duration-150 ${
                lastKeyPressed === 'd'
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/50 scale-110'
                  : ''
              }`}
            >
              d
            </kbd>
            <kbd
              className={`px-3 py-1 bg-bg-secondary rounded-lg transition-all duration-150 ${
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
            className={`px-3 py-1 bg-bg-secondary rounded-lg transition-all duration-150 ${
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
