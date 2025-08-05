import { Fragment, useEffect, useState } from 'react'
import { VIM_MODES, VimMode } from '../../../utils/constants'
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

export function Cell7({
  cell,
  isActive = false,
  setLastKeyPressed,
  setCompletedCell,
  mode,
  setMode,
  resetCount,
}: CellProps) {
  const [text, setText] = useState<string>(cell.content)

  // triggers a cell reset
  useEffect(() => {
    setText(cell.content)
    setMode(VIM_MODES.NORMAL)
  }, [resetCount, cell.content, setMode])

  const textEditorProps: TextEditorProps = {
    initialText: cell.content,
    mode,
    setMode,
    setLastKeyPressed,
    activeKeys: ['h', 'l', 'j', 'k', 'i', 'a', 'I', 'A', 'o', 'O'],
    onCompleted: ({ newText }: { newText: string }) => {
      // Check if the current cell is completed
      if (newText === cell.expected && !cell.completed) {
        setCompletedCell()
        setText(newText)
      }
    },
    editor: {
      fontSize: 20,
    },
  }

  return (
    <div
      key={cell.id}
      className={`relative p-4 rounded-lg transition-all duration-200 ${
        isActive
          ? 'bg-zinc-700 ring-2 ring-emerald-500 shadow-lg'
          : 'bg-zinc-800'
      } ${cell.completed ? 'border-2 border-emerald-500' : ''}`}
    >
      <div className="text-xl font-mono mb-2 min-h-[2rem]">
        {isActive ? <TextEditor {...textEditorProps} /> : text || '\u00A0'}
      </div>
      <div className="text-sm text-zinc-400 mt-2 border-t border-zinc-700 pt-2">
        <div className="font-semibold mb-1">Expected:</div>
        <div className="whitespace-pre-wrap">
          {cell.expected.split('\n').map((part, i, arr) => (
            <Fragment key={i}>
              {part}
              {i < arr.length - 1 && <br />}
            </Fragment>
          ))}
        </div>
      </div>
      {cell.completed && (
        <div className="absolute top-2 right-2">
          <span className="text-emerald-500 text-xl">✓</span>
        </div>
      )}
    </div>
  )
}
