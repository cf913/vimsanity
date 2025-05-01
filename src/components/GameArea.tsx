import React, { useState, useEffect, useCallback } from "react"
import { Trophy } from "lucide-react"

interface GameAreaProps {
  level: number
  isMuted: boolean
}

interface Position {
  x: number
  y: number
}

interface WordPosition {
  wordIndex: number
  charIndex: number
}

// const successSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2017/2017-preview.mp3')

const GameArea: React.FC<GameAreaProps> = ({ level, isMuted }) => {
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 })
  const [target, setTarget] = useState<Position>({ x: 5, y: 5 })
  const [score, setScore] = useState(0)
  const gridSize = 10

  const [wordPosition, setWordPosition] = useState<WordPosition>({
    wordIndex: 0,
    charIndex: 0,
  })
  const [wordTarget, setWordTarget] = useState<WordPosition>({
    wordIndex: 2,
    charIndex: 0,
  })
  const sampleText =
    "The quick brown fox jumps over the lazy dog. Vim is a highly efficient text editor that uses keyboard shortcuts to speed up editing."
  const words = sampleText.split(" ")

  const [lastKeyPressed, setLastKeyPressed] = useState<string | null>(null)

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      e.preventDefault()
      setLastKeyPressed(e.key)

      // Reset the animation after a short delay
      setTimeout(() => {
        setLastKeyPressed(null)
      }, 150)

      if (level === 1) {
        let newPos = { ...position }

        switch (e.key) {
          case "h":
            newPos.x = Math.max(0, position.x - 1)
            break
          case "l":
            newPos.x = Math.min(gridSize - 1, position.x + 1)
            break
          case "j":
            newPos.y = Math.min(gridSize - 1, position.y + 1)
            break
          case "k":
            newPos.y = Math.max(0, position.y - 1)
            break
        }

        setPosition(newPos)

        if (newPos.x === target.x && newPos.y === target.y) {
          if (!isMuted) {
            // successSound.currentTime = 0
            // successSound.play()
          }
          setScore(score + 1)
          setTarget({
            x: Math.floor(Math.random() * gridSize),
            y: Math.floor(Math.random() * gridSize),
          })
        }
      } else if (level === 2) {
        let newWordPos = { ...wordPosition }

        switch (e.key) {
          case "w": // Move to start of next word
            if (wordPosition.wordIndex < words.length - 1) {
              newWordPos = {
                wordIndex: wordPosition.wordIndex + 1,
                charIndex: 0,
              }
            }
            break
          case "e": // Move to end of current word or next word
            if (
              wordPosition.charIndex === words[wordPosition.wordIndex].length - 1 &&
              wordPosition.wordIndex < words.length - 1
            ) {
              // If already at the end of current word, move to end of next word
              newWordPos = {
                wordIndex: wordPosition.wordIndex + 1,
                charIndex: words[wordPosition.wordIndex + 1].length - 1,
              }
            } else if (wordPosition.charIndex < words[wordPosition.wordIndex].length - 1) {
              // Move to end of current word
              newWordPos = {
                wordIndex: wordPosition.wordIndex,
                charIndex: words[wordPosition.wordIndex].length - 1,
              }
            }
            break
          case "b": // Move to start of current/previous word
            if (wordPosition.charIndex > 0) {
              newWordPos = { wordIndex: wordPosition.wordIndex, charIndex: 0 }
            } else if (wordPosition.wordIndex > 0) {
              newWordPos = {
                wordIndex: wordPosition.wordIndex - 1,
                charIndex: 0,
              }
            }
            break
          case "l": // Move one character right (additional movement for fine control)
            if (
              wordPosition.charIndex <
              words[wordPosition.wordIndex].length - 1
            ) {
              newWordPos = {
                wordIndex: wordPosition.wordIndex,
                charIndex: wordPosition.charIndex + 1,
              }
            } else if (wordPosition.wordIndex < words.length - 1) {
              // Move to the start of the next word if at the end of current word
              newWordPos = {
                wordIndex: wordPosition.wordIndex + 1,
                charIndex: 0,
              }
            }
            break
          case "h": // Move one character left (additional movement for fine control)
            if (wordPosition.charIndex > 0) {
              newWordPos = {
                wordIndex: wordPosition.wordIndex,
                charIndex: wordPosition.charIndex - 1,
              }
            } else if (wordPosition.wordIndex > 0) {
              // Move to the end of the previous word if at the start of current word
              newWordPos = {
                wordIndex: wordPosition.wordIndex - 1,
                charIndex: words[wordPosition.wordIndex - 1].length - 1,
              }
            }
            break
        }

        setWordPosition(newWordPos)

        if (
          newWordPos.wordIndex === wordTarget.wordIndex &&
          newWordPos.charIndex === wordTarget.charIndex
        ) {
          if (!isMuted) {
            // successSound.currentTime = 0
            // successSound.play()
          }
          setScore(score + 1)

          // Set a new random target
          const randomWordIndex = Math.floor(Math.random() * words.length)
          const randomWord = words[randomWordIndex]
          const randomCharIndex = Math.floor(Math.random() * randomWord.length)

          // Make sure the target is at the beginning or end of a word to be reachable with w, b, e commands
          const targetPosition = Math.random() < 0.5 ? 0 : randomWord.length - 1

          setWordTarget({
            wordIndex: randomWordIndex,
            charIndex: targetPosition,
          })
        }
      }
    },
    [position, target, score, isMuted, level, wordPosition, wordTarget, words]
  )

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handleKeyDown])

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">Level {level}</h2>
        {level === 1 ? (
          <p className="text-zinc-400">
            Use h, j, k, l to move the cursor to the target
          </p>
        ) : (
          <p className="text-zinc-400">Use w, b, e to navigate between words</p>
        )}
        <div className="mt-4 flex items-center justify-center gap-4">
          <div className="bg-zinc-800 px-4 py-2 rounded-lg">Score: {score}</div>
        </div>
      </div>

      {level === 1 ? (
        <div className="relative">
          <div
            className="grid gap-1"
            style={{
              gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
            }}
          >
            {Array.from({ length: gridSize * gridSize }).map((_, index) => {
              const x = index % gridSize
              const y = Math.floor(index / gridSize)
              const isPlayer = x === position.x && y === position.y
              const isTarget = x === target.x && y === target.y

              return (
                <div
                  key={index}
                  className={`w-12 h-12 rounded-md transition-all duration-150 flex items-center justify-center ${
                    isPlayer
                      ? "bg-emerald-500 shadow-lg shadow-emerald-500/50 scale-110"
                      : isTarget
                      ? "bg-purple-500 shadow-lg shadow-purple-500/50"
                      : "bg-zinc-800"
                  }`}
                />
              )
            })}
          </div>
        </div>
      ) : (
        <div className="relative w-full max-w-2xl bg-zinc-800 p-6 rounded-lg">
          <div className="text-lg leading-relaxed font-mono whitespace-pre-wrap break-words overflow-hidden">
            {words.map((word, wordIdx) => (
              <span key={wordIdx} className="relative mr-2 inline-block">
                {word.split("").map((char, charIdx) => {
                  const isPlayerPosition =
                    wordIdx === wordPosition.wordIndex &&
                    charIdx === wordPosition.charIndex
                  const isTargetPosition =
                    wordIdx === wordTarget.wordIndex &&
                    charIdx === wordTarget.charIndex

                  return (
                    <span
                      key={charIdx}
                      className={`${
                        isPlayerPosition
                          ? "bg-emerald-500 text-white rounded"
                          : isTargetPosition
                          ? "bg-purple-500 text-white rounded"
                          : ""
                      }`}
                    >
                      {char}
                    </span>
                  )
                })}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-4 text-zinc-400">
        {level === 1 ? (
          <>
            <kbd
              className={`px-3 py-1 bg-zinc-800 rounded-lg transition-all duration-150 ${
                lastKeyPressed === "h"
                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/50 scale-110"
                  : ""
              }`}
            >
              h
            </kbd>
            <kbd
              className={`px-3 py-1 bg-zinc-800 rounded-lg transition-all duration-150 ${
                lastKeyPressed === "j"
                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/50 scale-110"
                  : ""
              }`}
            >
              j
            </kbd>
            <kbd
              className={`px-3 py-1 bg-zinc-800 rounded-lg transition-all duration-150 ${
                lastKeyPressed === "k"
                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/50 scale-110"
                  : ""
              }`}
            >
              k
            </kbd>
            <kbd
              className={`px-3 py-1 bg-zinc-800 rounded-lg transition-all duration-150 ${
                lastKeyPressed === "l"
                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/50 scale-110"
                  : ""
              }`}
            >
              l
            </kbd>
          </>
        ) : (
          <>
            <kbd
              className={`px-3 py-1 bg-zinc-800 rounded-lg transition-all duration-150 ${
                lastKeyPressed === "w"
                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/50 scale-110"
                  : ""
              }`}
            >
              w
            </kbd>
            <kbd
              className={`px-3 py-1 bg-zinc-800 rounded-lg transition-all duration-150 ${
                lastKeyPressed === "b"
                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/50 scale-110"
                  : ""
              }`}
            >
              b
            </kbd>
            <kbd
              className={`px-3 py-1 bg-zinc-800 rounded-lg transition-all duration-150 ${
                lastKeyPressed === "e"
                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/50 scale-110"
                  : ""
              }`}
            >
              e
            </kbd>
            <kbd
              className={`px-3 py-1 bg-zinc-800 rounded-lg transition-all duration-150 ${
                lastKeyPressed === "h"
                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/50 scale-110"
                  : ""
              }`}
            >
              h
            </kbd>
            <kbd
              className={`px-3 py-1 bg-zinc-800 rounded-lg transition-all duration-150 ${
                lastKeyPressed === "l"
                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/50 scale-110"
                  : ""
              }`}
            >
              l
            </kbd>
          </>
        )}
      </div>
    </div>
  )
}

export default GameArea
