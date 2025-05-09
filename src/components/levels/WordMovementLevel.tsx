import React, { useState, useRef, useEffect } from 'react'
import {
  useKeyboardHandler,
  KeyActionMap,
} from '../../hooks/useKeyboardHandler'
import {
  processTextForVim,
  moveToNextWordBoundary,
  moveToPrevWordBoundary,
  moveToWordEnd,
} from '../../utils/textUtils'
import ExplosionEffect from './ExplosionEffect'
import ConfettiBurst from './ConfettiBurst'
import { RefreshCw, Shuffle, Trophy, Zap } from 'lucide-react'

interface WordMovementLevelProps {
  isMuted: boolean
}

const WordMovementLevel: React.FC<WordMovementLevelProps> = ({ isMuted }) => {
  const sampleTexts = [
    'Vim users never lose their keys they just remap them',
    'I would exit Vim but I forgot how to quit the program',
    'Normal mode is my happy place insert mode gives me anxiety',
    'The quick brown fox jumps over the lazy Vim user',
    'Hjkl keys are my compass in the sea of text editing',
    'Modal editing is the pathway to text manipulation powers',
    'Vim macros saved me hours dot command saved me days',
    'Substitute command changed my life and all occurrences',
    'Visual block mode is the secret weapon of text ninjas',
    'Escape key is worn out but my productivity is maxed',
    'Yank and put until your fingers know the dance',
    'Vim motions flow like water text edits like lightning',
    'Regular expressions in Vim are both magic and nightmare',
    'Vimtutor is the dojo where text warriors are forged',
    'Buffers splits and tabs oh my navigation never looked so good',
    'Vim plugins are like toppings on an already delicious pizza',
    'Text objects are the building blocks of editing mastery',
    'Registers remember what you forgot clipboard never could',
    'Undo tree is a time machine for your editing mistakes',
    'Vim configuration files grow longer with every epiphany',
  ]

  // Randomly select one sentence when component loads
  const [selectedTextIndex, setSelectedTextIndex] = useState(() =>
    Math.floor(Math.random() * sampleTexts.length)
  )
  const sampleText = sampleTexts[selectedTextIndex]
  const characters = processTextForVim(sampleText)

  // We'll use the same number of squares as characters, including spaces for spacing
  const squares = characters.map((char, idx) => ({
    isSpace: char === ' ',
    idx,
    char,
  }))

  // Group characters into words for proper wrapping
  const words = squares
    .reduce((acc: Array<Array<(typeof squares)[0]>>, square) => {
      if (square.isSpace) {
        // Add space as its own "word"
        acc.push([square])
        // Start a new word
        acc.push([])
      } else {
        // If we have no words yet or the last word is a space, start a new word
        if (acc.length === 0 || acc[acc.length - 1][0]?.isSpace) {
          acc.push([square])
        } else {
          // Add to the current word
          acc[acc.length - 1].push(square)
        }
      }
      return acc
    }, [])
    .filter((word) => word.length > 0) // Remove any empty words

  const [cursor, setcursor] = useState<number>(0)
  const [target, setSquareTarget] = useState<number>(5)
  const [score, setScore] = useState(0)
  const [showConfetti, setShowConfetti] = useState(false)
  const [showExplosion, setShowExplosion] = useState(false)
  const [explosionIdx, setExplosionIdx] = useState<number | null>(null)
  const [revealedLetters, setRevealedLetters] = useState<Set<number>>(new Set())
  const [levelCompleted, setLevelCompleted] = useState(false)

  // Ref for scrolling
  const containerRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (playerRef.current && containerRef.current) {
      playerRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      })
    }
  }, [cursor])

  // Key actions (move left/right, and word boundaries, but now just move between squares)
  const keyActions: KeyActionMap = {
    h: () => {
      if (cursor > 0) {
        setcursor(cursor - 1)
        checkTarget(cursor - 1)
      }
    },
    l: () => {
      if (cursor < squares.length - 1) {
        setcursor(cursor + 1)
        checkTarget(cursor + 1)
      }
    },
    w: () => {
      const newPos = moveToNextWordBoundary(characters, cursor)
      setcursor(newPos)
      checkTarget(newPos)
    },
    e: () => {
      const newPos = moveToWordEnd(characters, cursor)
      setcursor(newPos)
      checkTarget(newPos)
    },
    b: () => {
      const newPos = moveToPrevWordBoundary(characters, cursor)
      setcursor(newPos)
      checkTarget(newPos)
    },
  }

  const checkTarget = (newPos: number) => {
    if (newPos === target) {
      if (!isMuted) {
        // Add sound here if needed
      }
      setScore(score + 1)
      setShowExplosion(true)
      setExplosionIdx(target)
      // setShowConfetti(true)

      const oldRevealed = revealedLetters
      const newRevealed = new Set(oldRevealed)
      newRevealed.add(target)
      // Add the current target to revealed letters
      setRevealedLetters(newRevealed)

      // Set a timeout to hide the explosion
      setTimeout(() => {
        setShowExplosion(false)
        setExplosionIdx(null)
      }, 350)

      // skipping confetti for now
      // setTimeout(() => setShowConfetti(false), 1500);

      // Generate new target - must be a square that hasn't been revealed yet
      let newTarget
      let availableSquares = squares
        .filter(
          (square, idx) =>
            !square.isSpace && idx !== cursor && !revealedLetters.has(idx)
        )
        .map((square) => square.idx)

      // Check if there are any available squares left
      if (availableSquares.length > 0) {
        // Pick a random square from available ones
        const randomIndex = Math.floor(Math.random() * availableSquares.length)
        newTarget = availableSquares[randomIndex]
        setSquareTarget(newTarget)
      } else {
        // All squares have been revealed - level complete!
        setLevelCompleted(true)
      }
    }
  }

  // Check if level is completed (all non-space characters revealed)
  useEffect(() => {
    if (revealedLetters.size > 0) {
      const nonSpaceSquares = squares.filter((square) => !square.isSpace)
      const allRevealed = nonSpaceSquares.every((square) =>
        revealedLetters.has(square.idx)
      )

      if ((allRevealed && !levelCompleted) || score >= 100) {
        setLevelCompleted(true)
        setShowConfetti(true)
        setTimeout(() => setShowConfetti(false), 3000)
      }
    }
  }, [revealedLetters, squares, levelCompleted])

  const { lastKeyPressed } = useKeyboardHandler({
    keyActionMap: keyActions,
    dependencies: [cursor, target, score],
  })

  const resetLevel = () => {
    setRevealedLetters(new Set())
    setScore(0)
    setLevelCompleted(false)
    setShowConfetti(false)
    setcursor(0)
    // Generate a new target - ensure it's not a space
    let newTarget
    do {
      newTarget = Math.floor(Math.random() * squares.length)
    } while (squares[newTarget].isSpace)
    setSquareTarget(newTarget)
  }

  const changeText = () => {
    // Pick a different text from the list
    let newIndex
    do {
      newIndex = Math.floor(Math.random() * sampleTexts.length)
    } while (newIndex === selectedTextIndex && sampleTexts.length > 1)

    setSelectedTextIndex(newIndex)
    resetLevel()
  }

  return (
    <div className="flex items-center justify-center w-full">
      <div className="w-full">
        <div className="text-center mb-4">
          <p className="text-zinc-400">Use w, e, b to navigate horizontally</p>
          <div className="mt-4 flex items-center justify-center gap-4">
            <div className="bg-zinc-800 px-4 py-2 rounded-lg">
              <span className="text-zinc-400 mr-2">Score:</span>
              <span className="text-emerald-400 font-bold">{score}</span>
              {/* max score based on length of text minus spaces */}
              <span className="text-zinc-600 ml-1">
                /{squares.filter((square) => !square.isSpace).length}
              </span>
            </div>
            <button
              onClick={resetLevel}
              className="bg-zinc-800 p-2 rounded-lg hover:bg-zinc-700 transition-colors"
              aria-label="Reset Level"
            >
              <RefreshCw size={18} className="text-zinc-400" />
            </button>
            <button
              onClick={changeText}
              title="New Text"
              className="bg-zinc-700 hover:bg-zinc-600 p-2 rounded-lg text-zinc-200 transition-all duration-200 flex items-center justify-center hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
            >
              <Shuffle size={18} className="text-purple-400" />
            </button>
            {levelCompleted && (
              <div className="bg-emerald-600 px-4 py-2 rounded-lg text-white animate-pulse flex items-center gap-2 shadow-md">
                <Zap size={18} className="text-yellow-300" />
                <span>Level Complete!</span>
              </div>
            )}
          </div>
        </div>
        <div className="relative w-full max-w-4xl bg-zinc-800 p-6 rounded-lg mx-auto overflow-visible">
          {/* Global Confetti Burst over the game area */}
          {showConfetti && <ConfettiBurst />}
          <div
            ref={containerRef}
            className="flex flex-row flex-wrap overflow-visible scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-zinc-900 py-2"
            style={{ scrollBehavior: 'smooth' }}
          >
            {words.map((word, wordIdx) => (
              <div
                key={`word-${wordIdx}`}
                className="flex flex-row whitespace-nowrap mb-1"
              >
                {word.map((square) => {
                  const isPlayer = square.idx === cursor
                  if (square.isSpace) {
                    return (
                      <span
                        key={square.idx}
                        className={`inline-block w-8 h-8 mx-0.5 my-0.5 transition-all duration-150 rounded-md ${
                          isPlayer ? 'bg-emerald-500/25' : ''
                        }`}
                      ></span>
                    )
                  }
                  const isTarget = square.idx === target
                  const isRevealed = revealedLetters.has(square.idx)
                  let base =
                    'inline-flex items-center justify-center mx-0.5 my-0.5 min-w-8 h-8 transition-all duration-150 rounded-md '
                  if (isPlayer)
                    base +=
                      'bg-emerald-500 text-white scale-110 shadow-lg shadow-emerald-500/50 '
                  else if (isTarget)
                    base +=
                      'bg-purple-500 text-white scale-105 shadow-lg shadow-purple-500/60 animate-pulse '
                  else base += 'bg-zinc-700 text-zinc-300 '
                  return (
                    <span
                      key={square.idx}
                      ref={isPlayer ? playerRef : undefined}
                      className={base}
                      style={{ position: 'relative' }}
                    >
                      {isTarget && (
                        <span className="absolute inset-0 rounded-md animate-ping bg-purple-500 opacity-30 z-0"></span>
                      )}

                      {/* Show the character if it's been revealed */}
                      {isRevealed && square.char !== ' ' && (
                        <span className="z-10 text-lg font-medium font-mono">
                          {square.char}
                        </span>
                      )}

                      {/* Explosion effect - moved outside isTarget condition so it can appear even after target changes */}
                      {showExplosion && explosionIdx === square.idx && (
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
          <div className="text-xs text-zinc-500 mt-4">
            NOTE: this should be one long line but we are wrapping words to make
            it easier to spot the next target.
            <br />
            In reality, you'd have to scroll to see the rest of the line.
          </div>
        </div>
        <div className="flex gap-4 text-zinc-400 mt-4 justify-center">
          {['w', 'b', 'e', 'h', 'l'].map((k) => (
            <kbd
              key={k}
              className={`px-3 py-1 bg-zinc-800 rounded-lg transition-all duration-150 ${
                lastKeyPressed === k
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/50 scale-110'
                  : ''
              }`}
            >
              {k}
            </kbd>
          ))}
        </div>
      </div>
    </div>
  )
}

export default WordMovementLevel
