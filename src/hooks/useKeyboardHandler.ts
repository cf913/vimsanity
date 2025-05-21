import { useState, useCallback, useEffect } from 'react'

// Define a type for key handlers
export type KeyHandler = (key: string) => void

// Define a type for the key action map
export interface KeyActionMap {
  [key: string]: KeyHandler
}

interface UseKeyboardHandlerProps {
  keyActionMap: KeyActionMap
  dependencies?: unknown[]
  onAnyKey?: (key: string) => void
  onCtrlKeys?: (e: KeyboardEvent) => void
  disabled?: boolean
}

export const useKeyboardHandler = ({
  keyActionMap,
  dependencies = [],
  onAnyKey,
  onCtrlKeys,
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

      // Reset the animation after a short delay
      setTimeout(() => {
        setLastKeyPressed(null)
      }, 150)

      // Call the onAnyKey handler if provided
      if (onAnyKey) {
        onAnyKey(e.key)
      }

      if (onCtrlKeys) {
        onCtrlKeys(e)
      }

      // Check if there's a handler for this key
      const handler = keyActionMap[e.key]
      if (handler) {
        handler(e.key)
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
