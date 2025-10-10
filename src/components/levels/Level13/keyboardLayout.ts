import { KeyPosition } from './types'

export const keyboardLayout: KeyPosition[] = [
  // Row 1 - Number row
  { key: 'Escape', label: 'Esc', displayLabel: 'Esc', row: 0, column: 0, width: 1.5, isSpecial: true },
  { key: '1', label: '1', displayLabel: '1', row: 0, column: 1 },
  { key: '2', label: '2', displayLabel: '2', row: 0, column: 2 },
  { key: '3', label: '3', displayLabel: '3', row: 0, column: 3 },
  { key: '4', label: '4', displayLabel: '4', row: 0, column: 4 },
  { key: '5', label: '5', displayLabel: '5', row: 0, column: 5 },
  { key: '6', label: '6', displayLabel: '6', row: 0, column: 6 },
  { key: '7', label: '7', displayLabel: '7', row: 0, column: 7 },
  { key: '8', label: '8', displayLabel: '8', row: 0, column: 8 },
  { key: '9', label: '9', displayLabel: '9', row: 0, column: 9 },
  { key: '0', label: '0', displayLabel: '0', row: 0, column: 10 },
  { key: '-', label: '-', displayLabel: '-', row: 0, column: 11 },
  { key: '=', label: '=', displayLabel: '=', row: 0, column: 12 },
  { key: 'Backspace', label: 'Del', displayLabel: 'Del', row: 0, column: 13, width: 1.5, isSpecial: true },

  // Row 2 - QWERTY row
  { key: 'Tab', label: 'Tab', displayLabel: 'Tab', row: 1, column: 0, width: 1.5, isSpecial: true },
  { key: 'q', label: 'q', displayLabel: 'q', row: 1, column: 1 },
  { key: 'w', label: 'w', displayLabel: 'w', row: 1, column: 2 },
  { key: 'e', label: 'e', displayLabel: 'e', row: 1, column: 3 },
  { key: 'r', label: 'r', displayLabel: 'r', row: 1, column: 4 },
  { key: 't', label: 't', displayLabel: 't', row: 1, column: 5 },
  { key: 'y', label: 'y', displayLabel: 'y', row: 1, column: 6 },
  { key: 'u', label: 'u', displayLabel: 'u', row: 1, column: 7 },
  { key: 'i', label: 'i', displayLabel: 'i', row: 1, column: 8 },
  { key: 'o', label: 'o', displayLabel: 'o', row: 1, column: 9 },
  { key: 'p', label: 'p', displayLabel: 'p', row: 1, column: 10 },
  { key: '[', label: '[', displayLabel: '[', row: 1, column: 11 },
  { key: ']', label: ']', displayLabel: ']', row: 1, column: 12 },
  { key: '\\', label: '\\', displayLabel: '\\', row: 1, column: 13, width: 1.5 },

  // Row 3 - Home row
  { key: 'CapsLock', label: 'Caps', displayLabel: 'Caps', row: 2, column: 0, width: 1.75, isSpecial: true },
  { key: 'a', label: 'a', displayLabel: 'a', row: 2, column: 1 },
  { key: 's', label: 's', displayLabel: 's', row: 2, column: 2 },
  { key: 'd', label: 'd', displayLabel: 'd', row: 2, column: 3 },
  { key: 'f', label: 'f', displayLabel: 'f', row: 2, column: 4 },
  { key: 'g', label: 'g', displayLabel: 'g', row: 2, column: 5 },
  { key: 'h', label: 'h', displayLabel: 'h', row: 2, column: 6 },
  { key: 'j', label: 'j', displayLabel: 'j', row: 2, column: 7 },
  { key: 'k', label: 'k', displayLabel: 'k', row: 2, column: 8 },
  { key: 'l', label: 'l', displayLabel: 'l', row: 2, column: 9 },
  { key: ';', label: ';', displayLabel: ';', row: 2, column: 10 },
  { key: '\'', label: '\'', displayLabel: '\'', row: 2, column: 11 },
  { key: 'Enter', label: 'Enter', displayLabel: '⏎', row: 2, column: 12, width: 2.25, isSpecial: true },

  // Row 4 - Bottom letter row
  { key: 'Shift', label: 'Shift', displayLabel: '⇧', row: 3, column: 0, width: 2.25, isSpecial: true },
  { key: 'z', label: 'z', displayLabel: 'z', row: 3, column: 1 },
  { key: 'x', label: 'x', displayLabel: 'x', row: 3, column: 2 },
  { key: 'c', label: 'c', displayLabel: 'c', row: 3, column: 3 },
  { key: 'v', label: 'v', displayLabel: 'v', row: 3, column: 4 },
  { key: 'b', label: 'b', displayLabel: 'b', row: 3, column: 5 },
  { key: 'n', label: 'n', displayLabel: 'n', row: 3, column: 6 },
  { key: 'm', label: 'm', displayLabel: 'm', row: 3, column: 7 },
  { key: ',', label: ',', displayLabel: ',', row: 3, column: 8 },
  { key: '.', label: '.', displayLabel: '.', row: 3, column: 9 },
  { key: '/', label: '/', displayLabel: '/', row: 3, column: 10 },
  { key: 'ShiftRight', label: 'Shift', displayLabel: '⇧', row: 3, column: 11, width: 2.75, isSpecial: true },

  // Row 5 - Spacebar row
  { key: 'Control', label: 'Ctrl', displayLabel: 'Ctrl', row: 4, column: 0, width: 1.5, isSpecial: true },
  { key: 'Alt', label: 'Alt', displayLabel: 'Alt', row: 4, column: 1, width: 1.5, isSpecial: true },
  { key: 'Meta', label: 'Cmd', displayLabel: '⌘', row: 4, column: 2, width: 1.5, isSpecial: true },
  { key: ' ', label: 'Space', displayLabel: '', row: 4, column: 3, width: 6 },
  { key: 'MetaRight', label: 'Cmd', displayLabel: '⌘', row: 4, column: 9, width: 1.5, isSpecial: true },
  { key: 'AltRight', label: 'Alt', displayLabel: 'Alt', row: 4, column: 10, width: 1.5, isSpecial: true },
  { key: 'ControlRight', label: 'Ctrl', displayLabel: 'Ctrl', row: 4, column: 11, width: 1.5, isSpecial: true },

  // Arrow keys (slightly offset)
  { key: 'ArrowLeft', label: '←', displayLabel: '←', row: 4, column: 12.5, width: 1, isSpecial: true },
  { key: 'ArrowUp', label: '↑', displayLabel: '↑', row: 3, column: 13.5, width: 1, isSpecial: true },
  { key: 'ArrowDown', label: '↓', displayLabel: '↓', row: 4, column: 13.5, width: 1, isSpecial: true },
  { key: 'ArrowRight', label: '→', displayLabel: '→', row: 4, column: 14.5, width: 1, isSpecial: true },
]

// Helper function to get key by label
export const getKeyByLabel = (label: string): KeyPosition | undefined => {
  return keyboardLayout.find((key) => key.label.toLowerCase() === label.toLowerCase())
}

// Helper function to normalize key names for matching
export const normalizeKeyName = (key: string): string => {
  // Handle special cases
  const specialKeys: Record<string, string> = {
    ' ': 'Space',
    'ShiftLeft': 'Shift',
    'ShiftRight': 'Shift',
    'ControlLeft': 'Control',
    'ControlRight': 'Control',
    'AltLeft': 'Alt',
    'AltRight': 'Alt',
    'MetaLeft': 'Meta',
    'MetaRight': 'Meta',
  }

  return specialKeys[key] || key
}
