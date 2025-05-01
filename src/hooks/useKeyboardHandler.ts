import { useState, useCallback, useEffect } from 'react';

// Define a type for key handlers
export type KeyHandler = (key: string) => void;

// Define a type for the key action map
export interface KeyActionMap {
  [key: string]: KeyHandler;
}

interface UseKeyboardHandlerProps {
  keyActionMap: KeyActionMap;
  dependencies?: any[];
  onAnyKey?: (key: string) => void;
}

export const useKeyboardHandler = ({
  keyActionMap,
  dependencies = [],
  onAnyKey
}: UseKeyboardHandlerProps) => {
  const [lastKeyPressed, setLastKeyPressed] = useState<string | null>(null);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    e.preventDefault();
    
    // Set the last key pressed for animation
    setLastKeyPressed(e.key);
    
    // Reset the animation after a short delay
    setTimeout(() => {
      setLastKeyPressed(null);
    }, 150);
    
    // Call the onAnyKey handler if provided
    if (onAnyKey) {
      onAnyKey(e.key);
    }
    
    // Check if there's a handler for this key
    const handler = keyActionMap[e.key];
    if (handler) {
      handler(e.key);
    }
  }, [keyActionMap, onAnyKey, ...dependencies]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return { lastKeyPressed };
};
