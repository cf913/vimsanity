import React, { useState } from 'react';
import { useKeyboardHandler, KeyActionMap } from '../../hooks/useKeyboardHandler';
import { 
  findLineEnd, 
  findLineStart, 
  moveToNextLine, 
  moveToNextWordBoundary, 
  moveToPrevLine, 
  moveToPrevWordBoundary, 
  moveToWordEnd 
} from '../../utils/textUtils';

interface PlaygroundLevelProps {
  isMuted: boolean;
}

const PlaygroundLevel: React.FC<PlaygroundLevelProps> = ({ isMuted }) => {
  const [editableText, setEditableText] = useState<string>(
    "This is a Vim playground. Practice your motions here!\n\nYou can use h, j, k, l for movement.\nTry w, e, b for word navigation.\nUse i to enter insert mode, Escape to exit.\nPress x to delete characters."
  );
  const [cursorPosition, setCursorPosition] = useState<number>(0);
  const [mode, setMode] = useState<'normal' | 'insert'>('normal');
  const [lines, setLines] = useState<string[]>(editableText.split('\n'));

  const updateLines = (text: string) => {
    setEditableText(text);
    setLines(text.split('\n'));
  };

  // Define normal mode key actions
  const normalModeActions: KeyActionMap = {
    "h": () => {
      if (cursorPosition > 0) {
        setCursorPosition(cursorPosition - 1);
      }
    },
    "l": () => {
      if (cursorPosition < editableText.length - 1) {
        setCursorPosition(cursorPosition + 1);
      }
    },
    "j": () => {
      setCursorPosition(moveToNextLine(editableText, cursorPosition));
    },
    "k": () => {
      setCursorPosition(moveToPrevLine(editableText, cursorPosition));
    },
    "w": () => {
      setCursorPosition(moveToNextWordBoundary(editableText.split(''), cursorPosition));
    },
    "e": () => {
      setCursorPosition(moveToWordEnd(editableText.split(''), cursorPosition));
    },
    "b": () => {
      setCursorPosition(moveToPrevWordBoundary(editableText.split(''), cursorPosition));
    },
    "0": () => {
      setCursorPosition(findLineStart(editableText, cursorPosition));
    },
    "$": () => {
      setCursorPosition(findLineEnd(editableText, cursorPosition));
    },
    "i": () => {
      setMode('insert');
    },
    "x": () => {
      if (cursorPosition < editableText.length) {
        const newText = editableText.substring(0, cursorPosition) + 
                        editableText.substring(cursorPosition + 1);
        updateLines(newText);
      }
    },
    "Escape": () => {
      setMode('normal');
    },
  };

  // Define insert mode key actions
  const insertModeActions: KeyActionMap = {
    "Escape": () => {
      setMode('normal');
    },
    "Backspace": () => {
      if (cursorPosition > 0) {
        const newText = editableText.substring(0, cursorPosition - 1) + 
                        editableText.substring(cursorPosition);
        updateLines(newText);
        setCursorPosition(cursorPosition - 1);
      }
    },
    "Enter": () => {
      const newText = editableText.substring(0, cursorPosition) + 
                      '\n' + 
                      editableText.substring(cursorPosition);
      updateLines(newText);
      setCursorPosition(cursorPosition + 1);
    },
  };

  // Special handler for character input in insert mode
  const handleCharInput = (key: string) => {
    if (mode === 'insert' && key.length === 1 && 
        !Object.keys(insertModeActions).includes(key)) {
      const newText = editableText.substring(0, cursorPosition) + 
                      key + 
                      editableText.substring(cursorPosition);
      updateLines(newText);
      setCursorPosition(cursorPosition + 1);
    }
  };

  // Use our custom keyboard handler
  const { lastKeyPressed } = useKeyboardHandler({
    keyActionMap: mode === 'normal' ? normalModeActions : insertModeActions,
    dependencies: [cursorPosition, editableText, mode],
    onAnyKey: handleCharInput
  });

  return (
    <div className="w-full">
      <div className="text-center mb-4">
        <p className="text-zinc-400">
          Vim Playground - {mode === 'normal' ? 'Normal Mode' : 'Insert Mode'}
        </p>
      </div>

      <div className="relative w-full max-w-2xl bg-zinc-800 p-6 rounded-lg">
        <div className="text-lg leading-relaxed font-mono whitespace-pre-wrap break-words overflow-hidden">
          {lines.map((line, lineIdx) => (
            <div key={lineIdx} className="min-h-[1.5em]">
              {line.split('').map((char, charIdx) => {
                const absoluteIdx = editableText.indexOf(line) + charIdx;
                const isCursorPosition = absoluteIdx === cursorPosition;
                
                return (
                  <span
                    key={charIdx}
                    className={`${
                      isCursorPosition
                        ? mode === 'normal' 
                          ? "bg-emerald-500 text-white rounded" 
                          : "bg-amber-500 text-white rounded"
                        : ""
                    }`}
                  >
                    {char === ' ' ? '\u00A0' : char}
                  </span>
                );
              })}
              {line.length === 0 && cursorPosition === editableText.indexOf('\n', editableText.indexOf(line)) && (
                <span className={mode === 'normal' ? "bg-emerald-500 text-white rounded" : "bg-amber-500 text-white rounded"}>
                  {'\u00A0'}
                </span>
              )}
            </div>
          ))}
        </div>
        <div className="mt-4 text-sm text-zinc-400">
          <p>Normal mode: h,j,k,l (movement), w,e,b (word nav), 0,$ (line nav), i (insert), x (delete)</p>
          <p>Insert mode: Type to insert text, Escape to exit</p>
        </div>
      </div>

      <div className="flex gap-4 text-zinc-400 mt-4 justify-center">
        {mode === 'normal' ? (
          <>
            <kbd className={`px-3 py-1 bg-zinc-800 rounded-lg transition-all duration-150 ${lastKeyPressed === "h" ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/50 scale-110" : ""}`}>h</kbd>
            <kbd className={`px-3 py-1 bg-zinc-800 rounded-lg transition-all duration-150 ${lastKeyPressed === "j" ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/50 scale-110" : ""}`}>j</kbd>
            <kbd className={`px-3 py-1 bg-zinc-800 rounded-lg transition-all duration-150 ${lastKeyPressed === "k" ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/50 scale-110" : ""}`}>k</kbd>
            <kbd className={`px-3 py-1 bg-zinc-800 rounded-lg transition-all duration-150 ${lastKeyPressed === "l" ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/50 scale-110" : ""}`}>l</kbd>
            <kbd className={`px-3 py-1 bg-zinc-800 rounded-lg transition-all duration-150 ${lastKeyPressed === "i" ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/50 scale-110" : ""}`}>i</kbd>
            <kbd className={`px-3 py-1 bg-zinc-800 rounded-lg transition-all duration-150 ${lastKeyPressed === "x" ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/50 scale-110" : ""}`}>x</kbd>
          </>
        ) : (
          <kbd className={`px-3 py-1 bg-zinc-800 rounded-lg transition-all duration-150 ${lastKeyPressed === "Escape" ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/50 scale-110" : ""}`}>Esc</kbd>
        )}
      </div>
    </div>
  );
};

export default PlaygroundLevel;
