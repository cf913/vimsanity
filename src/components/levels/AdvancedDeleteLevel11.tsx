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

export default function AdvancedDeleteLevel11() {
  // Grid with lines to delete and words to delete
  const initialGrid = [
    ['D', 'e', 'l', 'e', 't', 'e', ' ', 'W', 'o', 'r', 'd'],
    ['T', 'h', 'i', 's', ' ', 'l', 'i', 'n', 'e', ' ', '🗑'], // dd target (trash icon marks whole line)
    ['K', 'e', 'e', 'p', ' ', 't', 'h', 'i', 's', ' ', 'T'],
    ['R', 'e', 'm', 'o', 'v', 'e', '📝', '📝', '📝', '📝', 'D'], // D target (notebook icons mark from here to end)
    ['S', '◀', 'v', 'e', ' ', 'T', 'h', 'i', 's', ' ', 'T'], // dh target (left arrow)
    ['D', 'e', 'l', 'e', 't', 'e', ' ', '▶', 'i', 'g', 'h', 't'], // dl target (right arrow)
  ]

  // Different types of delete targets
  const deleteTargets = [
    { row: 0, col: 7, type: 'dw', word: 'Word' }, // Delete word "Word"
    { row: 1, col: 10, type: 'dd' }, // Delete entire line (trash can icon)
    { row: 2, col: 5, type: 'dw', word: 'this' }, // Delete word "this"
    { row: 3, col: 6, type: 'D' }, // Delete from cursor to end (notebook icons)
    { row: 4, col: 1, type: 'dh' }, // Delete character to the left (left arrow)
    { row: 5, col: 7, type: 'dl' }, // Delete character to the right (right arrow)
  ]

  const [grid, setGrid] = useState(initialGrid.map((row) => [...row]))
  const [position, setPosition] = useState({ row: 0, col: 0 })
  const [score, setScore] = useState(0)
  const [completedTargets, setCompletedTargets] = useState<Set<string>>(
    new Set(),
  )
  const [showConfetti, setShowConfetti] = useState(false)
  const [levelCompleted, setLevelCompleted] = useState(false)
  const [lastKeyPressed, setLastKeyPressed] = useState<string>('')
  const [recentlyDeleted, setRecentlyDeleted] = useState<{
    row: number
    col: number
  } | null>(null)
  const [wrongMoveMessage, setWrongMoveMessage] = useState<string>('')
  const [mode, setMode] = useState<VimMode>(VIM_MODES.NORMAL)
  const [insertModeWarning, setInsertModeWarning] = useState<string>('')
  const [pendingCommand, setPendingCommand] = useState<string>('')
  const [pendingFindCommand, setPendingFindCommand] = useState<string>('')
  const [gridHistory, setGridHistory] = useState<
    {
      grid: string[][]
      completedTargets: Set<string>
      score: number
    }[]
  >([
    {
      grid: initialGrid.map((row) => [...row]),
      completedTargets: new Set(),
      score: 0,
    },
  ])

  const MAX_SCORE = deleteTargets.length

  // Color mapping for different target types
  const getTargetColors = (type: string) => {
    switch (type) {
      case 'dw':
        return { color: 'text-blue-400', ring: 'ring-blue-400/50' }
      case 'dd':
        return { color: 'text-orange-400', ring: 'ring-orange-400/50' }
      case 'D':
        return { color: 'text-purple-400', ring: 'ring-purple-400/50' }
      case 'dh':
        return { color: 'text-red-400', ring: 'ring-red-400/50' }
      case 'dl':
        return { color: 'text-green-400', ring: 'ring-green-400/50' }
      default:
        return { color: 'text-gray-400', ring: 'ring-gray-400/50' }
    }
  }

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

  const handleRestart = () => {
    setGrid(initialGrid.map((row) => [...row]))
    setPosition({ row: 0, col: 0 })
    setScore(0)
    setCompletedTargets(new Set())
    setLevelCompleted(false)
    setShowConfetti(false)
    setLastKeyPressed('')
    setRecentlyDeleted(null)
    setWrongMoveMessage('')
    setMode(VIM_MODES.NORMAL)
    setInsertModeWarning('')
    setPendingCommand('')
    setPendingFindCommand('')
    setGridHistory([
      {
        grid: initialGrid.map((row) => [...row]),
        completedTargets: new Set(),
        score: 0,
      },
    ])
  }

  const deleteWord = () => {
    // Save current state to history
    setGridHistory((prev) => [
      ...prev,
      {
        grid: grid.map((row) => [...row]),
        completedTargets: new Set(completedTargets),
        score: score,
      },
    ])

    setGrid((prev) => {
      const newGrid = prev.map((row) => [...row])
      const currentRow = newGrid[position.row]
      let startCol = position.col
      let endCol = position.col

      // If we're on a space, move to the next word first
      if (currentRow[startCol] === ' ') {
        while (endCol < currentRow.length && currentRow[endCol] === ' ') {
          endCol++
        }
        startCol = endCol
      }

      // Find the end of the current word
      while (endCol < currentRow.length && currentRow[endCol] !== ' ') {
        endCol++
      }

      // Include one trailing space if it exists (vim behavior)
      if (endCol < currentRow.length && currentRow[endCol] === ' ') {
        endCol++
      }

      // Realistic deletion: shift text left and fill with spaces
      const deletedLength = endCol - startCol
      for (let col = startCol; col < currentRow.length; col++) {
        if (col + deletedLength < currentRow.length) {
          newGrid[position.row][col] = currentRow[col + deletedLength]
        } else {
          newGrid[position.row][col] = ' '
        }
      }

      return newGrid
    })

    // Check if this was the correct target for scoring
    const target = deleteTargets.find(
      (t) =>
        t.type === 'dw' &&
        t.row === position.row &&
        Math.abs(t.col - position.col) <= 3,
    )

    if (target) {
      const targetKey = `${target.row}-${target.col}-${target.type}`
      if (!completedTargets.has(targetKey)) {
        // Correct target - award points
        setCompletedTargets((prev) => new Set([...prev, targetKey]))
        setScore((prev) => prev + 1)
        setRecentlyDeleted({ row: position.row, col: position.col })
        setWrongMoveMessage('')
      } else {
        // Target already completed
        setRecentlyDeleted({ row: position.row, col: position.col })
        setWrongMoveMessage('dw executed, but this target already completed!')
      }
    } else {
      // Check if there are any incomplete dw targets for better messaging
      const incompleteDwTargets = deleteTargets.filter(
        (t) =>
          t.type === 'dw' &&
          !completedTargets.has(`${t.row}-${t.col}-${t.type}`),
      )

      if (incompleteDwTargets.length > 0) {
        setWrongMoveMessage(
          'dw executed, but wrong target! Press u to undo and navigate to a target word for points.',
        )
      } else {
        setWrongMoveMessage(
          'dw executed, but all dw targets already completed!',
        )
      }
      setRecentlyDeleted({ row: position.row, col: position.col })
    }
  }

  const deleteLine = () => {
    // Save current state to history
    setGridHistory((prev) => [
      ...prev,
      {
        grid: grid.map((row) => [...row]),
        completedTargets: new Set(completedTargets),
        score: score,
      },
    ])

    setGrid((prev) => {
      const newGrid = prev.map((row) => [...row])
      // Clear entire current line (don't shift to preserve target positions)
      for (let col = 0; col < newGrid[position.row].length; col++) {
        newGrid[position.row][col] = ' '
      }
      return newGrid
    })

    // Check if this was the correct target for scoring
    const target = deleteTargets.find(
      (t) => t.type === 'dd' && t.row === position.row,
    )

    if (target && !completedTargets.has('dd')) {
      // Correct target - award points
      setCompletedTargets((prev) => new Set([...prev, 'dd']))
      setScore((prev) => prev + 1)
      setRecentlyDeleted({ row: position.row, col: 0 })
      setWrongMoveMessage('')
    } else {
      // Wrong line but command still executed
      if (!completedTargets.has('dd')) {
        setWrongMoveMessage(
          'dd executed, but wrong target! Press u to undo and navigate to line with 🗑 icon for points.',
        )
      }
      setRecentlyDeleted({ row: position.row, col: 0 })
    }
  }

  const deleteToEnd = () => {
    // Save current state to history
    setGridHistory((prev) => [
      ...prev,
      {
        grid: grid.map((row) => [...row]),
        completedTargets: new Set(completedTargets),
        score: score,
      },
    ])

    setGrid((prev) => {
      const newGrid = prev.map((row) => [...row])
      // Realistic deletion: simply replace from cursor to end with spaces
      for (let col = position.col; col < newGrid[position.row].length; col++) {
        newGrid[position.row][col] = ' '
      }
      return newGrid
    })

    // Check if this was the correct target for scoring
    const target = deleteTargets.find(
      (t) => t.type === 'D' && t.row === position.row && position.col >= t.col,
    )

    if (target) {
      const targetKey = `${target.row}-${target.col}-${target.type}`
      if (!completedTargets.has(targetKey)) {
        // Correct target - award points
        setCompletedTargets((prev) => new Set([...prev, targetKey]))
        setScore((prev) => prev + 1)
        setRecentlyDeleted({ row: position.row, col: position.col })
        setWrongMoveMessage('')
      } else {
        setRecentlyDeleted({ row: position.row, col: position.col })
      }
    } else {
      // Wrong position but command still executed
      setWrongMoveMessage(
        'D executed, but wrong target! Press u to undo and navigate to target position for points.',
      )
      setRecentlyDeleted({ row: position.row, col: position.col })
    }
  }

  const deleteLeft = () => {
    // Save current state to history
    setGridHistory((prev) => [
      ...prev,
      {
        grid: grid.map((row) => [...row]),
        completedTargets: new Set(completedTargets),
        score: score,
      },
    ])

    setGrid((prev) => {
      const newGrid = prev.map((row) => [...row])
      // Realistic deletion: shift text left from current position
      if (position.col > 0) {
        const currentRow = newGrid[position.row]
        for (let col = position.col - 1; col < currentRow.length - 1; col++) {
          newGrid[position.row][col] = currentRow[col + 1]
        }
        // Fill last position with space
        newGrid[position.row][currentRow.length - 1] = ' '
      }
      return newGrid
    })

    // Check if this was the correct target for scoring
    const target = deleteTargets.find(
      (t) =>
        t.type === 'dh' && t.row === position.row && t.col === position.col,
    )

    if (target) {
      const targetKey = `${target.row}-${target.col}-${target.type}`
      if (!completedTargets.has(targetKey)) {
        // Correct target - award points
        setCompletedTargets((prev) => new Set([...prev, targetKey]))
        setScore((prev) => prev + 1)
        setRecentlyDeleted({ row: position.row, col: position.col - 1 })
        setWrongMoveMessage('')
      } else {
        setRecentlyDeleted({ row: position.row, col: position.col - 1 })
      }
    } else {
      // Wrong position but command still executed
      setWrongMoveMessage(
        'dh executed, but wrong target! Press u to undo and navigate to target position for points.',
      )
      if (position.col > 0) {
        setRecentlyDeleted({ row: position.row, col: position.col - 1 })
      }
    }

    // Move cursor left after deletion if possible
    if (position.col > 0) {
      setPosition((prev) => ({ ...prev, col: prev.col - 1 }))
    }
  }

  const deleteRight = () => {
    // Save current state to history
    setGridHistory((prev) => [
      ...prev,
      {
        grid: grid.map((row) => [...row]),
        completedTargets: new Set(completedTargets),
        score: score,
      },
    ])

    setGrid((prev) => {
      const newGrid = prev.map((row) => [...row])
      // Realistic deletion: delete character under cursor and shift text left
      if (position.col < newGrid[position.row].length) {
        const currentRow = newGrid[position.row]
        for (let col = position.col; col < currentRow.length - 1; col++) {
          newGrid[position.row][col] = currentRow[col + 1]
        }
        // Fill last position with space
        newGrid[position.row][currentRow.length - 1] = ' '
      }
      return newGrid
    })

    // Check if this was the correct target for scoring
    const target = deleteTargets.find(
      (t) =>
        t.type === 'dl' && t.row === position.row && t.col === position.col,
    )

    if (target) {
      const targetKey = `${target.row}-${target.col}-${target.type}`
      if (!completedTargets.has(targetKey)) {
        // Correct target - award points
        setCompletedTargets((prev) => new Set([...prev, targetKey]))
        setScore((prev) => prev + 1)
        setRecentlyDeleted({ row: position.row, col: position.col })
        setWrongMoveMessage('')
      } else {
        setRecentlyDeleted({ row: position.row, col: position.col })
      }
    } else {
      // Wrong position but command still executed
      setWrongMoveMessage(
        'dl executed, but wrong target! Press u to undo and navigate to target position for points.',
      )
      if (position.col < grid[position.row].length) {
        setRecentlyDeleted({ row: position.row, col: position.col })
      }
    }
  }

  // Handle command sequences
  const handleCommand = (key: string) => {
    if (pendingCommand === 'd') {
      // Handle second character of dd, dw, dh, or dl
      if (key === 'd') {
        deleteLine()
        setLastKeyPressed('dd')
        setPendingCommand('')
        return
      } else if (key === 'w') {
        deleteWord()
        setLastKeyPressed('dw')
        setPendingCommand('')
        return
      } else if (key === 'h') {
        deleteLeft()
        setLastKeyPressed('dh')
        setPendingCommand('')
        return
      } else if (key === 'l') {
        deleteRight()
        setLastKeyPressed('dl')
        setPendingCommand('')
        return
      } else {
        // Invalid second character, reset
        setPendingCommand('')
      }
    }

    // Handle single character commands
    if (key === 'd') {
      setPendingCommand('d')
      setLastKeyPressed('d')
      return
    }

    if (key === 'D') {
      deleteToEnd()
      setLastKeyPressed('D')
      return
    }

    // Movement commands
    if (key === 'h') {
      if (mode === VIM_MODES.INSERT) {
        handleDisabledInInsertMode('h')
        return
      }
      setPosition((prev) => ({
        ...prev,
        col: Math.max(0, prev.col - 1),
      }))
      setLastKeyPressed('h')
      setPendingCommand('')
    } else if (key === 'j') {
      if (mode === VIM_MODES.INSERT) {
        handleDisabledInInsertMode('j')
        return
      }
      setPosition((prev) => ({
        ...prev,
        row: Math.min(grid.length - 1, prev.row + 1),
      }))
      setLastKeyPressed('j')
      setPendingCommand('')
    } else if (key === 'k') {
      if (mode === VIM_MODES.INSERT) {
        handleDisabledInInsertMode('k')
        return
      }
      setPosition((prev) => ({
        ...prev,
        row: Math.max(0, prev.row - 1),
      }))
      setLastKeyPressed('k')
      setPendingCommand('')
    } else if (key === 'l') {
      if (mode === VIM_MODES.INSERT) {
        handleDisabledInInsertMode('l')
        return
      }
      setPosition((prev) => ({
        ...prev,
        col: Math.min(grid[0].length - 1, prev.col + 1),
      }))
      setLastKeyPressed('l')
      setPendingCommand('')
    } else if (key === 'w') {
      if (mode === VIM_MODES.INSERT) {
        handleDisabledInInsertMode('w')
        return
      }
      moveToNextWord()
      setLastKeyPressed('w')
      setPendingCommand('')
    } else if (key === 'b') {
      if (mode === VIM_MODES.INSERT) {
        handleDisabledInInsertMode('b')
        return
      }
      moveToPrevWord()
      setLastKeyPressed('b')
      setPendingCommand('')
    } else if (key === 'e') {
      if (mode === VIM_MODES.INSERT) {
        handleDisabledInInsertMode('e')
        return
      }
      moveToWordEnd()
      setLastKeyPressed('e')
      setPendingCommand('')
    } else if (key === '0') {
      if (mode === VIM_MODES.INSERT) {
        handleDisabledInInsertMode('0')
        return
      }
      setPosition((prev) => ({
        ...prev,
        col: 0,
      }))
      setLastKeyPressed('0')
      setPendingCommand('')
    } else if (key === '$') {
      if (mode === VIM_MODES.INSERT) {
        handleDisabledInInsertMode('$')
        return
      }
      setPosition((prev) => ({
        ...prev,
        col: grid[prev.row].length - 1,
      }))
      setLastKeyPressed('$')
      setPendingCommand('')
    } else if (key === 'f') {
      if (mode === VIM_MODES.INSERT) {
        handleDisabledInInsertMode('f')
        return
      }
      setPendingFindCommand('f')
      setLastKeyPressed('f')
      setPendingCommand('')
    } else if (key === 'F') {
      if (mode === VIM_MODES.INSERT) {
        handleDisabledInInsertMode('F')
        return
      }
      setPendingFindCommand('F')
      setLastKeyPressed('F')
      setPendingCommand('')
    } else if (key === 't') {
      if (mode === VIM_MODES.INSERT) {
        handleDisabledInInsertMode('t')
        return
      }
      setPendingFindCommand('t')
      setLastKeyPressed('t')
      setPendingCommand('')
    } else if (key === 'T') {
      if (mode === VIM_MODES.INSERT) {
        handleDisabledInInsertMode('T')
        return
      }
      setPendingFindCommand('T')
      setLastKeyPressed('T')
      setPendingCommand('')
    } else if (key === 'u') {
      if (mode === VIM_MODES.INSERT) {
        handleDisabledInInsertMode('u')
        return
      }
      undoLastAction()
      setLastKeyPressed('u')
      setPendingCommand('')
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
      d: 'delete',
      D: 'delete to end',
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

  const undoLastAction = () => {
    if (gridHistory.length > 1) {
      const newHistory = gridHistory.slice(0, -1)
      const previousState = newHistory[newHistory.length - 1]

      // Restore all state from history
      setGrid(previousState.grid.map((row) => [...row]))
      setCompletedTargets(new Set(previousState.completedTargets))
      setScore(previousState.score)
      setGridHistory(newHistory)
      setWrongMoveMessage('')
      setRecentlyDeleted(null)
    }
  }

  const keyActionMap: KeyActionMap = {
    h: () => handleCommand('h'),
    j: () => handleCommand('j'),
    k: () => handleCommand('k'),
    l: () => handleCommand('l'),
    w: () => handleCommand('w'),
    b: () => handleCommand('b'),
    e: () => handleCommand('e'),
    '0': () => handleCommand('0'),
    $: () => handleCommand('$'),
    f: () => handleCommand('f'),
    t: () => handleCommand('t'),
    F: () => handleCommand('F'),
    T: () => handleCommand('T'),
    d: () => handleCommand('d'),
    D: () => handleCommand('D'),
    u: () => handleCommand('u'),
    Escape: () => {
      setMode(VIM_MODES.NORMAL)
      setLastKeyPressed('Escape')
    },
  }

  useKeyboardHandler({
    keyActionMap,
    dependencies: [
      position,
      grid,
      completedTargets,
      pendingCommand,
      gridHistory,
    ],
  })

  const getTargetInfo = (row: number, col: number) => {
    // Find target at this position
    const target = deleteTargets.find((t) => {
      if (t.type === 'dw') {
        // For dw targets, highlight the word area
        return t.row === row && col >= t.col && col <= t.col + 3
      } else if (t.type === 'dd') {
        // For dd targets, highlight specific position (like trash icon)
        return t.row === row && t.col === col
      } else if (t.type === 'D') {
        // For D targets, highlight from position to end of line
        return t.row === row && col >= t.col
      } else if (t.type === 'dh') {
        // For dh targets, highlight the specific position (arrow)
        return t.row === row && t.col === col
      } else if (t.type === 'dl') {
        // For dl targets, highlight the specific position (arrow)
        return t.row === row && t.col === col
      }
      return false
    })

    if (
      target &&
      !completedTargets.has(`${target.row}-${target.col}-${target.type}`)
    ) {
      const colors = getTargetColors(target.type)
      return { type: target.type, ...colors }
    }
    return null
  }

  const isRecentlyDeleted = (row: number, col: number) => {
    return recentlyDeleted?.row === row && recentlyDeleted?.col === col
  }

  return (
    <div className="flex flex-col items-center gap-6">
      {showConfetti && <ConfettiBurst />}

      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2 text-purple-400">
          Advanced Delete Operations
        </h2>
        <p className="text-text-muted px-2">
          Use <KBD>dw</KBD> to delete words, <KBD>dd</KBD> to delete lines,{' '}
          <KBD>D</KBD> to delete to end, <KBD>dh</KBD> to delete left, and{' '}
          <KBD>dl</KBD> to delete under cursor
        </p>
      </div>

      <div className="flex justify-center items-center gap-4 mb-4">
        <Scoreboard score={score} maxScore={MAX_SCORE} />
        <button
          onClick={handleRestart}
          className="bg-bg-secondary p-3 rounded-lg hover:bg-bg-tertiary transition-colors"
          aria-label="Reset Level"
        >
          <RefreshCw size={18} className="text-text-muted" />
        </button>
        <ModeIndicator isInsertMode={mode === VIM_MODES.INSERT} />
      </div>

      {/* Grid */}
      <div className="bg-bg-secondary rounded-lg border-2 border-border-secondary">
        <div className="grid gap-1 p-6">
          {grid.map((row, rowIdx) => (
            <div key={rowIdx} className="flex gap-1">
              {row.map((char, colIdx) => {
                const isCursor =
                  position.row === rowIdx && position.col === colIdx
                const targetInfo = getTargetInfo(rowIdx, colIdx)
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
                        : 'bg-bg-tertiary'
                    }
                    ${
                      targetInfo && !isCursor
                        ? `${targetInfo.color} font-bold ring-1 ${targetInfo.ring}`
                        : !isCursor
                          ? 'text-text-secondary'
                          : 'text-black'
                    }
                    ${
                      isRecentlyDeletedCell
                        ? 'animate-pulse bg-blue-500 scale-110'
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

        {/* Command Line (vim-style) */}
        <div className="bg-bg-primary rounded-b-lg px-4 py-2 border-t border-border-secondary font-mono text-sm min-h-[2.5rem] flex items-center">
          {pendingCommand && (
            <span className="text-yellow-300">
              :{pendingCommand}
              <span className="animate-pulse">_</span>
            </span>
          )}
          {pendingFindCommand && (
            <span className="text-yellow-300">
              {pendingFindCommand}
              <span className="animate-pulse">_</span>
            </span>
          )}
          {!pendingCommand && !pendingFindCommand && (
            <span className="text-text-subtle">-- NORMAL --</span>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-bg-secondary rounded-lg p-4 max-w-4xl">
        <div className="grid grid-cols-5 gap-4 text-sm mb-3">
          <div className="text-center">
            <div className="text-blue-400 font-bold">dw</div>
            <div className="text-xs text-text-muted">Delete to end of word</div>
          </div>
          <div className="text-center">
            <div className="text-orange-400 font-bold">dd</div>
            <div className="text-xs text-text-muted">Delete entire line</div>
          </div>
          <div className="text-center">
            <div className="text-purple-400 font-bold">D</div>
            <div className="text-xs text-text-muted">Delete to end of line</div>
          </div>
          <div className="text-center">
            <div className="text-red-400 font-bold">dh</div>
            <div className="text-xs text-text-muted">Delete character left</div>
          </div>
          <div className="text-center">
            <div className="text-green-400 font-bold">dl</div>
            <div className="text-xs text-text-muted">
              Delete char under cursor
            </div>
          </div>
        </div>
        
        {/* Philosophy Section */}
        <div className="mt-6 bg-bg-tertiary/50 rounded-lg p-4 text-sm">
          <h3 className="text-emerald-400 font-semibold mb-3">Vim's Delete Philosophy: Operators + Motions</h3>
          <p className="text-text-secondary mb-3">
            In Vim, <span className="text-blue-400 font-mono">d</span> is a <strong>delete operator</strong> that combines with <strong>motions</strong> to create powerful commands. 
            The pattern is: <span className="text-yellow-300 font-mono">operator + motion = action</span>
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
            <div>
              <p className="text-text-muted font-medium mb-2">More delete combinations:</p>
              <ul className="text-text-secondary space-y-1 text-xs">
                <li><span className="text-orange-400 font-mono">dj</span> - Delete current and next line</li>
                <li><span className="text-orange-400 font-mono">dk</span> - Delete current and previous line</li>
                <li><span className="text-blue-400 font-mono">db</span> - Delete back to word start</li>
                <li><span className="text-blue-400 font-mono">de</span> - Delete to word end</li>
                <li><span className="text-purple-400 font-mono">d$</span> - Delete to line end (same as D)</li>
              </ul>
            </div>
            
            <div>
              <p className="text-text-muted font-medium mb-2">Change operator (c):</p>
              <ul className="text-text-secondary space-y-1 text-xs">
                <li><span className="text-green-400 font-mono">cw</span> - Change word (delete + insert mode)</li>
                <li><span className="text-green-400 font-mono">ch</span> - Change character left</li>
                <li><span className="text-green-400 font-mono">cl</span> - Change character under cursor</li>
                <li><span className="text-green-400 font-mono">cc</span> - Change entire line</li>
                <li><span className="text-green-400 font-mono">C</span> - Change to line end</li>
              </ul>
            </div>
          </div>
          
          <p className="text-text-muted text-xs italic">
            💡 The key difference: <span className="text-red-400">d</span> deletes and stays in normal mode, 
            <span className="text-green-400">c</span> deletes and enters insert mode for immediate editing.
          </p>
        </div>
      </div>

      {/* Level completion */}
      {levelCompleted && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-bg-secondary rounded-lg p-8 text-center max-w-md">
            <h2 className="text-3xl font-bold mb-4 text-purple-400">
              🎉 Level Complete!
            </h2>
            <p className="text-text-secondary mb-6">
              Excellent! You've mastered advanced delete operations. You can now
              delete words, lines, and text to end of line!
            </p>
            <div className="text-2xl font-bold text-green-400 mb-4">
              Score: {score}/{MAX_SCORE}
            </div>
            <p className="text-text-muted text-sm">
              Press <KBD>Esc</KBD> to play again
            </p>
          </div>
        </div>
      )}

      <div className="mt-6">
        <LevelTimer
          levelId="level-11-advanced-delete"
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
