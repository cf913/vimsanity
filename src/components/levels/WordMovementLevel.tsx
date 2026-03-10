import React, { useState, useRef, useEffect } from 'react'
import {
  useKeyboardHandler,
  KeyActionMap,
} from '../../hooks/useKeyboardHandler'
import { useVimLevel } from '../../hooks/useVimLevel'
import {
  processTextForVim,
  moveToNextWordBoundary,
  moveToPrevWordBoundary,
  moveToWordEnd,
} from '../../utils/textUtils'
import ExplosionEffect from './ExplosionEffect'
import { Shuffle } from 'lucide-react'
import { KeysAllowed } from '../common/KeysAllowed'
import { KBD } from '../common/KBD'
import SessionHistory from '../common/SessionHistory'
import { LevelShell, LevelHeader } from '../level-blocks'

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

  const [selectedTextIndex, setSelectedTextIndex] = useState(() =>
    Math.floor(Math.random() * sampleTexts.length),
  )
  const sampleText = sampleTexts[selectedTextIndex]
  const characters = processTextForVim(sampleText)

  const squares = characters.map((char, idx) => ({
    isSpace: char === ' ',
    idx,
    char,
  }))

  const words = squares
    .reduce((acc: Array<Array<(typeof squares)[0]>>, square) => {
      if (square.isSpace) {
        acc.push([square])
        acc.push([])
      } else {
        if (acc.length === 0 || acc[acc.length - 1][0]?.isSpace) {
          acc.push([square])
        } else {
          acc[acc.length - 1].push(square)
        }
      }
      return acc
    }, [])
    .filter((word) => word.length > 0)

  const nonSpaceCount = squares.filter((s) => !s.isSpace).length

  const [cursor, setcursor] = useState<number>(0)
  const [target, setSquareTarget] = useState<number>(5)
  const [showExplosion, setShowExplosion] = useState(false)
  const [explosionIdx, setExplosionIdx] = useState<number | null>(null)
  const [revealedLetters, setRevealedLetters] = useState<Set<number>>(new Set())

  const level = useVimLevel({
    levelId: '2-word-movement',
    maxScore: nonSpaceCount,
    onReset: () => {
      setRevealedLetters(new Set())
      setcursor(0)
      setShowExplosion(false)
      setExplosionIdx(null)
      let newTarget: number
      do {
        newTarget = Math.floor(Math.random() * squares.length)
      } while (squares[newTarget].isSpace)
      setSquareTarget(newTarget)
    },
  })

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

  const keyActions: KeyActionMap = {
    h: () => {
      level.activateTimer()
      if (cursor > 0) {
        setcursor(cursor - 1)
        checkTarget(cursor - 1)
      }
    },
    l: () => {
      level.activateTimer()
      if (cursor < squares.length - 1) {
        setcursor(cursor + 1)
        checkTarget(cursor + 1)
      }
    },
    w: () => {
      level.activateTimer()
      const newPos = moveToNextWordBoundary(characters, cursor)
      setcursor(newPos)
      checkTarget(newPos)
    },
    e: () => {
      level.activateTimer()
      const newPos = moveToWordEnd(characters, cursor)
      setcursor(newPos)
      checkTarget(newPos)
    },
    b: () => {
      level.activateTimer()
      const newPos = moveToPrevWordBoundary(characters, cursor)
      setcursor(newPos)
      checkTarget(newPos)
    },
  }

  const checkTarget = (newPos: number) => {
    if (newPos === target) {
      if (!isMuted) {
        // Sound placeholder
      }
      level.setScore((prev) => prev + 1)
      setShowExplosion(true)
      setExplosionIdx(target)

      const newRevealed = new Set(revealedLetters)
      newRevealed.add(target)
      setRevealedLetters(newRevealed)

      setTimeout(() => {
        setShowExplosion(false)
        setExplosionIdx(null)
      }, 350)

      // Generate new target
      const availableSquares = squares
        .filter(
          (square, idx) =>
            !square.isSpace && idx !== cursor && !revealedLetters.has(idx),
        )
        .map((square) => square.idx)

      if (availableSquares.length > 0) {
        const randomIndex = Math.floor(Math.random() * availableSquares.length)
        setSquareTarget(availableSquares[randomIndex])
      }
    }
  }

  // Check if level is completed (all non-space characters revealed)
  const { levelCompleted, completeLevel } = level
  useEffect(() => {
    if (revealedLetters.size > 0) {
      const nonSpaceSquares = squares.filter((square) => !square.isSpace)
      const allRevealed = nonSpaceSquares.every((square) =>
        revealedLetters.has(square.idx),
      )

      if (allRevealed && !levelCompleted) {
        completeLevel()
      }
    }
  }, [revealedLetters, squares, levelCompleted, completeLevel])

  const { lastKeyPressed } = useKeyboardHandler({
    keyActionMap: keyActions,
    dependencies: [cursor, target, level.score],
    disabled: level.levelCompleted,
  })

  const changeText = () => {
    let newIndex: number
    do {
      newIndex = Math.floor(Math.random() * sampleTexts.length)
    } while (newIndex === selectedTextIndex && sampleTexts.length > 1)

    setSelectedTextIndex(newIndex)
    level.resetLevel()
  }

  return (
    <LevelShell
      level={level}
      className="flex items-center justify-center w-full"
    >
      <div className="w-full">
        <div className="text-center mb-4">
          <p className="text-text-muted">Use w, e, b to navigate horizontally</p>
          {level.levelCompleted ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] w-full animate-fade-in">
              <SessionHistory levelId={level.levelId} />
              <p className="mt-6 text-text-muted text-sm">
                Press <KBD>ESC</KBD> to restart
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="mt-4 flex items-center justify-center gap-4">
                <LevelHeader
                  title=""
                  score={level.score}
                  maxScore={level.maxScore}
                  onReset={level.resetLevel}
                  extra={
                    <button
                      onClick={changeText}
                      title="New Text"
                      className="bg-bg-tertiary hover:bg-bg-hover p-2 rounded-lg text-text-primary transition-all duration-200 flex items-center justify-center hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
                    >
                      <Shuffle size={18} className="text-purple-400" />
                    </button>
                  }
                />
              </div>
              <div className="relative w-full max-w-4xl bg-bg-secondary p-6 rounded-lg mx-auto overflow-visible">
                <div
                  ref={containerRef}
                  className="flex flex-row flex-wrap overflow-visible scrollbar-thin scrollbar-thumb-border-primary scrollbar-track-bg-primary py-2"
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
                        const isTarget2 = square.idx === target
                        const isRevealed = revealedLetters.has(square.idx)
                        let base =
                          'inline-flex items-center justify-center mx-0.5 my-0.5 min-w-8 h-8 transition-all duration-150 rounded-md '
                        if (isPlayer)
                          base +=
                            'bg-emerald-500 text-white scale-110 shadow-lg shadow-emerald-500/50 '
                        else if (isTarget2)
                          base +=
                            'bg-purple-500 text-white scale-105 shadow-lg shadow-purple-500/60 animate-pulse '
                        else base += 'bg-bg-tertiary text-text-secondary '
                        return (
                          <span
                            key={square.idx}
                            ref={isPlayer ? playerRef : undefined}
                            className={base}
                            style={{ position: 'relative' }}
                          >
                            {isTarget2 && (
                              <span className="absolute inset-0 rounded-md animate-ping bg-purple-500 opacity-30 z-0"></span>
                            )}

                            {isRevealed && square.char !== ' ' && (
                              <span className="z-10 text-lg font-medium font-mono">
                                {square.char}
                              </span>
                            )}

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
                <div className="text-xs text-text-subtle mt-4">
                  NOTE: this should be one long line but we are wrapping words
                  to make it easier to spot the next target.
                  <br />
                  In reality, you'd have to scroll to see the rest of the line.
                </div>
              </div>
              <KeysAllowed
                keys={['w', 'b', 'e', 'h', 'l']}
                lastKeyPressed={lastKeyPressed}
              />
            </div>
          )}
        </div>
      </div>
    </LevelShell>
  )
}

export default WordMovementLevel
