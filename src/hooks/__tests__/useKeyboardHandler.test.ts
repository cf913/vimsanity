/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react'
import { useKeyboardHandler } from '../useKeyboardHandler'

describe('useKeyboardHandler', () => {
  beforeEach(() => {
    // Clear any existing event listeners
    document.removeEventListener = jest.fn()
    document.addEventListener = jest.fn()
    window.removeEventListener = jest.fn()
    window.addEventListener = jest.fn()
  })

  it('should detect ctrl+r key combination', () => {
    const mockHandler = jest.fn()
    const keyActionMap = {
      'ctrl+r': mockHandler,
    }

    renderHook(() => useKeyboardHandler({ keyActionMap }))

    // Get the event listener that was added
    const addEventListener = window.addEventListener as jest.Mock
    expect(addEventListener).toHaveBeenCalledWith('keydown', expect.any(Function))
    
    const keydownHandler = addEventListener.mock.calls[0][1]

    // Simulate Ctrl+R keydown event
    const event = new KeyboardEvent('keydown', {
      key: 'r',
      ctrlKey: true,
      bubbles: true,
    })

    // Mock preventDefault
    event.preventDefault = jest.fn()

    keydownHandler(event)

    expect(event.preventDefault).toHaveBeenCalled()
    expect(mockHandler).toHaveBeenCalled()
  })

  it('should detect normal keys without modifiers', () => {
    const mockHandler = jest.fn()
    const keyActionMap = {
      'u': mockHandler,
    }

    renderHook(() => useKeyboardHandler({ keyActionMap }))

    const addEventListener = window.addEventListener as jest.Mock
    const keydownHandler = addEventListener.mock.calls[0][1]

    // Simulate 'u' keydown event
    const event = new KeyboardEvent('keydown', {
      key: 'u',
      ctrlKey: false,
      bubbles: true,
    })

    event.preventDefault = jest.fn()
    keydownHandler(event)

    expect(event.preventDefault).toHaveBeenCalled()
    expect(mockHandler).toHaveBeenCalled()
  })

  it('should prioritize combination keys over single keys', () => {
    const mockCtrlHandler = jest.fn()
    const mockRegularHandler = jest.fn()
    const keyActionMap = {
      'ctrl+r': mockCtrlHandler,
      'r': mockRegularHandler,
    }

    renderHook(() => useKeyboardHandler({ keyActionMap }))

    const addEventListener = window.addEventListener as jest.Mock
    const keydownHandler = addEventListener.mock.calls[0][1]

    // Simulate Ctrl+R - should call ctrl+r handler, not r handler
    const event = new KeyboardEvent('keydown', {
      key: 'r',
      ctrlKey: true,
      bubbles: true,
    })

    event.preventDefault = jest.fn()
    keydownHandler(event)

    expect(mockCtrlHandler).toHaveBeenCalled()
    expect(mockRegularHandler).not.toHaveBeenCalled()
  })
})