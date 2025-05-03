import React, { useState, useRef, useEffect } from "react"
import {
  useKeyboardHandler,
  KeyActionMap,
} from "../../hooks/useKeyboardHandler"
import {
  processTextForVim,
  moveToNextWordBoundary,
  moveToPrevWordBoundary,
  moveToWordEnd,
} from "../../utils/textUtils"
import ExplosionEffect from "./ExplosionEffect"
import ConfettiBurst from "./ConfettiBurst"

interface WordMovementLevelProps {
  isMuted: boolean
}

const WordMovementLevel: React.FC<WordMovementLevelProps> = ({ isMuted }) => {
  const sampleText = "The quick brown fox jumps over the lazy dog"
  const characters = processTextForVim(sampleText)

  // We'll use the same number of squares as characters, including spaces for spacing
  const squares = characters.map((char, idx) => ({
    isSpace: char === " ",
    idx,
  }))

  const [cursor, setcursor] = useState<number>(0)
  const [target, setSquareTarget] = useState<number>(5)
  const [score, setScore] = useState(0)
  const [showConfetti, setShowConfetti] = useState(false)
  const [showExplosion, setShowExplosion] = useState(false)
  const [explosionIdx, setExplosionIdx] = useState<number | null>(null)

  // Ref for scrolling
  const containerRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (playerRef.current && containerRef.current) {
      playerRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
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

      // Set a timeout to hide the explosion
      setTimeout(() => {
        setShowExplosion(false)
        setExplosionIdx(null)
      }, 350)

      // skipping confetti for now
      // setTimeout(() => setShowConfetti(false), 1500);

      // Generate new target
      let newTarget
      do {
        newTarget = Math.floor(Math.random() * squares.length)
      } while (newTarget === cursor || squares[newTarget].isSpace)
      setSquareTarget(newTarget)
    }
  }

  const { lastKeyPressed } = useKeyboardHandler({
    keyActionMap: keyActions,
    dependencies: [cursor, target, score],
  })

  return (
    <div className="flex items-center justify-center w-full">
      <div className="w-full">
        <div className="text-center mb-4">
          <p className="text-zinc-400">
            Navigate the abstract grid using vim keys!
          </p>
          <div className="mt-4 flex items-center justify-center gap-4">
            <div className="bg-zinc-800 px-4 py-2 rounded-lg">
              Score: {score}
            </div>
          </div>
        </div>
        <div className="relative w-full max-w-4xl bg-zinc-800 p-6 rounded-lg mx-auto overflow-visible">
          {/* Global Confetti Burst over the game area */}
          {showConfetti && <ConfettiBurst />}
          <div
            ref={containerRef}
            className="flex flex-row overflow-visible scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-zinc-900 py-2"
            style={{ scrollBehavior: "smooth" }}
          >
            {squares.map((square, idx) => {
              if (square.isSpace) {
                return <span key={idx} className="inline-block w-4 h-8"></span>
              }
              const isPlayer = idx === cursor
              const isTarget = idx === target
              let base =
                "inline-flex items-center justify-center mx-0.5 my-0.5 w-10 h-10 transition-all duration-150 rounded-md "
              if (isPlayer)
                base +=
                  "bg-emerald-500 text-white scale-110 shadow-lg shadow-emerald-500/50 "
              else if (isTarget)
                base +=
                  "bg-purple-500 text-white scale-105 shadow-lg shadow-purple-500/60 animate-pulse "
              else base += "bg-zinc-700 text-zinc-300 "
              return (
                <span
                  key={idx}
                  ref={isPlayer ? playerRef : undefined}
                  className={base}
                  style={{ position: "relative" }}
                >
                  {isTarget && (
                    <span className="absolute inset-0 rounded-md animate-ping bg-purple-500 opacity-30 z-0"></span>
                  )}

                  {/* Explosion effect - moved outside isTarget condition so it can appear even after target changes */}
                  {showExplosion && explosionIdx === idx && (
                    <div className="absolute inset-0 z-20">
                      <ExplosionEffect />
                    </div>
                  )}
                </span>
              )
            })}
          </div>
        </div>
        <div className="flex gap-4 text-zinc-400 mt-4 justify-center">
          {["w", "b", "e", "h", "l"].map((k) => (
            <kbd
              key={k}
              className={`px-3 py-1 bg-zinc-800 rounded-lg transition-all duration-150 ${
                lastKeyPressed === k
                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/50 scale-110"
                  : ""
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
