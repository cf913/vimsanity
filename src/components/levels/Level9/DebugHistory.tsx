import React, { useState } from 'react'
import { VIM_MODES, VimMode } from '../../../utils/constants'
import { useHistory } from '../../../hooks/useHistory'
import { useVimMotionsV2 } from '../../../hooks/useVimMotionsV2'
import { useKeyboardHandler } from '../../../hooks/useKeyboardHandler'

export function DebugHistory() {
  const [text, setText] = useState('Hello')
  const [cursorIndex, setCursorIndex] = useState(0)
  const [virtualColumn, setVirtualColumn] = useState(0)
  const [mode, setMode] = useState<VimMode>(VIM_MODES.NORMAL)
  const [logs, setLogs] = useState<string[]>([])

  const history = useHistory({ text: 'Hello', cursorIndex: 0 })

  const addLog = (message: string) => {
    setLogs(prev => [...prev.slice(-10), `${new Date().toLocaleTimeString()}: ${message}`])
  }

  // Log available keys when component mounts
  React.useEffect(() => {
    const availableKeys = Object.keys(keyActionMap)
    addLog(`Available keys: ${availableKeys.join(', ')}`)
  }, [keyActionMap])

  const customSetText = (newText: string) => {
    addLog(`Text changed: "${text}" -> "${newText}"`)
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
    setText: customSetText,
    history,
  })

  // Override undo and redo to add logging
  const debugKeyActionMap = {
    ...keyActionMap,
    'u': () => {
      addLog('Undo key pressed - before undo')
      addLog(`Before undo - Cursor: ${cursorIndex}, Text: "${text}"`)
      addLog(`Before undo - History: ${history.history.length}, Redo: ${history.redoHistory.length}`)
      
      if (keyActionMap['u']) {
        const result = keyActionMap['u']()
        addLog(`After undo - Cursor: ${cursorIndex}, Text: "${text}"`)
        addLog(`After undo - History: ${history.history.length}, Redo: ${history.redoHistory.length}`)
        return result
      } else {
        addLog('No undo handler found in keyActionMap')
      }
    },
    'ctrl+r': () => {
      addLog('Ctrl+R key pressed - before redo')
      addLog(`Before redo - Cursor: ${cursorIndex}, Text: "${text}"`)
      addLog(`Before redo - History: ${history.history.length}, Redo: ${history.redoHistory.length}`)
      
      if (keyActionMap['ctrl+r']) {
        const result = keyActionMap['ctrl+r']()
        addLog(`After redo - Cursor: ${cursorIndex}, Text: "${text}"`)
        addLog(`After redo - History: ${history.history.length}, Redo: ${history.redoHistory.length}`)
        return result
      } else {
        addLog('No ctrl+r handler found in keyActionMap')
      }
    },
    'x': () => {
      addLog('X key pressed (delete)')
      addLog(`Before delete - History: ${history.history.length}, Text: "${text}"`)
      const result = keyActionMap['x']?.()
      addLog(`After delete - History: ${history.history.length}, Text: "${text}"`)
      return result
    },
  }

  useKeyboardHandler({
    keyActionMap: debugKeyActionMap,
    onSetLastKeyPressed: (key) => {
      if (key) addLog(`Key detected: ${key}`)
    },
  })

  const manualUndo = () => {
    addLog('Manual undo button clicked')
    const result = history.undo()
    if (result) {
      setText(result.text)
      setCursorIndex(result.cursorIndex)
      addLog(`Manual undo successful: "${result.text}" cursor: ${result.cursorIndex}`)
    } else {
      addLog('Manual undo failed - no history')
    }
  }

  const manualRedo = () => {
    addLog('Manual redo button clicked')
    const result = history.redo()
    if (result) {
      setText(result.text)
      setCursorIndex(result.cursorIndex)
      addLog(`Manual redo successful: "${result.text}" cursor: ${result.cursorIndex}`)
    } else {
      addLog('Manual redo failed - no redo history')
    }
  }

  const addToHistory = () => {
    addLog('Adding current state to history')
    history.pushToHistory({ text, cursorIndex })
  }

  return (
    <div className="p-4 bg-zinc-800 text-white rounded-lg max-w-2xl">
      <h2 className="text-xl font-bold mb-4">Debug History Component</h2>
      
      <div className="mb-4">
        <div className="text-lg font-mono bg-zinc-900 p-2 rounded border">
          Text: "{text}" | Cursor: {cursorIndex} | Mode: {mode}
        </div>
      </div>

      <div className="mb-4">
        <div className="text-sm">
          History Length: {history.history.length} | 
          Redo Length: {history.redoHistory.length} | 
          Can Undo: {history.canUndo ? '✅' : '❌'} | 
          Can Redo: {history.canRedo ? '✅' : '❌'}
        </div>
      </div>

      <div className="mb-4 space-x-2">
        <button 
          onClick={manualUndo}
          className="px-3 py-1 bg-blue-600 rounded text-sm"
        >
          Manual Undo
        </button>
        <button 
          onClick={manualRedo}
          className="px-3 py-1 bg-green-600 rounded text-sm"
        >
          Manual Redo
        </button>
        <button 
          onClick={addToHistory}
          className="px-3 py-1 bg-purple-600 rounded text-sm"
        >
          Add to History
        </button>
      </div>

      <div className="mb-4">
        <div className="text-sm font-semibold mb-2">Instructions:</div>
        <div className="text-xs space-y-1">
          <div>• Press 'x' to delete a character (should save to history)</div>
          <div>• Press 'u' to undo</div>
          <div>• Press 'Ctrl+R' to redo</div>
        </div>
      </div>

      <div>
        <div className="text-sm font-semibold mb-2">Debug Log:</div>
        <div className="bg-zinc-900 p-2 rounded text-xs max-h-40 overflow-y-auto">
          {logs.map((log, index) => (
            <div key={index} className="mb-1">{log}</div>
          ))}
        </div>
      </div>
    </div>
  )
}