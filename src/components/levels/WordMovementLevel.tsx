import React, { useState, useRef, useEffect } from "react"
import {
  useKeyboardHandler,
  KeyActionMap,
} from "../../hooks/useKeyboardHandler"
import { processTextForVim } from "../../utils/textUtils"

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

  const [squarePosition, setSquarePosition] = useState<number>(0)
  const [squareTarget, setSquareTarget] = useState<number>(5)
  const [score, setScore] = useState(0)

  // Ref for scrolling
  const containerRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (playerRef.current && containerRef.current) {
      playerRef.current.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" })
    }
  }, [squarePosition])

  // Key actions (move left/right, and word boundaries, but now just move between squares)
  const keyActions: KeyActionMap = {
    h: () => {
      if (squarePosition > 0) {
        setSquarePosition(squarePosition - 1)
        checkTarget(squarePosition - 1)
      }
    },
    l: () => {
      if (squarePosition < squares.length - 1) {
        setSquarePosition(squarePosition + 1)
        checkTarget(squarePosition + 1)
      }
    },
    w: () => {
      // Move to next non-space square
      let next = squarePosition + 1
      while (next < squares.length && squares[next].isSpace) next++
      if (next < squares.length) {
        setSquarePosition(next)
        checkTarget(next)
      }
    },
    e: () => {
      // Move to end of current sequence of non-space squares
      let end = squarePosition
      while (end + 1 < squares.length && !squares[end + 1].isSpace) end++
      setSquarePosition(end)
      checkTarget(end)
    },
    b: () => {
      // Move to previous non-space square
      let prev = squarePosition - 1
      while (prev >= 0 && squares[prev].isSpace) prev--
      if (prev >= 0) {
        setSquarePosition(prev)
        checkTarget(prev)
      }
    },
  }

  const checkTarget = (newPos: number) => {
    if (newPos === squareTarget) {
      if (!isMuted) {
        // Add sound here if needed
      }
      setScore(score + 1)
      // Set a new random target that's not a space or current position
      let newTarget
      do {
        newTarget = Math.floor(Math.random() * squares.length)
      } while (newTarget === squarePosition || squares[newTarget].isSpace)
      setSquareTarget(newTarget)
    }
  }

  const { lastKeyPressed } = useKeyboardHandler({
    keyActionMap: keyActions,
    dependencies: [squarePosition, squareTarget, score],
  })

  return (
    <div className="flex items-center justify-center w-full">
      <div className="w-full max-w-3xl">
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
        <div className="relative w-full max-w-3xl bg-zinc-800 p-6 rounded-lg mx-auto">
          <div
            ref={containerRef}
            className="flex flex-row flex-nowrap overflow-x-auto scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-zinc-900 whitespace-nowrap py-2"
            style={{ scrollBehavior: 'smooth' }}
          >
            {squares.map((square, idx) => {
              if (square.isSpace) {
                return (
                  <span
                    key={idx}
                    className="inline-block w-4 h-8"
                  ></span>
                )
              }
              let base =
                "inline-flex items-center justify-center mx-0.5 my-0.5 w-8 h-8 transition-all duration-150 "
              if (idx === squarePosition)
                base +=
                  "bg-emerald-500 text-white scale-110 shadow-lg shadow-emerald-500/50 "
              else if (idx === squareTarget)
                base += "bg-purple-500 text-white scale-105 "
              else base += "bg-zinc-700 text-zinc-300 "
              return (
                <span
                  key={idx}
                  ref={idx === squarePosition ? playerRef : undefined}
                  className={base + "rounded-md"}
                ></span>
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
