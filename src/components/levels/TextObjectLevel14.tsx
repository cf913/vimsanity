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

type WordSquare = {
  id: number
  text: string
  isTarget: boolean
  color: string
}

type Line = WordSquare[]

export default function TextObjectLevel14() {
  // Initial setup with lines of word squares
  const createInitialLines = (): Line[] => [
    [
      { id: 1, text: '■■■', isTarget: true, color: 'bg-red-500' },
      { id: 2, text: '■■', isTarget: false, color: 'bg-blue-500' },
      { id: 3, text: '■■■■', isTarget: false, color: 'bg-blue-500' },
    ],
    [
      { id: 4, text: '■■', isTarget: false, color: 'bg-blue-500' },
      { id: 5, text: '■■■■■', isTarget: true, color: 'bg-red-500' },
      { id: 6, text: '■■', isTarget: false, color: 'bg-blue-500' },
    ],
    [
      { id: 7, text: '■■■■', isTarget: false, color: 'bg-blue-500' },
      { id: 8, text: '■■', isTarget: false, color: 'bg-blue-500' },
      { id: 9, text: '■■■', isTarget: true, color: 'bg-red-500' },
    ],
    [
      { id: 10, text: '■■■', isTarget: true, color: 'bg-red-500' },
      { id: 11, text: '■■■■', isTarget: false, color: 'bg-blue-500' },
    ],
  ]

  const [lines, setLines] = useState<Line[]>(createInitialLines())
  const [cursorPosition, setCursorPosition] = useState({ line: 0, word: 0 })
  const [mode, setMode] = useState<VimMode>(VIM_MODES.NORMAL)
  const [score, setScore] = useState(0)
  const [deletedTargets, setDeletedTargets] = useState<Set<number>>(new Set())
  const [showConfetti, setShowConfetti] = useState(false)
  const [levelCompleted, setLevelCompleted] = useState(false)
  const [lastKeyPressed, setLastKeyPressed] = useState<string>('')
  const [pendingCommand, setPendingCommand] = useState<string>('')
  const [wrongMoveMessage, setWrongMoveMessage] = useState<string>('')
  const [replacementInput, setReplacementInput] = useState<string>('')
  const [isWaitingForReplacement, setIsWaitingForReplacement] =
    useState<boolean>(false)

  const totalTargets = createInitialLines().reduce(
    (acc, line) => acc + line.filter((w) => w.isTarget).length,
    0,
  )

  // Check if level is completed
  useEffect(() => {
    if (score === totalTargets && !levelCompleted) {
      setLevelCompleted(true)
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 3000)
    }
  }, [score, totalTargets, levelCompleted])

  // Reset wrong move message
  useEffect(() => {
    if (wrongMoveMessage) {
      const timer = setTimeout(() => {
        setWrongMoveMessage('')
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [wrongMoveMessage])

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
    setCursorPosition({ line: 0, word: 0 })
    setScore(0)
    setDeletedTargets(new Set())
    setLevelCompleted(false)
    setShowConfetti(false)
    setLastKeyPressed('')
    setPendingCommand('')
    setWrongMoveMessage('')
    setMode(VIM_MODES.NORMAL)
    setReplacementInput('')
    setIsWaitingForReplacement(false)
  }

  const getCurrentWord = () => {
    const line = lines[cursorPosition.line]
    return line ? line[cursorPosition.word] : null
  }

  const deleteInnerWord = () => {
    const currentWord = getCurrentWord()
    if (!currentWord) return

    setLines((prev) => {
      const newLines = prev.map((line, lineIdx) => {
        if (lineIdx === cursorPosition.line) {
          return line.filter((_, wordIdx) => wordIdx !== cursorPosition.word)
        }
        return line
      })
      return newLines
    })

    if (currentWord.isTarget && !deletedTargets.has(currentWord.id)) {
      setScore((s) => s + 1)
      setDeletedTargets((prev) => new Set(prev).add(currentWord.id))
    }

    // Move cursor to previous word if possible
    if (cursorPosition.word > 0) {
      setCursorPosition((prev) => ({ ...prev, word: prev.word - 1 }))
    } else if (lines[cursorPosition.line].length > 1) {
      // Stay at position 0 if there are still words
      setCursorPosition((prev) => ({ ...prev, word: 0 }))
    } else if (cursorPosition.line > 0) {
      // Move to previous line if current line is now empty
      setCursorPosition({
        line: cursorPosition.line - 1,
        word: Math.max(0, lines[cursorPosition.line - 1].length - 2),
      })
    }
  }

  const deleteAWord = () => {
    // For this simplified version, daw behaves the same as diw
    // In real Vim, daw would also delete surrounding whitespace
    deleteInnerWord()
  }

  const changeInnerWord = () => {
    const currentWord = getCurrentWord()
    if (!currentWord) return

    // Delete the word
    setLines((prev) => {
      const newLines = prev.map((line, lineIdx) => {
        if (lineIdx === cursorPosition.line) {
          return line.filter((_, wordIdx) => wordIdx !== cursorPosition.word)
        }
        return line
      })
      return newLines
    })

    if (currentWord.isTarget && !deletedTargets.has(currentWord.id)) {
      setScore((s) => s + 1)
      setDeletedTargets((prev) => new Set(prev).add(currentWord.id))
    }

    // For simplicity, just move cursor back
    if (cursorPosition.word > 0) {
      setCursorPosition((prev) => ({ ...prev, word: prev.word - 1 }))
    }
  }

  const changeAWord = () => {
    // For this simplified version, caw behaves the same as ciw
    changeInnerWord()
  }

  const handleCommand = (command: string) => {
    switch (command) {
      case 'diw':
        deleteInnerWord()
        setLastKeyPressed('diw')
        break
      case 'daw':
        deleteAWord()
        setLastKeyPressed('daw')
        break
      case 'ciw':
        changeInnerWord()
        setLastKeyPressed('ciw')
        break
      case 'caw':
        changeAWord()
        setLastKeyPressed('caw')
        break
      default:
        break
    }
    setPendingCommand('')
  }

  // Movement handlers
  const moveLeft = () => {
    if (cursorPosition.word > 0) {
      setCursorPosition((prev) => ({ ...prev, word: prev.word - 1 }))
    }
  }

  const moveRight = () => {
    const currentLine = lines[cursorPosition.line]
    if (currentLine && cursorPosition.word < currentLine.length - 1) {
      setCursorPosition((prev) => ({ ...prev, word: prev.word + 1 }))
    }
  }

  const moveUp = () => {
    if (cursorPosition.line > 0) {
      const newLine = cursorPosition.line - 1
      const newLineLength = lines[newLine].length
      const newWord = Math.min(cursorPosition.word, newLineLength - 1)
      setCursorPosition({ line: newLine, word: Math.max(0, newWord) })
    }
  }

  const moveDown = () => {
    if (cursorPosition.line < lines.length - 1) {
      const newLine = cursorPosition.line + 1
      const newLineLength = lines[newLine].length
      const newWord = Math.min(cursorPosition.word, newLineLength - 1)
      setCursorPosition({ line: newLine, word: Math.max(0, newWord) })
    }
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
      } else {
        // w for word movement not enabled in this level
        setPendingCommand('')
      }
    },
    Escape: () => {
      if (pendingCommand) {
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
          Text Objects: Inner & Around Word
        </h2>
        <button
          onClick={handleRestart}
          className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors border border-zinc-700"
          title="Restart Level"
        >
          <RefreshCw className="w-5 h-5 text-slate-400" />
        </button>
      </div>

      {/* Instructions */}
      <div className="text-center space-y-2 max-w-3xl">
        <p className="text-slate-300">
          Delete or change the <span className="text-red-400 font-bold">red target words</span>{' '}
          using text object commands
        </p>
        <div className="flex gap-4 justify-center text-sm">
          <span className="text-slate-400">
            <KBD>diw</KBD> = delete inner word
          </span>
          <span className="text-slate-400">
            <KBD>daw</KBD> = delete a word
          </span>
          <span className="text-slate-400">
            <KBD>ciw</KBD> = change inner word
          </span>
          <span className="text-slate-400">
            <KBD>caw</KBD> = change a word
          </span>
        </div>
      </div>

      {/* Mode and Score */}
      <div className="flex gap-6 items-center">
        <ModeIndicator mode={mode} />
        <Scoreboard score={score} maxScore={totalTargets} />
      </div>

      {/* Pending Command Indicator */}
      {pendingCommand && (
        <div className="text-emerald-400 font-mono text-lg">
          Command: <KBD>{pendingCommand}</KBD>_
        </div>
      )}

      {/* Wrong Move Message */}
      {wrongMoveMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-orange-400 font-mono text-sm"
        >
          {wrongMoveMessage}
        </motion.div>
      )}

      {/* Word Grid Display */}
      <div className="bg-zinc-900 rounded-xl p-8 border-2 border-zinc-700 shadow-2xl">
        <div className="space-y-4 font-mono text-3xl">
          {lines.map((line, lineIdx) => (
            <div key={lineIdx} className="flex gap-6 items-center">
              {line.map((word, wordIdx) => {
                const isCursor =
                  cursorPosition.line === lineIdx &&
                  cursorPosition.word === wordIdx
                return (
                  <motion.div
                    key={word.id}
                    className={`
                      ${word.color} text-white px-3 py-2 rounded-lg
                      ${isCursor ? 'ring-4 ring-emerald-400 scale-110' : ''}
                      transition-all duration-200
                    `}
                    animate={isCursor ? { scale: 1.1 } : { scale: 1 }}
                  >
                    {word.text}
                  </motion.div>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Help Section */}
      <div className="flex gap-4 items-center">
        <HelpCircleIcon className="w-5 h-5 text-slate-500" />
        <p className="text-slate-500 text-sm">
          Use <KBD>h</KBD> <KBD>j</KBD> <KBD>k</KBD> <KBD>l</KBD> to navigate,
          then use text object commands to delete red words
        </p>
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
