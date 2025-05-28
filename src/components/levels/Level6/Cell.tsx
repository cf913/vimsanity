import { useEffect, useState } from 'react'
import { useVimMotions } from '../../../hooks/useVimMotions'
import { VimMode, VIM_MODES } from '../../../utils/constants'
import {
  KeyActionMap,
  useKeyboardHandler,
} from '../../../hooks/useKeyboardHandler'
import { TextArea } from '../../common/TextArea'
import { TextEditor, TextEditorProps } from '../Level8/TextEditor'

export interface Cell {
  id: string
  content: string
  expected: string
  completed: boolean
}

interface CellProps {
  cell: Cell
  isActive: boolean
  setLastKeyPressed: (key: string | null) => void
  setCompletedCell: () => void
  mode: VimMode
  setMode: (mode: VimMode) => void
  resetCount: number
}

export function Cell({
  cell,
  isActive = false,
  setLastKeyPressed,
  setCompletedCell,
  mode,
  setMode,
  resetCount,
}: CellProps) {
  const [cursorIndex, setCursorIndex] = useState(0)
  const [virtualColumn, setVirtualColumn] = useState(0)
  const [text, setText] = useState<string>(cell.content)

  const initialHistory = [
    {
      text: cell.content,
      cursorIndex: 0,
    },
  ]

  // triggers a cell reset
  useEffect(() => {
    setText(cell.content)
    setCursorIndex(0)
    setVirtualColumn(0)
    setHistory(initialHistory)
    setMode(VIM_MODES.NORMAL)
  }, [resetCount])

  // History state for undo functionality
  const [history, setHistory] =
    useState<{ text: string; cursorIndex: number }[]>(initialHistory)

  // Redo history state for Ctrl+r functionality
  const [redoHistory, setRedoHistory] = useState<
    { text: string; cursorIndex: number }[]
  >([])

  // // Define key actions
  // const keyActions: KeyActionMap = {
  //   u: () => {
  //     if (!isInsertMode) {
  //       if (history.length === 0) return
  //
  //       let previousState = null
  //
  //       if (history.length === 1) {
  //         // If there's only one state, reset the level
  //         previousState = history[0]
  //       } else {
  //         // Otherwise, get the second last state from history (the last one is the current state)
  //         previousState = history[history.length - 2]
  //         // state on current cell if it's different
  //         // TODO: test this
  //         // if (previousState.activeCell !== activeCell) return
  //       }
  //
  //       // Restore the previous state
  //       setText(previousState.text)
  //       setCursorIndex(previousState.cursorIndex)
  //
  //       if (history.length > 1) {
  //         // Save the current state to redo history
  //         const currentState = history[history.length - 1]
  //         setRedoHistory((prev) => [...prev, currentState])
  //
  //         // Remove the old current state from history
  //         setHistory((prev) => prev.slice(0, -1))
  //       }
  //     }
  //   },
  // }
  //
  // const insertModeActions: KeyActionMap = {
  //   Escape: () => {
  //     keyActionMap['Escape']()
  //     // Save the state to history when exiting insert mode (following Vim behavior)
  //     // Create deep copies of cells for history
  //     let newCursorIndex = cursorIndex
  //
  //     if (cursorIndex > 0) {
  //       newCursorIndex = cursorIndex - 1
  //     }
  //
  //     const textCopy = text
  //     // Save current state to history before switching to normal mode
  //     setHistory((prev) => [
  //       ...prev,
  //       { text: textCopy, cursorIndex: newCursorIndex },
  //     ])
  //
  //     // Clear redo history when making a new change (following Vim behavior)
  //     setRedoHistory([])
  //
  //     // Check if the current cell is completed
  //     if (text === cell.expected && !cell.completed) {
  //       // Mark as completed
  //       setCompletedCell()
  //     }
  //   },
  // }
  //
  // const handleCtrlR = (e: KeyboardEvent) => {
  //   // Check if Ctrl+r was pressed
  //   if (e.ctrlKey && e.key === 'r') {
  //     console.log('ctrl+r')
  //     e.preventDefault() // Prevent browser refresh
  //
  //     if (!isInsertMode) {
  //       // setLastKeyPressed('ctrl+r')
  //
  //       if (redoHistory.length === 0) return
  //
  //       // Get the last state from redo history
  //       const nextState = redoHistory[redoHistory.length - 1]
  //
  //       // Only redo if we're on the same cell
  //       // TODO: test this
  //       // if (nextState.activeCell !== activeCell) return
  //
  //       // Create a deep copy of the cells from redo history
  //
  //       // Restore the next state
  //       setCursorIndex(nextState.cursorIndex)
  //       setText(nextState.text)
  //       //
  //       // Add the restored state back to history
  //       setHistory((prev) => [...prev, nextState])
  //       //
  //       // Remove the restored state from redo history
  //       setRedoHistory((prev) => prev.slice(0, -1))
  //     }
  //   }
  // }
  //

  const textEditorProps: TextEditorProps = {
    initialText: cell.content,
    mode,
    setMode,
    setLastKeyPressed,
    activeKeys: ['h', 'l', 'j', 'k', 'i', 'a'],
    onCompleted: ({ newText }: Record<string, any>) => {
      // Check if the current cell is completed
      if (newText === cell.expected && !cell.completed) {
        setCompletedCell()
        setText(newText)
      }
    },
  }

  return (
    <div
      key={cell.id}
      className={`relative flex flex-col justify-center items-center p-4 rounded-lg transition-all duration-200 ${
        isActive
          ? 'bg-zinc-700 ring-2 ring-emerald-500 shadow-lg'
          : 'bg-zinc-800'
      } ${cell.completed ? 'border-2 border-emerald-500' : ''}`}
    >
      <div className="text-2xl font-mono mb-2 min-h-[2rem]">
        {isActive ? <TextEditor {...textEditorProps} /> : text || '\u00A0'}
      </div>
      <div className="text-sm text-zinc-400 absolute bottom-2">
        Expected: {cell.expected}
      </div>
      {cell.completed && (
        <div className="absolute top-2 right-2">
          <span className="text-emerald-500 text-xl">✓</span>
        </div>
      )}
    </div>
  )
}
