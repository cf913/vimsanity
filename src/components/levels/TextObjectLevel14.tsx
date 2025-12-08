import { motion } from 'framer-motion'
import { HelpCircleIcon, RefreshCw } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import {
  KeyActionMap,
  useKeyboardHandler,
} from '../../hooks/useKeyboardHandler'
import { VIM_MODES, VimMode } from '../../utils/constants'
import { KBD } from '../common/KBD'
import LevelTimer from '../common/LevelTimer'
import ModeIndicator from '../common/ModeIndicator'
import Scoreboard from '../common/Scoreboard'
import { TextWithCursor } from '../common/TextWithCursor'
import ConfettiBurst from './ConfettiBurst'
import ExplosionEffect from './ExplosionEffect'

type CharSquare = {
  char: string
  isSpace: boolean
  isTarget: boolean // Red squares that need to be deleted
  lineIdx: number
  charIdx: number
}

type WordGroup = CharSquare[]

type Line = {
  words: WordGroup[]
  lineIdx: number
}

export default function TextObjectLevel14() {
  // Helper function to create character squares from text
  const createWordSquares = (
    text: string,
    lineIdx: number,
    startIdx: number,
    isTargetWord: boolean,
  ): CharSquare[] => {
    return text.split('').map((char, idx) => ({
      char,
      isSpace: char === ' ',
      isTarget: isTargetWord && char !== ' ',
      lineIdx,
      charIdx: startIdx + idx,
    }))
  }

  // Create initial game board with text and target words
  const createInitialLines = (): Line[] => {
    const sampleTexts = [
      { text: 'delete word examples', targetWords: [0] }, // 'delete' is target
      { text: 'inner word motions', targetWords: [1] }, // 'word' is target
      { text: 'around word testing', targetWords: [1] }, // 'word' is target
      { text: 'vim text objects', targetWords: [0, 2] }, // 'vim' and 'objects' are targets
      { text: 'practice diw daw', targetWords: [2] }, // 'daw' is target
    ]

    return sampleTexts.map((lineData, lineIdx) => {
      const words: WordGroup[] = []
      let charIdx = 0
      const textWords = lineData.text.split(' ')

      textWords.forEach((word, wordIdx) => {
        const isTargetWord = lineData.targetWords.includes(wordIdx)
        const wordSquares = createWordSquares(word, lineIdx, charIdx, isTargetWord)
        words.push(wordSquares)
        charIdx += word.length

        // Add space if not the last word
        if (wordIdx < textWords.length - 1) {
          words.push([
            {
              char: ' ',
              isSpace: true,
              isTarget: false,
              lineIdx,
              charIdx: charIdx,
            },
          ])
          charIdx += 1
        }
      })

      return { words, lineIdx }
    })
  }

  const [lines, setLines] = useState<Line[]>(createInitialLines())
  const [cursorPosition, setCursorPosition] = useState({ line: 0, charIdx: 0 })
  const [mode, setMode] = useState<VimMode>(VIM_MODES.NORMAL)
  const [score, setScore] = useState(0)
  const [showConfetti, setShowConfetti] = useState(false)
  const [levelCompleted, setLevelCompleted] = useState(false)
  const [lastKeyPressed, setLastKeyPressed] = useState<string>('')
  const [pendingCommand, setPendingCommand] = useState<string>('')
  const [showExplosion, setShowExplosion] = useState(false)
  const [explosionPos, setExplosionPos] = useState<{ line: number; charIdx: number } | null>(null)
  const [virtualColumn, setVirtualColumn] = useState(0)

  const playerRef = useRef<HTMLSpanElement>(null)

  // Count total target squares
  const countTotalTargets = (linesList: Line[]) => {
    return linesList.reduce((acc, line) => {
      return acc + line.words.reduce((wordAcc, word) => {
        return wordAcc + word.filter((sq) => sq.isTarget).length
      }, 0)
    }, 0)
  }

  const totalTargets = countTotalTargets(createInitialLines())
  const currentTargets = countTotalTargets(lines)

  // Check if level is completed (when all red squares are deleted)
  useEffect(() => {
    if (currentTargets === 0 && !levelCompleted && lines.length > 0) {
      setLevelCompleted(true)
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 3000)
    }
  }, [currentTargets, levelCompleted, lines])

  // Scroll to cursor
  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      })
    }
  }, [cursorPosition])

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
    setLines(createInitialLines())
    setCursorPosition({ line: 0, charIdx: 0 })
    setScore(0)
    setLevelCompleted(false)
    setShowConfetti(false)
    setLastKeyPressed('')
    setPendingCommand('')
    setMode(VIM_MODES.NORMAL)
    setVirtualColumn(0)
    setShowExplosion(false)
    setExplosionPos(null)
  }

  // Helper: Get all squares as flat array for current line
  const getLineSquares = (lineIdx: number): CharSquare[] => {
    if (lineIdx < 0 || lineIdx >= lines.length) return []
    return lines[lineIdx].words.flat()
  }

  // Helper: Find which word contains a character index
  const findWordIndexAtChar = (lineIdx: number, charIdx: number): number => {
    const line = lines[lineIdx]
    if (!line) return -1

    let currentCharIdx = 0
    for (let wordIdx = 0; wordIdx < line.words.length; wordIdx++) {
      const word = line.words[wordIdx]
      const wordLength = word.length
      if (charIdx >= currentCharIdx && charIdx < currentCharIdx + wordLength) {
        return wordIdx
      }
      currentCharIdx += wordLength
    }
    return -1
  }

  // Helper: Get word boundaries for current cursor position
  const getCurrentWordBoundaries = (): { start: number; end: number; wordIdx: number } | null => {
    const { line, charIdx } = cursorPosition
    const lineSquares = getLineSquares(line)
    if (lineSquares.length === 0) return null

    // Find the word containing the cursor
    let currentPos = 0
    for (let wordIdx = 0; wordIdx < lines[line].words.length; wordIdx++) {
      const word = lines[line].words[wordIdx]
      const wordStart = currentPos
      const wordEnd = currentPos + word.length - 1

      if (charIdx >= wordStart && charIdx <= wordEnd) {
        // Skip if it's a space "word"
        if (word.length === 1 && word[0].isSpace) {
          return null
        }
        return { start: wordStart, end: wordEnd, wordIdx }
      }
      currentPos += word.length
    }
    return null
  }

  // Helper: Show explosion effect and update score
  const triggerExplosion = (lineIdx: number, charIdx: number, deletedTargetCount: number) => {
    if (deletedTargetCount > 0) {
      setExplosionPos({ line: lineIdx, charIdx })
      setShowExplosion(true)
      setScore((s) => s + deletedTargetCount)
      setTimeout(() => {
        setShowExplosion(false)
        setExplosionPos(null)
      }, 300)
    }
  }

  // DELETE WORD (motion-based) - delete from cursor to start of next word
  const deleteWord = () => {
    const { line, charIdx } = cursorPosition
    const lineSquares = getLineSquares(line)
    if (lineSquares.length === 0) return

    // Find next word boundary
    let deleteEnd = charIdx
    let foundSpace = false

    // Move through spaces first
    for (let i = charIdx; i < lineSquares.length; i++) {
      if (!lineSquares[i].isSpace) {
        if (foundSpace) {
          deleteEnd = i
          break
        }
      } else {
        foundSpace = true
      }
      if (i === lineSquares.length - 1) {
        deleteEnd = i + 1
      }
    }

    // If we're on a word, delete to end of word plus following spaces
    if (!foundSpace) {
      for (let i = charIdx; i < lineSquares.length; i++) {
        if (lineSquares[i].isSpace) {
          deleteEnd = i
          // Include spaces
          while (deleteEnd < lineSquares.length && lineSquares[deleteEnd].isSpace) {
            deleteEnd++
          }
          break
        }
        if (i === lineSquares.length - 1) {
          deleteEnd = i + 1
        }
      }
    }

    // Count how many targets we're deleting
    let deletedTargetCount = 0
    for (let i = charIdx; i < deleteEnd; i++) {
      if (lineSquares[i].isTarget) deletedTargetCount++
    }

    // Delete characters from charIdx to deleteEnd
    setLines((prev) => {
      const newLines = [...prev]
      const currentLine = newLines[line]
      const newWords: WordGroup[] = []
      let currentCharIndex = 0

      for (const word of currentLine.words) {
        const wordStart = currentCharIndex
        const wordEnd = currentCharIndex + word.length

        // Keep characters outside the deletion range
        const filteredWord = word.filter((sq, idx) => {
          const absIdx = wordStart + idx
          return absIdx < charIdx || absIdx >= deleteEnd
        })

        if (filteredWord.length > 0) {
          newWords.push(filteredWord)
        }
        currentCharIndex = wordEnd
      }

      newLines[line] = { ...currentLine, words: newWords }
      return newLines
    })

    triggerExplosion(line, charIdx, deletedTargetCount)

    // Adjust cursor position
    const newLineSquares = getLineSquares(line).filter((_, idx) => idx < charIdx || idx >= deleteEnd)
    if (newLineSquares.length > 0) {
      setCursorPosition({ line, charIdx: Math.min(charIdx, newLineSquares.length - 1) })
    }
  }

  // DELETE INNER WORD (text object) - delete entire word under cursor
  const deleteInnerWord = () => {
    const boundaries = getCurrentWordBoundaries()
    if (!boundaries) return

    const { line, charIdx } = cursorPosition
    const { start, end, wordIdx } = boundaries

    // Count targets in this word
    const lineSquares = getLineSquares(line)
    let deletedTargetCount = 0
    for (let i = start; i <= end; i++) {
      if (lineSquares[i].isTarget) deletedTargetCount++
    }

    // Delete the entire word
    setLines((prev) => {
      const newLines = [...prev]
      const currentLine = newLines[line]
      const newWords = currentLine.words.filter((_, idx) => idx !== wordIdx)
      newLines[line] = { ...currentLine, words: newWords }
      return newLines
    })

    triggerExplosion(line, start, deletedTargetCount)

    // Move cursor to the position where the word was (or before it)
    const newLineSquares = getLineSquares(line).filter((_, idx) => idx < start || idx > end)
    if (newLineSquares.length > 0) {
      setCursorPosition({ line, charIdx: Math.max(0, Math.min(start, newLineSquares.length - 1)) })
    } else if (line > 0) {
      // Move to previous line if current line is empty
      const prevLineSquares = getLineSquares(line - 1)
      setCursorPosition({ line: line - 1, charIdx: Math.max(0, prevLineSquares.length - 1) })
    }
  }

  // DELETE A WORD (text object) - delete word + surrounding space
  const deleteAWord = () => {
    const boundaries = getCurrentWordBoundaries()
    if (!boundaries) return

    const { line } = cursorPosition
    const { start, end, wordIdx } = boundaries
    const lineSquares = getLineSquares(line)

    // Find if there's a space before or after to include
    let deleteStart = start
    let deleteEnd = end + 1
    let wordsToDelete = [wordIdx]

    // Check for space after
    if (wordIdx + 1 < lines[line].words.length) {
      const nextWord = lines[line].words[wordIdx + 1]
      if (nextWord.length === 1 && nextWord[0].isSpace) {
        wordsToDelete.push(wordIdx + 1)
      }
    } else if (wordIdx > 0) {
      // No space after, check for space before
      const prevWord = lines[line].words[wordIdx - 1]
      if (prevWord.length === 1 && prevWord[0].isSpace) {
        wordsToDelete.unshift(wordIdx - 1)
        deleteStart = start - 1
      }
    }

    // Count targets
    let deletedTargetCount = 0
    for (let i = deleteStart; i < deleteEnd; i++) {
      if (i >= 0 && i < lineSquares.length && lineSquares[i].isTarget) {
        deletedTargetCount++
      }
    }

    // Delete the word and adjacent space
    setLines((prev) => {
      const newLines = [...prev]
      const currentLine = newLines[line]
      const newWords = currentLine.words.filter((_, idx) => !wordsToDelete.includes(idx))
      newLines[line] = { ...currentLine, words: newWords }
      return newLines
    })

    triggerExplosion(line, start, deletedTargetCount)

    // Adjust cursor
    const newLineSquares = getLineSquares(line).filter((_, idx) => idx < deleteStart || idx >= deleteEnd)
    if (newLineSquares.length > 0) {
      setCursorPosition({ line, charIdx: Math.max(0, Math.min(deleteStart, newLineSquares.length - 1)) })
    } else if (line > 0) {
      const prevLineSquares = getLineSquares(line - 1)
      setCursorPosition({ line: line - 1, charIdx: Math.max(0, prevLineSquares.length - 1) })
    }
  }

  const handleCommand = (command: string) => {
    switch (command) {
      case 'dw':
        deleteWord()
        setLastKeyPressed('dw')
        break
      case 'diw':
        deleteInnerWord()
        setLastKeyPressed('diw')
        break
      case 'daw':
        deleteAWord()
        setLastKeyPressed('daw')
        break
      case 'ciw':
        deleteInnerWord()
        setLastKeyPressed('ciw')
        setMode(VIM_MODES.INSERT)
        break
      case 'caw':
        deleteAWord()
        setLastKeyPressed('caw')
        setMode(VIM_MODES.INSERT)
        break
      default:
        break
    }
    setPendingCommand('')
  }

  // Movement handlers
  const moveLeft = () => {
    const { line, charIdx } = cursorPosition
    if (charIdx > 0) {
      setCursorPosition({ line, charIdx: charIdx - 1 })
      setVirtualColumn(charIdx - 1)
    } else if (line > 0) {
      // Move to end of previous line
      const prevLineSquares = getLineSquares(line - 1)
      setCursorPosition({ line: line - 1, charIdx: Math.max(0, prevLineSquares.length - 1) })
      setVirtualColumn(prevLineSquares.length - 1)
    }
  }

  const moveRight = () => {
    const { line, charIdx } = cursorPosition
    const lineSquares = getLineSquares(line)
    if (charIdx < lineSquares.length - 1) {
      setCursorPosition({ line, charIdx: charIdx + 1 })
      setVirtualColumn(charIdx + 1)
    } else if (line < lines.length - 1) {
      // Move to start of next line
      setCursorPosition({ line: line + 1, charIdx: 0 })
      setVirtualColumn(0)
    }
  }

  const moveUp = () => {
    const { line } = cursorPosition
    if (line > 0) {
      const prevLineSquares = getLineSquares(line - 1)
      const newCharIdx = Math.min(virtualColumn, Math.max(0, prevLineSquares.length - 1))
      setCursorPosition({ line: line - 1, charIdx: newCharIdx })
    }
  }

  const moveDown = () => {
    const { line } = cursorPosition
    if (line < lines.length - 1) {
      const nextLineSquares = getLineSquares(line + 1)
      const newCharIdx = Math.min(virtualColumn, Math.max(0, nextLineSquares.length - 1))
      setCursorPosition({ line: line + 1, charIdx: newCharIdx })
    }
  }

  const moveToLineStart = () => {
    setCursorPosition({ ...cursorPosition, charIdx: 0 })
    setVirtualColumn(0)
  }

  const moveToLineEnd = () => {
    const lineSquares = getLineSquares(cursorPosition.line)
    const endIdx = Math.max(0, lineSquares.length - 1)
    setCursorPosition({ ...cursorPosition, charIdx: endIdx })
    setVirtualColumn(endIdx)
  }

  const moveWordForward = () => {
    const { line, charIdx } = cursorPosition
    const lineSquares = getLineSquares(line)

    // Find the start of the next word
    let nextIdx = charIdx + 1
    let inSpace = lineSquares[charIdx]?.isSpace || false

    for (let i = nextIdx; i < lineSquares.length; i++) {
      if (inSpace && !lineSquares[i].isSpace) {
        setCursorPosition({ line, charIdx: i })
        setVirtualColumn(i)
        return
      }
      inSpace = lineSquares[i].isSpace
    }

    // If no next word on this line, move to start of next line
    if (line < lines.length - 1) {
      setCursorPosition({ line: line + 1, charIdx: 0 })
      setVirtualColumn(0)
    }
  }

  const moveWordBackward = () => {
    const { line, charIdx } = cursorPosition

    // Move to start of current word or previous word
    let checkIdx = charIdx - 1
    if (checkIdx < 0) {
      if (line > 0) {
        const prevLineSquares = getLineSquares(line - 1)
        setCursorPosition({ line: line - 1, charIdx: Math.max(0, prevLineSquares.length - 1) })
        setVirtualColumn(prevLineSquares.length - 1)
      }
      return
    }

    const lineSquares = getLineSquares(line)

    // Skip spaces
    while (checkIdx >= 0 && lineSquares[checkIdx].isSpace) {
      checkIdx--
    }

    // Find start of word
    while (checkIdx > 0 && !lineSquares[checkIdx - 1].isSpace) {
      checkIdx--
    }

    setCursorPosition({ line, charIdx: Math.max(0, checkIdx) })
    setVirtualColumn(checkIdx)
  }

  const moveWordEnd = () => {
    const { line, charIdx } = cursorPosition
    const lineSquares = getLineSquares(line)

    // Move to end of current or next word
    let checkIdx = charIdx + 1

    // Skip current word if we're in one
    while (checkIdx < lineSquares.length && !lineSquares[checkIdx].isSpace) {
      checkIdx++
    }

    // Skip spaces
    while (checkIdx < lineSquares.length && lineSquares[checkIdx].isSpace) {
      checkIdx++
    }

    // Find end of next word
    while (checkIdx < lineSquares.length && !lineSquares[checkIdx].isSpace) {
      checkIdx++
    }

    setCursorPosition({ line, charIdx: Math.min(lineSquares.length - 1, checkIdx - 1) })
    setVirtualColumn(checkIdx - 1)
  }

  // Keyboard handler
  const keyActionMap: KeyActionMap = {
    h: () => {
      if (mode === VIM_MODES.NORMAL && !pendingCommand) {
        moveLeft()
        setLastKeyPressed('h')
      }
    },
    l: () => {
      if (mode === VIM_MODES.NORMAL && !pendingCommand) {
        moveRight()
        setLastKeyPressed('l')
      }
    },
    k: () => {
      if (mode === VIM_MODES.NORMAL && !pendingCommand) {
        moveUp()
        setLastKeyPressed('k')
      }
    },
    j: () => {
      if (mode === VIM_MODES.NORMAL && !pendingCommand) {
        moveDown()
        setLastKeyPressed('j')
      }
    },
    '0': () => {
      if (mode === VIM_MODES.NORMAL && !pendingCommand) {
        moveToLineStart()
        setLastKeyPressed('0')
      }
    },
    '$': () => {
      if (mode === VIM_MODES.NORMAL && !pendingCommand) {
        moveToLineEnd()
        setLastKeyPressed('$')
      }
    },
    b: () => {
      if (mode === VIM_MODES.NORMAL && !pendingCommand) {
        moveWordBackward()
        setLastKeyPressed('b')
      }
    },
    e: () => {
      if (mode === VIM_MODES.NORMAL && !pendingCommand) {
        moveWordEnd()
        setLastKeyPressed('e')
      }
    },
    d: () => {
      if (mode === VIM_MODES.NORMAL) {
        if (pendingCommand === 'd') {
          // dd not supported in this level
          setPendingCommand('')
        } else {
          setPendingCommand('d')
          setLastKeyPressed('d')
        }
      }
    },
    c: () => {
      if (mode === VIM_MODES.NORMAL) {
        if (pendingCommand === 'c') {
          // cc not supported in this level
          setPendingCommand('')
        } else {
          setPendingCommand('c')
          setLastKeyPressed('c')
        }
      }
    },
    i: () => {
      if (mode === VIM_MODES.NORMAL) {
        if (pendingCommand === 'd') {
          setPendingCommand('di')
          setLastKeyPressed('di')
        } else if (pendingCommand === 'c') {
          setPendingCommand('ci')
          setLastKeyPressed('ci')
        }
      }
    },
    a: () => {
      if (mode === VIM_MODES.NORMAL) {
        if (pendingCommand === 'd') {
          setPendingCommand('da')
          setLastKeyPressed('da')
        } else if (pendingCommand === 'c') {
          setPendingCommand('ca')
          setLastKeyPressed('ca')
        }
      }
    },
    w: () => {
      if (pendingCommand === 'di') {
        handleCommand('diw')
      } else if (pendingCommand === 'da') {
        handleCommand('daw')
      } else if (pendingCommand === 'ci') {
        handleCommand('ciw')
      } else if (pendingCommand === 'ca') {
        handleCommand('caw')
      } else if (pendingCommand === 'd') {
        // dw - delete word (motion-based)
        handleCommand('dw')
      } else if (mode === VIM_MODES.NORMAL && !pendingCommand) {
        // w for word movement
        moveWordForward()
        setLastKeyPressed('w')
      }
    },
    Escape: () => {
      if (mode === VIM_MODES.INSERT) {
        setMode(VIM_MODES.NORMAL)
        setLastKeyPressed('Esc')
      } else if (pendingCommand) {
        setPendingCommand('')
        setLastKeyPressed('')
      }
    },
  }

  useKeyboardHandler({
    keyActionMap,
    dependencies: [cursorPosition, lines, pendingCommand, mode],
  })

  return (
    <div className="flex flex-col items-center justify-center gap-8 p-8 w-full max-w-6xl mx-auto">
      {showConfetti && <ConfettiBurst />}

      {/* Header */}
      <div className="flex items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-200">
          Text Objects: Delete Inner & Around Word
        </h2>
        <button
          onClick={handleRestart}
          className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors border border-zinc-700"
          title="Restart Level"
        >
          <RefreshCw className="w-5 h-5 text-slate-400" />
        </button>
      </div>

      {/* Text Objects vs Motion-Based Deletion */}
      <div className="bg-zinc-800/50 rounded-xl p-6 border border-zinc-700 max-w-4xl">
        <h3 className="text-lg font-semibold text-blue-400 mb-4 text-center">
          Text Objects (<KBD>diw</KBD>/<KBD>daw</KBD>) vs Motion-Based Deletion
          (<KBD>dw</KBD>)
        </h3>

        <div className="grid grid-cols-3 gap-6">
          {/* dw - Motion Based */}
          <div className="space-y-3">
            <div className="text-center">
              <KBD>dw</KBD>
              <span className="text-slate-400 ml-2 block text-xs mt-1">
                delete word (motion-based)
              </span>
            </div>
            <div className="bg-zinc-900 rounded-lg p-3 space-y-2">
              <div className="text-xs text-slate-500 mb-1">Example:</div>
              <div className="font-mono text-xs">
                <div className="text-slate-400">
                  Before: <span className="text-slate-200">hello </span>
                  <TextWithCursor
                    text="world"
                    cursorPosition={0}
                    cursorMode="block"
                    highlightColor="bg-blue-500/30 px-1"
                    textColor="text-blue-300"
                  />
                  <span className="text-slate-200"> today</span>
                </div>
                <motion.div
                  className="text-emerald-400 mt-1"
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                >
                  After: <span className="text-slate-200">hello </span>
                  <TextWithCursor
                    text="today"
                    cursorPosition={0}
                    cursorMode="block"
                  />
                </motion.div>
              </div>
              <p className="text-xs text-slate-500 italic mt-2">
                Deletes from cursor to start of next word
              </p>
            </div>
          </div>

          {/* diw - Text Object */}
          <div className="space-y-3">
            <div className="text-center">
              <KBD>diw</KBD>
              <span className="text-slate-400 ml-2 block text-xs mt-1">
                delete inner word (text object)
              </span>
            </div>
            <div className="bg-zinc-900 rounded-lg p-3 space-y-2">
              <div className="text-xs text-slate-500 mb-1">Example:</div>
              <div className="font-mono text-xs">
                <div className="text-slate-400">
                  Before: <span className="text-slate-200">hello </span>
                  <TextWithCursor
                    text="world"
                    cursorPosition={2}
                    cursorMode="block"
                    highlightColor="bg-purple-500/30 px-1"
                    textColor="text-purple-300"
                  />
                  <span className="text-slate-200"> today</span>
                </div>
                <motion.div
                  className="text-emerald-400 mt-1"
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                >
                  After: <span className="text-slate-200">hello </span>
                  <TextWithCursor
                    text=" "
                    cursorPosition={0}
                    cursorMode="block"
                  />
                  <span className="text-slate-200">today</span>
                </motion.div>
              </div>
              <p className="text-xs text-slate-500 italic mt-2">
                Deletes entire word, cursor position doesn't matter
              </p>
            </div>
          </div>

          {/* daw - Text Object */}
          <div className="space-y-3">
            <div className="text-center">
              <KBD>daw</KBD>
              <span className="text-slate-400 ml-2 block text-xs mt-1">
                delete a word (text object)
              </span>
            </div>
            <div className="bg-zinc-900 rounded-lg p-3 space-y-2">
              <div className="text-xs text-slate-500 mb-1">Example:</div>
              <div className="font-mono text-xs">
                <div className="text-slate-400">
                  Before: <span className="text-slate-200">hello </span>
                  <TextWithCursor
                    text="world"
                    cursorPosition={2}
                    cursorMode="block"
                    highlightColor="bg-orange-500/30 px-1"
                    textColor="text-orange-300"
                  />
                  <span className="text-slate-200"> today</span>
                </div>
                <motion.div
                  className="text-emerald-400 mt-1"
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                >
                  After: <span className="text-slate-200">hello </span>
                  <TextWithCursor
                    text="today"
                    cursorPosition={0}
                    cursorMode="block"
                  />
                </motion.div>
              </div>
              <p className="text-xs text-slate-500 italic mt-2">
                Deletes word + space, works anywhere in word
              </p>
            </div>
          </div>
        </div>

        {/* Key Difference Summary */}
        <div className="mt-6 p-4 bg-zinc-900/50 rounded-lg border border-blue-500/30">
          <h4 className="text-sm font-semibold text-blue-300 mb-2">
            Key Difference:
          </h4>
          <ul className="text-xs text-slate-400 space-y-1.5">
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-0.5">•</span>
              <span>
                <KBD className="text-xs">dw</KBD> is{' '}
                <strong className="text-slate-300">cursor-dependent</strong> -
                deletes from current position to next word boundary
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-400 mt-0.5">•</span>
              <span>
                <KBD className="text-xs">diw</KBD> is{' '}
                <strong className="text-slate-300">position-independent</strong>{' '}
                - deletes the entire word your cursor is on, regardless of
                position
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-400 mt-0.5">•</span>
              <span>
                <KBD className="text-xs">daw</KBD> is like{' '}
                <KBD className="text-xs">diw</KBD> but also removes surrounding
                whitespace for cleaner deletion
              </span>
            </li>
          </ul>
        </div>
        <div className="mt-4 text-center text-xs text-slate-500">
          Same concept applies to <KBD>ciw</KBD> and <KBD>caw</KBD> for changing
          text
        </div>
      </div>

      {/* Instructions */}
      <div className="text-center space-y-2 max-w-3xl">
        <p className="text-slate-300">
          Delete or change the{' '}
          <span className="text-red-400 font-bold">red target words</span> using
          text object commands
        </p>
      </div>

      {/* Mode and Score */}
      <div className="flex gap-6 items-center">
        <ModeIndicator isInsertMode={mode === VIM_MODES.INSERT} />
        <Scoreboard score={score} maxScore={totalTargets} />
      </div>

      {/* Pending Command Indicator */}
      {pendingCommand && (
        <div className="text-emerald-400 font-mono text-lg">
          Command: <KBD>{pendingCommand}</KBD>_
        </div>
      )}

      {/* Character Grid Display */}
      <div className="bg-zinc-900 rounded-xl p-8 border-2 border-zinc-700 shadow-2xl max-w-full overflow-x-auto">
        <div className="space-y-2 font-mono">
          {lines.map((line) => {
            const lineSquares = line.words.flat()
            return (
              <div key={line.lineIdx} className="flex flex-row flex-wrap gap-1">
                {line.words.map((word, wordIdx) => (
                  <div key={`${line.lineIdx}-${wordIdx}`} className="flex flex-row">
                    {word.map((square) => {
                      const absoluteCharIdx = lineSquares.indexOf(square)
                      const isCursor =
                        cursorPosition.line === line.lineIdx &&
                        cursorPosition.charIdx === absoluteCharIdx

                      const isExplosion =
                        showExplosion &&
                        explosionPos?.line === line.lineIdx &&
                        explosionPos?.charIdx === absoluteCharIdx

                      let baseClass =
                        'inline-flex items-center justify-center min-w-8 h-8 transition-all duration-150 rounded-md font-medium text-sm '

                      if (square.isSpace) {
                        // Space square
                        const baseSpace =
                          'inline-block w-3 h-8 transition-all duration-150 rounded-md '
                        const cursorSpace = isCursor
                          ? mode === VIM_MODES.INSERT
                            ? 'bg-orange-500/25 shadow-lg shadow-orange-500/10 '
                            : 'bg-emerald-500/25 shadow-lg shadow-emerald-500/10 '
                          : ''
                        return (
                          <span
                            key={`${line.lineIdx}-${absoluteCharIdx}`}
                            ref={isCursor ? playerRef : undefined}
                            className={baseSpace + cursorSpace}
                          />
                        )
                      }

                      // Character square styling
                      if (isCursor) {
                        baseClass +=
                          mode === VIM_MODES.INSERT
                            ? 'bg-orange-500 text-white scale-110 shadow-lg shadow-orange-500/50 '
                            : 'bg-emerald-500 text-white scale-110 shadow-lg shadow-emerald-500/50 '
                      } else if (square.isTarget) {
                        baseClass += 'bg-red-500 text-white shadow-md '
                      } else {
                        baseClass += 'bg-zinc-700 text-zinc-300 '
                      }

                      return (
                        <span
                          key={`${line.lineIdx}-${absoluteCharIdx}`}
                          ref={isCursor ? playerRef : undefined}
                          className={baseClass}
                          style={{ position: 'relative' }}
                        >
                          {square.char}
                          {isExplosion && (
                            <div className="absolute inset-0 z-20">
                              <ExplosionEffect />
                            </div>
                          )}
                        </span>
                      )
                    })}
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      </div>

      {/* Help Section */}
      <div className="flex gap-4 items-center">
        <HelpCircleIcon className="w-5 h-5 text-slate-500" />
        <div className="text-slate-500 text-sm space-y-1 max-w-3xl">
          <p>
            Navigate: <KBD>h</KBD> <KBD>j</KBD> <KBD>k</KBD> <KBD>l</KBD> (char), <KBD>w</KBD> <KBD>b</KBD> <KBD>e</KBD> (word), <KBD>0</KBD> <KBD>$</KBD> (line)
          </p>
          <p>
            Delete red squares: <KBD>dw</KBD> (cursor to next word), <KBD>diw</KBD> (entire word), <KBD>daw</KBD> (word + space)
          </p>
          <p className="text-xs text-slate-600">
            Note: <KBD>ciw</KBD> and <KBD>caw</KBD> work like their delete counterparts but enter INSERT mode. Press <KBD>Esc</KBD> to return to NORMAL.
          </p>
        </div>
      </div>

      {/* Last Key Pressed */}
      {lastKeyPressed && (
        <div className="text-slate-500 text-sm font-mono">
          Last command: <KBD>{lastKeyPressed}</KBD>
        </div>
      )}

      {/* Level Completion Message */}
      {levelCompleted && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50"
        >
          <div className="bg-zinc-900 rounded-2xl p-12 border-4 border-emerald-500 text-center space-y-6">
            <h2 className="text-4xl font-bold text-emerald-400">
              Level Complete! 🎉
            </h2>
            <p className="text-xl text-slate-300">
              You've mastered text object commands!
            </p>
            <p className="text-slate-400">
              Press <KBD>Esc</KBD> to restart
            </p>
            <LevelTimer levelId={14} isActive={false} />
          </div>
        </motion.div>
      )}

      {!levelCompleted && <LevelTimer levelId={14} isActive={true} />}
    </div>
  )
}
