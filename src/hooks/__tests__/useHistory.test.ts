import { renderHook, act } from '@testing-library/react'
import { useHistory } from '../useHistory'

describe('useHistory', () => {
  const initialState = { text: 'Hello', cursorIndex: 0 }

  it('should initialize with the initial state', () => {
    const { result } = renderHook(() => useHistory(initialState))

    expect(result.current.history).toEqual([initialState])
    expect(result.current.redoHistory).toEqual([])
    expect(result.current.canUndo).toBe(false)
    expect(result.current.canRedo).toBe(false)
  })

  it('should push new states to history', () => {
    const { result } = renderHook(() => useHistory(initialState))
    const newState = { text: 'Hello World', cursorIndex: 11 }

    act(() => {
      result.current.pushToHistory(newState)
    })

    expect(result.current.history).toHaveLength(2)
    expect(result.current.history[1]).toEqual(newState)
    expect(result.current.canUndo).toBe(true)
  })

  it('should undo to previous state', () => {
    const { result } = renderHook(() => useHistory(initialState))
    const state2 = { text: 'Hello World', cursorIndex: 11 }

    act(() => {
      result.current.pushToHistory(state2)
    })

    let undoResult
    act(() => {
      undoResult = result.current.undo()
    })

    expect(undoResult).toEqual(initialState)
    expect(result.current.history).toHaveLength(1)
    expect(result.current.redoHistory).toHaveLength(1)
    expect(result.current.canUndo).toBe(false)
    expect(result.current.canRedo).toBe(true)
  })

  it('should redo previously undone state', () => {
    const { result } = renderHook(() => useHistory(initialState))
    const state2 = { text: 'Hello World', cursorIndex: 11 }

    act(() => {
      result.current.pushToHistory(state2)
      result.current.undo()
    })

    let redoResult
    act(() => {
      redoResult = result.current.redo()
    })

    expect(redoResult).toEqual(state2)
    expect(result.current.history).toHaveLength(2)
    expect(result.current.redoHistory).toHaveLength(0)
    expect(result.current.canUndo).toBe(true)
    expect(result.current.canRedo).toBe(false)
  })

  it('should clear redo history when new state is pushed', () => {
    const { result } = renderHook(() => useHistory(initialState))
    const state2 = { text: 'Hello World', cursorIndex: 11 }
    const state3 = { text: 'Hello Universe', cursorIndex: 14 }

    act(() => {
      result.current.pushToHistory(state2)
      result.current.undo()
      result.current.pushToHistory(state3)
    })

    expect(result.current.redoHistory).toHaveLength(0)
    expect(result.current.canRedo).toBe(false)
  })

  it('should return null when undoing with only initial state', () => {
    const { result } = renderHook(() => useHistory(initialState))

    let undoResult
    act(() => {
      undoResult = result.current.undo()
    })

    expect(undoResult).toBeNull()
  })

  it('should return null when redoing with empty redo history', () => {
    const { result } = renderHook(() => useHistory(initialState))

    let redoResult
    act(() => {
      redoResult = result.current.redo()
    })

    expect(redoResult).toBeNull()
  })
})