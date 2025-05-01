import React, { useState } from 'react';
import { useKeyboardHandler, KeyActionMap } from '../../hooks/useKeyboardHandler';
import { 
  moveToNextWordBoundary, 
  moveToPrevWordBoundary, 
  moveToWordEnd, 
  processTextForVim 
} from '../../utils/textUtils';

interface WordMovementLevelProps {
  isMuted: boolean;
}

const WordMovementLevel: React.FC<WordMovementLevelProps> = ({ isMuted }) => {
  const sampleText = "The quick brown fox jumps over the lazy dog. Vim is a highly efficient text editor that uses keyboard shortcuts to speed up editing.";
  const characters = processTextForVim(sampleText);
  
  const [charPosition, setCharPosition] = useState<number>(0);
  const [charTarget, setCharTarget] = useState<number>(5);
  const [score, setScore] = useState(0);

  // Define key actions for the word movement level
  const keyActions: KeyActionMap = {
    "h": () => {
      if (charPosition > 0) {
        setCharPosition(charPosition - 1);
        checkTarget(charPosition - 1);
      }
    },
    "l": () => {
      if (charPosition < characters.length - 1) {
        setCharPosition(charPosition + 1);
        checkTarget(charPosition + 1);
      }
    },
    "w": () => {
      const newPos = moveToNextWordBoundary(characters, charPosition);
      setCharPosition(newPos);
      checkTarget(newPos);
    },
    "e": () => {
      const newPos = moveToWordEnd(characters, charPosition);
      setCharPosition(newPos);
      checkTarget(newPos);
    },
    "b": () => {
      const newPos = moveToPrevWordBoundary(characters, charPosition);
      setCharPosition(newPos);
      checkTarget(newPos);
    }
  };

  // Check if we've reached the target
  const checkTarget = (newPos: number) => {
    if (newPos === charTarget) {
      // Play success sound
      if (!isMuted) {
        // You can add sound here if needed
      }
      
      // Increment score
      setScore(score + 1);
      
      // Set a new random target that isn't a space
      let newTarget;
      do {
        newTarget = Math.floor(Math.random() * characters.length);
      } while (characters[newTarget] === ' ');
      
      setCharTarget(newTarget);
    }
  };

  // Use our custom keyboard handler
  const { lastKeyPressed } = useKeyboardHandler({
    keyActionMap: keyActions,
    dependencies: [charPosition, charTarget, score]
  });

  return (
    <div className="w-full">
      <div className="text-center mb-4">
        <p className="text-zinc-400">Use w, b, e to navigate between words</p>
        <div className="mt-4 flex items-center justify-center gap-4">
          <div className="bg-zinc-800 px-4 py-2 rounded-lg">Score: {score}</div>
        </div>
      </div>

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

      <div className="flex gap-4 text-zinc-400 mt-4 justify-center">
        <kbd className={`px-3 py-1 bg-zinc-800 rounded-lg transition-all duration-150 ${lastKeyPressed === "w" ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/50 scale-110" : ""}`}>w</kbd>
        <kbd className={`px-3 py-1 bg-zinc-800 rounded-lg transition-all duration-150 ${lastKeyPressed === "b" ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/50 scale-110" : ""}`}>b</kbd>
        <kbd className={`px-3 py-1 bg-zinc-800 rounded-lg transition-all duration-150 ${lastKeyPressed === "e" ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/50 scale-110" : ""}`}>e</kbd>
        <kbd className={`px-3 py-1 bg-zinc-800 rounded-lg transition-all duration-150 ${lastKeyPressed === "h" ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/50 scale-110" : ""}`}>h</kbd>
        <kbd className={`px-3 py-1 bg-zinc-800 rounded-lg transition-all duration-150 ${lastKeyPressed === "l" ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/50 scale-110" : ""}`}>l</kbd>
      </div>
    </div>
  );
};

export default WordMovementLevel;
