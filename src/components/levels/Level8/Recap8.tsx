import { RefreshCw } from 'lucide-react'
import { useState } from 'react'
import { VIM_MODES, VimMode } from '../../../utils/constants'
import ModeIndicator from '../../common/ModeIndicator'
import Scoreboard from '../../common/Scoreboard'
import { TextEditor, TextEditorProps } from './TextEditor'
import { KeysAllowed } from '../../common/KeysAllowed'

export default function Recap8() {
  const [score, setScore] = useState(0)
  const [mode, setMode] = useState<VimMode>(VIM_MODES.NORMAL)
  const [lastKeyPressed, setLastKeyPressed] = useState<string | null>(null)
  const isInsertMode = mode === VIM_MODES.INSERT

  const MAX_SCORE = 1

  const resetLevel = () => {
    // TODO: implement this
    alert('reset level')
  }

  const ACTIVE_KEYS = [
    'i',
    'a',
    'u',
    'h',
    'j',
    'k',
    'l',
    'ctrl+r',
    'Escape',
    'o',
  ]

  const textEditorProps: TextEditorProps = {
    initialText: `const insertModeActions: KeyActionMap = {
  Escape: keyActionMap['Escape'],
  Backspace: keyActionMap['Backspace'],
  Enter: keyActionMap['Enter'],
}`,
    mode,
    setMode,
    setLastKeyPressed,
    activeKeys: ACTIVE_KEYS,
    editor: {
      showLineNumbers: false,
    },
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {/* TITLE AND INSTRUCTIONS */}
      <div className="text-center">
        <p className="text-zinc-400">
          Use all the motions you've learnt so far to match the expected text.
        </p>
      </div>

      {/* CONTROLS */}
      <div className="flex items-center gap-4 mb-2">
        {/* Score display */}
        <Scoreboard score={score} maxScore={MAX_SCORE} />

        <button
          onClick={resetLevel}
          className="bg-zinc-800 p-2 rounded-lg hover:bg-zinc-700 transition-colors"
          aria-label="Reset Level"
        >
          <RefreshCw size={18} className="text-zinc-400" />
        </button>
        {/* Mode indicator */}
        <ModeIndicator isInsertMode={isInsertMode} />
      </div>
      {/* GAME AREA */}
      <TextEditor {...textEditorProps} />
      {/* Key indicators */}
      <KeysAllowed keys={ACTIVE_KEYS} lastKeyPressed={lastKeyPressed} />
    </div>
  )
}
