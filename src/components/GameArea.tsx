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

  const [charPosition, setCharPosition] = useState<number>(0);
  const [charTarget, setCharTarget] = useState<number>(5);

  const sampleText =
    "The quick brown fox jumps over the lazy dog. Vim is a highly efficient text editor that uses keyboard shortcuts to speed up editing."
  // Process text to handle punctuation as separate words (like in Vim)
  const processTextForVim = (text: string) => {
    // Just split the text into characters - we'll handle word boundaries in the navigation functions
    return text.split('');
  };
  const characters = processTextForVim(sampleText)

  // For word-based navigation (w, b, e)
  const isWordBoundary = (index: number) => {
    if (index <= 0 || index >= characters.length) return false;
    const current = characters[index];
    const prev = characters[index - 1];
    
    // Word boundary conditions
    const isPrevSpace = /\s/.test(prev);
    const isPrevPunctuation = /[.,;:!?()[\]{}'"<>\/\\|+=\-*&^%$#@!~`]/.test(prev) && prev !== '_';
    const isCurrentPunctuation = /[.,;:!?()[\]{}'"<>\/\\|+=\-*&^%$#@!~`]/.test(current) && current !== '_';
    
    // Start of a word is:
    // 1. After a space
    // 2. A punctuation after a non-punctuation
    // 3. A non-punctuation after a punctuation
    return (isPrevSpace && !isCurrentPunctuation) || 
           (isCurrentPunctuation && !isPrevPunctuation) || 
           (!isCurrentPunctuation && isPrevPunctuation);
  };

  const isWordEnd = (index: number) => {
    if (index >= characters.length - 1 || index < 0) return false;
    const current = characters[index];
    const next = characters[index + 1];
    
    // Word end conditions
    const isNextSpace = /\s/.test(next);
    const isCurrentPunctuation = /[.,;:!?()[\]{}'"<>\/\\|+=\-*&^%$#@!~`]/.test(current) && current !== '_';
    const isNextPunctuation = /[.,;:!?()[\]{}'"<>\/\\|+=\-*&^%$#@!~`]/.test(next) && next !== '_';
    
    // End of a word is:
    // 1. Before a space
    // 2. A punctuation before a non-punctuation
    // 3. A non-punctuation before a punctuation
    return (isNextSpace && !isCurrentPunctuation) || 
           (!isNextPunctuation && isCurrentPunctuation) || 
           (isNextPunctuation && !isCurrentPunctuation);
  };

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
        let newPos = charPosition;

        switch (e.key) {
          case "h": // Move one character left
            if (newPos > 0) {
              newPos--;
            }
            break;
          case "l": // Move one character right
            if (newPos < characters.length - 1) {
              newPos++;
            }
            break;
          case "w": // Move to start of next word
            for (let i = newPos + 1; i < characters.length; i++) {
              if (isWordBoundary(i)) {
                newPos = i;
                break;
              }
            }
            break;
          case "e": // Move to end of current/next word
            // First try to find end of current word
            let foundEnd = false;
            for (let i = newPos + 1; i < characters.length - 1; i++) {
              if (isWordEnd(i)) {
                newPos = i;
                foundEnd = true;
                break;
              }
            }
            
            // If couldn't find word end ahead, stay at current position
            if (!foundEnd && newPos < characters.length - 1) {
              for (let i = newPos + 1; i < characters.length - 1; i++) {
                if (isWordEnd(i)) {
                  newPos = i;
                  break;
                }
              }
            }
            break;
          case "b": // Move to start of current/previous word
            // First try to go to previous word boundary
            let foundPrev = false;
            for (let i = newPos - 1; i > 0; i--) {
              if (isWordBoundary(i)) {
                newPos = i;
                foundPrev = true;
                break;
              }
            }
            
            // If at beginning of text or couldn't find previous word, stay at position 0
            if (!foundPrev && newPos > 0) {
              newPos = 0;
            }
            break;
        }

        setCharPosition(newPos);

        if (newPos === charTarget) {
          if (!isMuted) {
            // successSound.currentTime = 0
            // successSound.play()
          }
          setScore(score + 1);
          
          // Set a new random target that isn't a space
          let newTarget;
          do {
            newTarget = Math.floor(Math.random() * characters.length);
          } while (characters[newTarget] === ' ');
          
          setCharTarget(newTarget);
        }
      }
    },
    [position, target, score, isMuted, level, charPosition, charTarget, characters]
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
            {characters.map((char, idx) => {
              const isPlayerPosition = idx === charPosition;
              const isTargetPosition = idx === charTarget;
              
              return (
                <span
                  key={idx}
                  className={`${
                    isPlayerPosition
                      ? "bg-emerald-500 text-white rounded"
                      : isTargetPosition
                      ? "bg-purple-500 text-white rounded"
                      : ""
                  }`}
                >
                  {char === ' ' ? '\u00A0' : char}
                </span>
              );
            })}
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
