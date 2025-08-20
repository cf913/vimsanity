import { motion } from 'framer-motion'
import { HelpCircleIcon, RefreshCw } from 'lucide-react'
import { useEffect, useState } from 'react'
import {
  KeyActionMap,
  useKeyboardHandler,
} from '../../hooks/useKeyboardHandler'
import { VIM_MODES, VimMode } from '../../utils/constants'
import { KBD } from '../common/KBD'
import LevelTimer from '../common/LevelTimer'
import ModeIndicator from '../common/ModeIndicator'
import Scoreboard from '../common/Scoreboard'
import ConfettiBurst from './ConfettiBurst'

export default function BasicDeleteLevel10() {
  // Multiple grid variations with different target positions for muscle memory
  const gridVariations = [
    {
      grid: [
        ['V', 'i', 'm', 'x', 'D', 'e', 'l', 'e', 't', 'e'],
        ['L', 'e', 'a', 'r', 'n', ' ', 'D', '→', '→', '→'], // D target - delete to end from 'D'
        ['P', 'r', 'a', 'c', 'x', 'i', 'c', 'e', ' ', 'F'],
        ['C', '→', '→', '→', '→', '→', '→', 'L', 'i', 'n'], // C target - change entire line
        ['S', 'i', 'm', 'p', 'l', 'e', ' ', 'S', 'u', 'n'], // S target - substitute character
      ],
      targets: [
        { row: 0, col: 3, type: 'x' },
        { row: 1, col: 6, type: 'D' },
        { row: 2, col: 4, type: 'x' },
        { row: 3, col: 0, type: 'C' },
        { row: 4, col: 7, type: 'S' },
      ],
    },
    {
      grid: [
        ['E', 'd', 'i', 't', ' ', 'C', 'o', 'd', 'e', 'x'],
        ['T', 'y', 'p', 'e', 'x', 'F', 'a', 's', 't', ' '],
        ['Q', 'u', 'D', '→', '→', '→', '→', '→', '→', '→'], // D target - delete to end from col 2
        ['S', 'a', 'v', 'e', ' ', 'F', 'i', 'l', 'e', 's'], // S target at start
        ['C', '→', '→', '→', '→', '→', '→', '→', '→', '→'], // C target - change entire line
      ],
      targets: [
        { row: 0, col: 9, type: 'x' },
        { row: 1, col: 4, type: 'x' },
        { row: 2, col: 2, type: 'D' },
        { row: 3, col: 0, type: 'S' },
        { row: 4, col: 0, type: 'C' },
      ],
    },
    {
      grid: [
        ['H', 'a', 'c', 'k', ' ', 'T', 'e', 'x', 't', ' '],
        ['M', 'o', 'v', 'e', ' ', 'x', 'F', 'a', 's', 't'],
        ['F', 'a', 's', 't', ' ', 'E', 'd', 'i', 't', 'x'],
        ['C', '→', '→', '→', '→', '→', '→', '→', '→', '→'], // C target - change entire line
        ['B', 'u', 'i', 'l', 'd', ' ', 'D', '→', '→', '→'], // D target - delete to end
      ],
      targets: [
        { row: 1, col: 5, type: 'x' },
        { row: 2, col: 9, type: 'x' },
        { row: 3, col: 0, type: 'C' },
        { row: 4, col: 6, type: 'D' },
        { row: 0, col: 0, type: 'S' }, // S target at start of first line
      ],
    },
    {
      grid: [
        ['K', 'e', 'y', ' ', 'M', 'a', 'p', 's', 'x', 'R'],
        ['S', '→', '→', '→', '→', '→', '→', '→', '→', '→'], // S target - substitute character at start
        ['A', 'u', 't', 'o', ' ', 'S', 'a', 'v', 'e', 'x'],
        ['G', 'i', 't', ' ', 'D', '→', '→', '→', '→', '→'], // D target - delete to end
        ['N', 'e', 'o', 'v', 'i', 'm', ' ', 'b', 'u', 'y'], // C target - change entire line
      ],
      targets: [
        { row: 0, col: 8, type: 'x' },
        { row: 1, col: 0, type: 'S' },
        { row: 2, col: 9, type: 'x' },
        { row: 3, col: 4, type: 'D' },
        { row: 4, col: 6, type: 'C' },
      ],
    },
    {
      grid: [
        ['P', 'l', 'u', 'g', 'x', 'I', 'n', 's', ' ', 'M'],
        ['D', 'o', 'c', 's', ' ', 'H', 'e', 'l', 'p', 'x'],
        ['R', 'e', 'a', 'd', ' ', 'M', 'o', 'r', 'e', ' '],
        ['A', 'u', 'X', 'C', '→', '→', '→', '→', '→', '→'], // C target - change entire line
        ['T', 'e', 's', 'D', '→', '→', '→', '→', '→', '→'], // D target - delete to end
      ],
      targets: [
        { row: 0, col: 4, type: 'x' },
        { row: 1, col: 9, type: 'x' },
        { row: 2, col: 0, type: 'S' }, // S target at start
        { row: 3, col: 3, type: 'C' },
        { row: 4, col: 3, type: 'D' },
      ],
    },
  ]

  // Select a random grid variation
  const getRandomGridVariation = () => {
    const randomIndex = Math.floor(Math.random() * gridVariations.length)
    return gridVariations[randomIndex]
  }

  const [currentVariation, setCurrentVariation] = useState(() =>
    getRandomGridVariation(),
  )
  const [initialGrid, setInitialGrid] = useState(() =>
    currentVariation.grid.map((row) => [...row]),
  )
  const [deleteTargets, setDeleteTargets] = useState(currentVariation.targets)

  const [grid, setGrid] = useState(initialGrid)
  const [position, setPosition] = useState({ row: 0, col: 0 })
  const [score, setScore] = useState(0)
  const [deletedTargets, setDeletedTargets] = useState<Set<string>>(new Set())
  const [showConfetti, setShowConfetti] = useState(false)
  const [levelCompleted, setLevelCompleted] = useState(false)
  const [lastKeyPressed, setLastKeyPressed] = useState<string>('')
  const [recentlyDeleted, setRecentlyDeleted] = useState<{
    row: number
    col: number
  } | null>(null)
  const [wrongMoveMessage, setWrongMoveMessage] = useState<string>('')
  const [gridHistory, setGridHistory] = useState<string[][][]>([
    initialGrid.map((row) => [...row]),
  ])
  const [mode, setMode] = useState<VimMode>(VIM_MODES.NORMAL)
  const [insertModeWarning, setInsertModeWarning] = useState<string>('')
  const [pendingFindCommand, setPendingFindCommand] = useState<string>('')

  const MAX_SCORE = deleteTargets.length

  // Reset recently deleted animation
  useEffect(() => {
    if (recentlyDeleted) {
      const timer = setTimeout(() => {
        setRecentlyDeleted(null)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [recentlyDeleted])

  // Reset wrong move message
  useEffect(() => {
    if (wrongMoveMessage) {
      const timer = setTimeout(() => {
        setWrongMoveMessage('')
      }, 4000)
      return () => clearTimeout(timer)
    }
  }, [wrongMoveMessage])

  // Reset insert mode warning
  useEffect(() => {
    if (insertModeWarning) {
      const timer = setTimeout(() => {
        setInsertModeWarning('')
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [insertModeWarning])

  // Check if level is completed
  useEffect(() => {
    if (score === MAX_SCORE && !levelCompleted) {
      setLevelCompleted(true)
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 3000)
    }
  }, [score, MAX_SCORE, levelCompleted])

  // Handle ESC key for level completion reset
  useEffect(() => {
    if (levelCompleted) {
      const handleEscKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          handleRestart()
        }
      }
      window.addEventListener('keydown', handleEscKey)
      return () => window.removeEventListener('keydown', handleEscKey)
    }
  }, [levelCompleted])

  // Handle find character input
  useEffect(() => {
    if (pendingFindCommand && mode === VIM_MODES.NORMAL) {
      const handleFindCharacter = (e: KeyboardEvent) => {
        // Ignore special keys
        if (e.key.length > 1) return

        const char = e.key

        switch (pendingFindCommand) {
          case 'f':
            findCharacterForward(char)
            break
          case 'F':
            findCharacterBackward(char)
            break
          case 't':
            tillCharacterForward(char)
            break
          case 'T':
            tillCharacterBackward(char)
            break
        }

        setPendingFindCommand('')
        setLastKeyPressed(`${pendingFindCommand}${char}`)
      }

      window.addEventListener('keydown', handleFindCharacter)
      return () => window.removeEventListener('keydown', handleFindCharacter)
    }
  }, [pendingFindCommand, mode, position, grid])

  const handleRestart = () => {
    // Get a new random variation with different target positions
    const newVariation = getRandomGridVariation()
    const newGrid = newVariation.grid.map((row) => [...row])

    // Update both grid and targets for the new variation
    setCurrentVariation(newVariation)
    setInitialGrid(newGrid)
    setDeleteTargets(newVariation.targets)
    setGrid(newGrid)
    setDeletedTargets(new Set())
    setPosition({ row: 0, col: 0 })
    setScore(0)
    setLevelCompleted(false)
    setShowConfetti(false)
    setLastKeyPressed('')
    setRecentlyDeleted(null)
    setWrongMoveMessage('')
    setGridHistory([newGrid])
    setMode(VIM_MODES.NORMAL)
    setInsertModeWarning('')
    setPendingFindCommand('')
  }

  const undoLastAction = () => {
    if (gridHistory.length > 1) {
      const newHistory = gridHistory.slice(0, -1)
      const previousGrid = newHistory[newHistory.length - 1]
      setGrid(previousGrid.map((row) => [...row]))
      setGridHistory(newHistory)
      setWrongMoveMessage('')
      setRecentlyDeleted(null)
    }
  }

  const executeDeleteCommand = (command: string) => {
    // Always execute the command regardless of position
    const newGrid = grid.map((row) => [...row])

    // Save current grid state to history
    setGridHistory((prev) => [...prev, newGrid])

    // Apply the command based on type
    if (command === 'x') {
      // Delete single character (stay in normal mode)
      newGrid[position.row][position.col] = '·'
      setMode(VIM_MODES.NORMAL)
    } else if (command === 'D') {
      // Delete from current position to end of line (stay in normal mode)
      for (let col = position.col; col < newGrid[position.row].length; col++) {
        newGrid[position.row][col] = '·'
      }
      setMode(VIM_MODES.NORMAL)
    } else if (command === 'C') {
      // Change from current position to end of line (enter insert mode)
      for (let col = position.col; col < newGrid[position.row].length; col++) {
        newGrid[position.row][col] = '·'
      }
      setMode(VIM_MODES.INSERT)
    } else if (command === 'S') {
      // Substitute line - delete entire line and enter insert mode at start
      for (let col = 0; col < newGrid[position.row].length; col++) {
        newGrid[position.row][col] = '·'
      }
      setMode(VIM_MODES.INSERT)
      // Move cursor to start of line for S command
      setPosition((prev) => ({ ...prev, col: 0 }))
    }

    // Update the grid
    setGrid(newGrid)
    setRecentlyDeleted({ row: position.row, col: position.col })

    // Check if this was the correct target
    let target
    let targetKey

    if (command === 'S') {
      // S command works from anywhere on the correct line
      target = deleteTargets.find(
        (t) => t.row === position.row && t.type === command,
      )
      targetKey = target ? `${target.row}-${target.col}` : null
    } else {
      // Other commands need exact position
      target = deleteTargets.find(
        (t) =>
          t.row === position.row &&
          t.col === position.col &&
          t.type === command,
      )
      targetKey = `${position.row}-${position.col}`
    }

    if (target && targetKey && !deletedTargets.has(targetKey)) {
      // Correct! Mark as completed
      setDeletedTargets((prev) => new Set([...prev, targetKey]))
      setScore((prev) => prev + 1)
      setWrongMoveMessage('')
    } else {
      // Wrong position or wrong command - show undo message
      const correctTarget = deleteTargets.find((t) => t.type === command)
      if (correctTarget) {
        if (command === 'S') {
          setWrongMoveMessage(
            `Wrong line for ${command}! Press u to undo and try from the ${getTargetDescription(command)} target line.`,
          )
        } else {
          setWrongMoveMessage(
            `Wrong position for ${command}! Press u to undo and try from the ${getTargetDescription(command)} target.`,
          )
        }
      } else {
        setWrongMoveMessage(
          `Command ${command} executed. Press u to undo if this wasn't intended.`,
        )
      }
    }
  }

  const getTargetDescription = (command: string) => {
    switch (command) {
      case 'x':
        return 'red x'
      case 'D':
        return 'orange D'
      case 'C':
        return 'blue C'
      case 'S':
        return 'purple S'
      default:
        return 'correct'
    }
  }

  const handleDisabledInInsertMode = (command: string) => {
    const commandDescriptions: { [key: string]: string } = {
      h: 'move left',
      j: 'move down',
      k: 'move up',
      l: 'move right',
      w: 'move to next word',
      b: 'move to previous word',
      e: 'move to word end',
      '0': 'move to line start',
      $: 'move to line end',
      f: 'find character',
      t: 'till character',
      F: 'find character backward',
      T: 'till character backward',
      x: 'delete character',
      D: 'delete to end',
      C: 'change to end',
      S: 'substitute line',
      u: 'undo',
    }

    const desc = commandDescriptions[command] || 'use that command'
    setInsertModeWarning(
      `Can't ${desc} in insert mode! Press Esc to return to normal mode.`,
    )
  }

  // Find character helpers
  const findCharacterForward = (char: string) => {
    const currentRow = grid[position.row]
    for (let col = position.col + 1; col < currentRow.length; col++) {
      if (currentRow[col] === char) {
        setPosition((prev) => ({ ...prev, col }))
        return
      }
    }
  }

  const findCharacterBackward = (char: string) => {
    const currentRow = grid[position.row]
    for (let col = position.col - 1; col >= 0; col--) {
      if (currentRow[col] === char) {
        setPosition((prev) => ({ ...prev, col }))
        return
      }
    }
  }

  const tillCharacterForward = (char: string) => {
    const currentRow = grid[position.row]
    for (let col = position.col + 1; col < currentRow.length; col++) {
      if (currentRow[col] === char) {
        setPosition((prev) => ({ ...prev, col: col - 1 }))
        return
      }
    }
  }

  const tillCharacterBackward = (char: string) => {
    const currentRow = grid[position.row]
    for (let col = position.col - 1; col >= 0; col--) {
      if (currentRow[col] === char) {
        setPosition((prev) => ({ ...prev, col: col + 1 }))
        return
      }
    }
  }

  // Word movement helpers
  const moveToNextWord = () => {
    const currentRow = grid[position.row]
    let newCol = position.col

    // Skip current word
    while (newCol < currentRow.length && currentRow[newCol] !== ' ') {
      newCol++
    }
    // Skip spaces
    while (newCol < currentRow.length && currentRow[newCol] === ' ') {
      newCol++
    }

    setPosition((prev) => ({
      ...prev,
      col: Math.min(currentRow.length - 1, newCol),
    }))
  }

  const moveToPrevWord = () => {
    const currentRow = grid[position.row]
    let newCol = position.col

    // Move back one if at start of word
    if (newCol > 0) newCol--

    // Skip spaces
    while (newCol > 0 && currentRow[newCol] === ' ') {
      newCol--
    }
    // Skip to start of word
    while (newCol > 0 && currentRow[newCol - 1] !== ' ') {
      newCol--
    }

    setPosition((prev) => ({
      ...prev,
      col: Math.max(0, newCol),
    }))
  }

  const moveToWordEnd = () => {
    const currentRow = grid[position.row]
    let newCol = position.col

    // Skip spaces first
    while (newCol < currentRow.length && currentRow[newCol] === ' ') {
      newCol++
    }
    // Move to end of word
    while (newCol < currentRow.length - 1 && currentRow[newCol + 1] !== ' ') {
      newCol++
    }

    setPosition((prev) => ({
      ...prev,
      col: Math.min(currentRow.length - 1, newCol),
    }))
  }

  const keyActionMap: KeyActionMap = {
    h: () => {
      if (mode === VIM_MODES.INSERT) {
        handleDisabledInInsertMode('h')
        return
      }
      setPosition((prev) => ({
        ...prev,
        col: Math.max(0, prev.col - 1),
      }))
      setLastKeyPressed('h')
    },
    j: () => {
      if (mode === VIM_MODES.INSERT) {
        handleDisabledInInsertMode('j')
        return
      }
      setPosition((prev) => ({
        ...prev,
        row: Math.min(grid.length - 1, prev.row + 1),
      }))
      setLastKeyPressed('j')
    },
    k: () => {
      if (mode === VIM_MODES.INSERT) {
        handleDisabledInInsertMode('k')
        return
      }
      setPosition((prev) => ({
        ...prev,
        row: Math.max(0, prev.row - 1),
      }))
      setLastKeyPressed('k')
    },
    l: () => {
      if (mode === VIM_MODES.INSERT) {
        handleDisabledInInsertMode('l')
        return
      }
      setPosition((prev) => ({
        ...prev,
        col: Math.min(grid[0].length - 1, prev.col + 1),
      }))
      setLastKeyPressed('l')
    },
    w: () => {
      if (mode === VIM_MODES.INSERT) {
        handleDisabledInInsertMode('w')
        return
      }
      moveToNextWord()
      setLastKeyPressed('w')
    },
    b: () => {
      if (mode === VIM_MODES.INSERT) {
        handleDisabledInInsertMode('b')
        return
      }
      moveToPrevWord()
      setLastKeyPressed('b')
    },
    e: () => {
      if (mode === VIM_MODES.INSERT) {
        handleDisabledInInsertMode('e')
        return
      }
      moveToWordEnd()
      setLastKeyPressed('e')
    },
    '0': () => {
      if (mode === VIM_MODES.INSERT) {
        handleDisabledInInsertMode('0')
        return
      }
      setPosition((prev) => ({
        ...prev,
        col: 0,
      }))
      setLastKeyPressed('0')
    },
    $: () => {
      if (mode === VIM_MODES.INSERT) {
        handleDisabledInInsertMode('$')
        return
      }
      setPosition((prev) => ({
        ...prev,
        col: grid[prev.row].length - 1,
      }))
      setLastKeyPressed('$')
    },
    f: () => {
      if (mode === VIM_MODES.INSERT) {
        handleDisabledInInsertMode('f')
        return
      }
      setPendingFindCommand('f')
      setLastKeyPressed('f')
    },
    t: () => {
      if (mode === VIM_MODES.INSERT) {
        handleDisabledInInsertMode('t')
        return
      }
      setPendingFindCommand('t')
      setLastKeyPressed('t')
    },
    F: () => {
      if (mode === VIM_MODES.INSERT) {
        handleDisabledInInsertMode('F')
        return
      }
      setPendingFindCommand('F')
      setLastKeyPressed('F')
    },
    T: () => {
      if (mode === VIM_MODES.INSERT) {
        handleDisabledInInsertMode('T')
        return
      }
      setPendingFindCommand('T')
      setLastKeyPressed('T')
    },
    x: () => {
      if (mode === VIM_MODES.INSERT) {
        handleDisabledInInsertMode('x')
        return
      }
      executeDeleteCommand('x')
      setLastKeyPressed('x')
    },
    D: () => {
      if (mode === VIM_MODES.INSERT) {
        handleDisabledInInsertMode('D')
        return
      }
      executeDeleteCommand('D')
      setLastKeyPressed('D')
    },
    C: () => {
      if (mode === VIM_MODES.INSERT) {
        handleDisabledInInsertMode('C')
        return
      }
      executeDeleteCommand('C')
      setLastKeyPressed('C')
    },
    S: () => {
      if (mode === VIM_MODES.INSERT) {
        handleDisabledInInsertMode('S')
        return
      }
      executeDeleteCommand('S')
      setLastKeyPressed('S')
    },
    u: () => {
      if (mode === VIM_MODES.INSERT) {
        handleDisabledInInsertMode('u')
        return
      }
      undoLastAction()
      setLastKeyPressed('u')
    },
    Escape: () => {
      setMode(VIM_MODES.NORMAL)
      setLastKeyPressed('Escape')
    },
  }

  useKeyboardHandler({
    keyActionMap,
    dependencies: [position, grid, deletedTargets],
  })

  const getTargetInfo = (row: number, col: number) => {
    const target = deleteTargets.find((t) => t.row === row && t.col === col)
    if (!target) return null

    switch (target.type) {
      case 'x':
        return { type: 'x', color: 'text-red-400', ring: 'ring-red-400/50' }
      case 'D':
        return {
          type: 'D',
          color: 'text-orange-400',
          ring: 'ring-orange-400/50',
        }
      case 'C':
        return { type: 'C', color: 'text-blue-400', ring: 'ring-blue-400/50' }
      case 'S':
        return {
          type: 'S',
          color: 'text-purple-400',
          ring: 'ring-purple-400/50',
        }
      default:
        return null
    }
  }

  const isDeleted = (row: number, col: number) => {
    return deletedTargets.has(`${row}-${col}`)
  }

  const isRecentlyDeleted = (row: number, col: number) => {
    return recentlyDeleted?.row === row && recentlyDeleted?.col === col
  }

  return (
    <div className="flex flex-col items-center gap-6">
      {showConfetti && <ConfettiBurst />}

      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2 text-red-400">
          Basic Delete Operations
        </h2>
        <p className="text-zinc-400 px-2">
          Use <KBD>x</KBD>, <KBD>D</KBD>, <KBD>C</KBD>, and <KBD>S</KBD> to
          delete different targets. Practice all movement motions!
        </p>
        {pendingFindCommand && (
          <div className="mt-2 text-yellow-400 text-sm">
            Command pending: <KBD>{pendingFindCommand}</KBD> (type a character
            to find)
          </div>
        )}
      </div>

      <div className="flex justify-center items-center gap-4 mb-4">
        <Scoreboard score={score} maxScore={MAX_SCORE} />
        <button
          onClick={handleRestart}
          className="bg-zinc-800 p-3 rounded-lg hover:bg-zinc-700 transition-colors"
          aria-label="Reset Level"
        >
          <RefreshCw size={18} className="text-zinc-400" />
        </button>
        <ModeIndicator isInsertMode={mode === VIM_MODES.INSERT} />
      </div>

      {/* Grid */}
      <div className="grid gap-1 p-6 bg-zinc-800 rounded-lg border-2 border-zinc-600">
        {grid.map((row, rowIdx) => (
          <div key={rowIdx} className="flex gap-1">
            {row.map((char, colIdx) => {
              const isCursor =
                position.row === rowIdx && position.col === colIdx
              const targetInfo = getTargetInfo(rowIdx, colIdx)
              const isDeletedCell = isDeleted(rowIdx, colIdx)
              const isRecentlyDeletedCell = isRecentlyDeleted(rowIdx, colIdx)

              // Cursor colors based on mode (matching ModeIndicator)
              const cursorBg =
                mode === VIM_MODES.INSERT ? 'bg-orange-400' : 'bg-emerald-400'
              const cursorRing =
                mode === VIM_MODES.INSERT
                  ? 'ring-orange-300'
                  : 'ring-emerald-300'
              const cursorDot =
                mode === VIM_MODES.INSERT ? 'bg-orange-400' : 'bg-emerald-400'

              return (
                <div
                  key={`${rowIdx}-${colIdx}`}
                  className={`
                    relative w-10 h-10 flex items-center justify-center text-lg font-mono rounded transition-all duration-200
                    ${
                      isCursor
                        ? `${cursorBg} text-black scale-110 shadow-lg ring-2 ${cursorRing}`
                        : 'bg-zinc-700'
                    }
                    ${
                      targetInfo && !isDeletedCell && !isCursor
                        ? `${targetInfo.color} font-bold ring-1 ${targetInfo.ring}`
                        : !isCursor
                          ? 'text-zinc-300'
                          : 'text-black'
                    }
                    ${isDeletedCell ? 'bg-green-600 text-green-200' : ''}
                    ${
                      isRecentlyDeletedCell
                        ? 'animate-pulse bg-green-500 scale-110'
                        : ''
                    }
                  `}
                >
                  {char}
                  {isCursor && (
                    <div
                      className={`absolute -top-1 -right-1 w-3 h-3 ${cursorDot} rounded-full animate-pulse`}
                    />
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </div>

      {/* Instructions */}
      <div className="bg-zinc-800 rounded-lg p-4 max-w-2xl">
        <div className="grid grid-cols-4 gap-4 text-sm mb-3">
          <div className="text-center">
            <div className="text-red-400 font-bold">x</div>
            <div className="text-xs text-zinc-400">Delete character</div>
          </div>
          <div className="text-center">
            <div className="text-orange-400 font-bold">D</div>
            <div className="text-xs text-zinc-400">Delete to end</div>
          </div>
          <div className="text-center">
            <div className="text-blue-400 font-bold">C</div>
            <div className="text-xs text-zinc-400">
              Delete to end and insert
            </div>
          </div>
          <div className="text-center">
            <div className="text-purple-400 font-bold">S</div>
            <div className="text-xs text-zinc-400">Delete line and insert</div>
          </div>
        </div>
        {/* <div className="text-xs text-zinc-500 text-center border-t border-zinc-700 pt-2"> */}
        {/*   💡 Commands work from any position. <KBD>C</KBD> and <KBD>S</KBD>{' '} */}
        {/*   enter insert mode. Use <KBD>u</KBD> to undo, <KBD>Esc</KBD> to exit */}
        {/*   insert mode. */}
        {/* </div> */}
      </div>

      {/* Controls */}
      {/* <div className="flex justify-between items-center w-full max-w-md"> */}
      {/*   <KeysAllowed keys={['h', 'j', 'k', 'l', 'w', 'b', 'e', '0', '$', 'f', 't', 'F', 'T', 'x', 'D', 'C', 'S', 'u', 'Esc']} /> */}
      {/* </div> */}

      {/* Level completion */}
      {levelCompleted && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-zinc-800 rounded-lg p-8 text-center max-w-md">
            <h2 className="text-3xl font-bold mb-4 text-red-400">
              🎉 Level Complete!
            </h2>
            <p className="text-zinc-300 mb-6">
              Excellent! You've mastered basic delete operations: <KBD>x</KBD>,{' '}
              <KBD>D</KBD>, <KBD>C</KBD>, and <KBD>S</KBD>. These are essential
              Vim commands for efficient editing!
            </p>
            <div className="text-2xl font-bold text-green-400 mb-4">
              Score: {score}/{MAX_SCORE}
            </div>
            <p className="text-zinc-400 text-sm">
              Press <KBD>Esc</KBD> to play again
            </p>
          </div>
        </div>
      )}

      <div className="mt-6">
        <LevelTimer
          levelId="level-10-basic-delete"
          isActive={!levelCompleted}
          isCompleted={levelCompleted}
        />
      </div>

      {/* Floating Warning Message */}
      {wrongMoveMessage && (
        <motion.div
          className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 p-3 bg-yellow-900/90 border border-yellow-600 rounded-lg max-w-md backdrop-blur-sm"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <p className="text-yellow-200 text-sm font-medium">
            ⚠️ {wrongMoveMessage}
          </p>
        </motion.div>
      )}

      {/* Insert Mode Warning */}
      {insertModeWarning && (
        <motion.div
          className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50 p-3 bg-orange-900/90 border border-orange-600 rounded-lg max-w-md backdrop-blur-sm"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <p className="text-orange-200 text-sm font-medium">
            🚫 {insertModeWarning}
          </p>
        </motion.div>
      )}
    </div>
  )
}
