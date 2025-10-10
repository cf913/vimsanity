import { KeyPosition } from './types'

export const keyboardLayout: KeyPosition[] = [
  // Row 1 - Number row
  { key: 'Escape', label: 'Esc', displayLabel: 'Esc', row: 0, column: 0, width: 1.5, isSpecial: true },
  { key: '1', label: '1', displayLabel: '1', row: 0, column: 1.5, shiftLabel: '!' },
  { key: '2', label: '2', displayLabel: '2', row: 0, column: 2.5, shiftLabel: '@' },
  { key: '3', label: '3', displayLabel: '3', row: 0, column: 3.5, shiftLabel: '#' },
  { key: '4', label: '4', displayLabel: '4', row: 0, column: 4.5, shiftLabel: '$' },
  { key: '5', label: '5', displayLabel: '5', row: 0, column: 5.5, shiftLabel: '%' },
  { key: '6', label: '6', displayLabel: '6', row: 0, column: 6.5, shiftLabel: '^' },
  { key: '7', label: '7', displayLabel: '7', row: 0, column: 7.5, shiftLabel: '&' },
  { key: '8', label: '8', displayLabel: '8', row: 0, column: 8.5, shiftLabel: '*' },
  { key: '9', label: '9', displayLabel: '9', row: 0, column: 9.5, shiftLabel: '(' },
  { key: '0', label: '0', displayLabel: '0', row: 0, column: 10.5, shiftLabel: ')' },
  { key: '-', label: '-', displayLabel: '-', row: 0, column: 11.5, shiftLabel: '_' },
  { key: '=', label: '=', displayLabel: '=', row: 0, column: 12.5, shiftLabel: '+' },
  { key: 'Backspace', label: 'Del', displayLabel: 'Del', row: 0, column: 13.5, width: 1.5, isSpecial: true },

  // Row 2 - QWERTY row
  { key: 'Tab', label: 'Tab', displayLabel: 'Tab', row: 1, column: 0, width: 1.5, isSpecial: true },
  { key: 'q', label: 'q', displayLabel: 'Q', row: 1, column: 1.5 },
  { key: 'w', label: 'w', displayLabel: 'W', row: 1, column: 2.5 },
  { key: 'e', label: 'e', displayLabel: 'E', row: 1, column: 3.5 },
  { key: 'r', label: 'r', displayLabel: 'R', row: 1, column: 4.5 },
  { key: 't', label: 't', displayLabel: 'T', row: 1, column: 5.5 },
  { key: 'y', label: 'y', displayLabel: 'Y', row: 1, column: 6.5 },
  { key: 'u', label: 'u', displayLabel: 'U', row: 1, column: 7.5 },
  { key: 'i', label: 'i', displayLabel: 'I', row: 1, column: 8.5 },
  { key: 'o', label: 'o', displayLabel: 'O', row: 1, column: 9.5 },
  { key: 'p', label: 'p', displayLabel: 'P', row: 1, column: 10.5 },
  { key: '[', label: '[', displayLabel: '[', row: 1, column: 11.5, shiftLabel: '{' },
  { key: ']', label: ']', displayLabel: ']', row: 1, column: 12.5, shiftLabel: '}' },
  { key: '\\', label: '\\', displayLabel: '\\', row: 1, column: 13.5, width: 1.5, shiftLabel: '|' },

  // Row 3 - Home row
  { key: 'CapsLock', label: 'Caps', displayLabel: 'Caps', row: 2, column: 0, width: 1.75, isSpecial: true },
  { key: 'a', label: 'a', displayLabel: 'A', row: 2, column: 1.75 },
  { key: 's', label: 's', displayLabel: 'S', row: 2, column: 2.75 },
  { key: 'd', label: 'd', displayLabel: 'D', row: 2, column: 3.75 },
  { key: 'f', label: 'f', displayLabel: 'F', row: 2, column: 4.75 },
  { key: 'g', label: 'g', displayLabel: 'G', row: 2, column: 5.75 },
  { key: 'h', label: 'h', displayLabel: 'H', row: 2, column: 6.75 },
  { key: 'j', label: 'j', displayLabel: 'J', row: 2, column: 7.75 },
  { key: 'k', label: 'k', displayLabel: 'K', row: 2, column: 8.75 },
  { key: 'l', label: 'l', displayLabel: 'L', row: 2, column: 9.75 },
  { key: ';', label: ';', displayLabel: ';', row: 2, column: 10.75, shiftLabel: ':' },
  { key: '\'', label: '\'', displayLabel: '\'', row: 2, column: 11.75, shiftLabel: '"' },
  { key: 'Enter', label: 'Enter', displayLabel: 'Return', row: 2, column: 12.75, width: 2.25, isSpecial: true },

  // Row 4 - Bottom letter row
  { key: 'Shift', label: 'Shift', displayLabel: 'Shift', row: 3, column: 0, width: 2.25, isSpecial: true },
  { key: 'z', label: 'z', displayLabel: 'Z', row: 3, column: 2.25 },
  { key: 'x', label: 'x', displayLabel: 'X', row: 3, column: 3.25 },
  { key: 'c', label: 'c', displayLabel: 'C', row: 3, column: 4.25 },
  { key: 'v', label: 'v', displayLabel: 'V', row: 3, column: 5.25 },
  { key: 'b', label: 'b', displayLabel: 'B', row: 3, column: 6.25 },
  { key: 'n', label: 'n', displayLabel: 'N', row: 3, column: 7.25 },
  { key: 'm', label: 'm', displayLabel: 'M', row: 3, column: 8.25 },
  { key: ',', label: ',', displayLabel: ',', row: 3, column: 9.25, shiftLabel: '<' },
  { key: '.', label: '.', displayLabel: '.', row: 3, column: 10.25, shiftLabel: '>' },
  { key: '/', label: '/', displayLabel: '/', row: 3, column: 11.25, shiftLabel: '?' },
  { key: 'ShiftRight', label: 'Shift', displayLabel: 'Shift', row: 3, column: 12.25, width: 2.75, isSpecial: true },

  // Row 5 - Spacebar row
  { key: 'Control', label: 'Ctrl', displayLabel: 'Control', row: 4, column: 0, width: 1.5, isSpecial: true },
  { key: 'Alt', label: 'Alt', displayLabel: 'Option', row: 4, column: 1.5, width: 1.5, isSpecial: true },
  { key: 'Meta', label: 'Cmd', displayLabel: 'Command', row: 4, column: 3, width: 1.5, isSpecial: true },
  { key: ' ', label: 'Space', displayLabel: '', row: 4, column: 4.5, width: 6 },
  { key: 'MetaRight', label: 'Cmd', displayLabel: 'Command', row: 4, column: 10.5, width: 1.5, isSpecial: true },
  { key: 'AltRight', label: 'Alt', displayLabel: 'Option', row: 4, column: 12, width: 1.5, isSpecial: true },
  { key: 'ControlRight', label: 'Ctrl', displayLabel: 'Control', row: 4, column: 13.5, width: 1.5, isSpecial: true },

  // Arrow keys (slightly offset)
  { key: 'ArrowLeft', label: '←', displayLabel: '←', row: 4, column: 15.25, width: 1, isSpecial: true },
  { key: 'ArrowUp', label: '↑', displayLabel: '↑', row: 3, column: 16.25, width: 1, isSpecial: true },
  { key: 'ArrowDown', label: '↓', displayLabel: '↓', row: 4, column: 16.25, width: 1, isSpecial: true },
  { key: 'ArrowRight', label: '→', displayLabel: '→', row: 4, column: 17.25, width: 1, isSpecial: true },
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
