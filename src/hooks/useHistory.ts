import { useState, useCallback } from 'react'

export interface HistoryState {
  text: string
  cursorIndex: number
}

export interface UseHistoryReturn {
  history: HistoryState[]
  redoHistory: HistoryState[]
  pushToHistory: (state: HistoryState) => void
  undo: () => HistoryState | null
  redo: () => HistoryState | null
  clearHistory: () => void
  canUndo: boolean
  canRedo: boolean
}

export const useHistory = (initialState: HistoryState): UseHistoryReturn => {
  const [history, setHistory] = useState<HistoryState[]>([initialState])
  const [redoHistory, setRedoHistory] = useState<HistoryState[]>([])

  const pushToHistory = useCallback((state: HistoryState) => {
    setHistory(prev => [...prev, state])
    // Clear redo history when new state is added
    setRedoHistory([])
  }, [])

  const undo = useCallback((): HistoryState | null => {
    if (history.length <= 1) return null

    // Get the current state (last in history) and previous state (second to last)
    const currentState = history[history.length - 1]
    const previousState = history[history.length - 2]

    // Move current state to redo history
    setRedoHistory(prev => [...prev, currentState])
    
    // Remove current state from history
    setHistory(prev => prev.slice(0, -1))

    return previousState
  }, [history])

  const redo = useCallback((): HistoryState | null => {
    if (redoHistory.length === 0) return null

    // Get the last state from redo history
    const redoState = redoHistory[redoHistory.length - 1]

    // Add the restored state back to history
    setHistory(prev => [...prev, redoState])
    
    // Remove the restored state from redo history
    setRedoHistory(prev => prev.slice(0, -1))

    return redoState
  }, [redoHistory])

  const clearHistory = useCallback(() => {
    setHistory([initialState])
    setRedoHistory([])
  }, [initialState])

  return {
    history,
    redoHistory,
    pushToHistory,
    undo,
    redo,
    clearHistory,
    canUndo: history.length > 1,
    canRedo: redoHistory.length > 0,
  }
}