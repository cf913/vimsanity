import { useState, useCallback, useEffect } from 'react'

// Define a type for key handlers
export type KeyHandler = () => void

// Define a type for the key action map
export interface KeyActionMap {
  [key: string]: KeyHandler
}

interface UseKeyboardHandlerProps {
  keyActionMap: KeyActionMap
  dependencies?: unknown[]
  onAnyKey?: (key: string) => void
  onCtrlKeys?: (e: KeyboardEvent) => void
  onSetLastKeyPressed?: (key: string | null) => void
  disabled?: boolean
}

export const useKeyboardHandler = ({
  keyActionMap,
  dependencies = [],
  onAnyKey,
  onCtrlKeys,
  onSetLastKeyPressed,
  disabled = false,
}: UseKeyboardHandlerProps) => {
  const [lastKeyPressed, setLastKeyPressed] = useState<string | null>(null)

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Skip if target is an input, textarea, or contentEditable element
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target instanceof HTMLElement && e.target.isContentEditable)
      ) {
        return
      }

      // Skip event handling if disabled
      if (disabled) return

      e.preventDefault()

      // Set the last key pressed for animation
      setLastKeyPressed(e.key)
      if (onSetLastKeyPressed) {
        onSetLastKeyPressed(e.key)
      }

      // Reset the animation after a short delay
      setTimeout(() => {
        setLastKeyPressed(null)
        if (onSetLastKeyPressed) {
          onSetLastKeyPressed(null)
        }
      }, 150)

      // Call the onAnyKey handler if provided
      if (onAnyKey) {
        onAnyKey(e.key)
      }

      if (onCtrlKeys) {
        onCtrlKeys(e)
      }

      // Build the key string based on modifiers
      let keyString = ''
      if (e.ctrlKey && e.key !== 'Control') keyString += 'ctrl+'
      if (e.shiftKey && e.key !== 'Shift') keyString += 'shift+'
      if (e.altKey && e.key !== 'Alt') keyString += 'alt+'
      if (e.metaKey && e.key !== 'Meta') keyString += 'meta+'
      keyString += e.key.toLowerCase()

      // Check if there's a handler for the full key combination first
      let handler = keyActionMap[keyString]
      
      // Fall back to just the key if no combination handler exists
      if (!handler) {
        handler = keyActionMap[e.key]
      }
      
      if (handler) {
        handler()
      }
    },
    [keyActionMap, onAnyKey, disabled],
  )

  useEffect(() => {
    // Re-create effect when dependencies change
    const keyHandler = (e: KeyboardEvent) => handleKeyDown(e)
    window.addEventListener('keydown', keyHandler)
    return () => window.removeEventListener('keydown', keyHandler)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleKeyDown, ...dependencies])

  return { lastKeyPressed }
}
