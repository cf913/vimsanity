import { RefreshCw } from 'lucide-react'
import { useState } from 'react'
import { VIM_MODES, VimMode } from '../../../utils/constants'
import ModeIndicator from '../../common/ModeIndicator'
import Scoreboard from '../../common/Scoreboard'
import { TextEditorWithHistory } from './TextEditorWithHistory'
import { KeysAllowed } from '../../common/KeysAllowed'
import LevelTimer from '../../common/LevelTimer'
import ConfettiBurst from '../ConfettiBurst'

interface Challenge {
  id: string
  title: string
  description: string
  initialText: string
  expectedText: string
  instructions: string[]
  completedMessage: string
}

const challenges: Challenge[] = [
  {
    id: 'basic-undo',
    title: 'Basic Undo',
    description: 'Learn to undo changes with "u"',
    initialText: 'Hello World',
    expectedText: 'Hello World',
    instructions: [
      '1. Delete the "W" with x',
      '2. Press u to undo the deletion',
      '3. The text should be restored'
    ],
    completedMessage: 'Great! You undid the change successfully!'
  },
  {
    id: 'multiple-undo',
    title: 'Multiple Undos',
    description: 'Undo multiple changes in sequence',
    initialText: 'Vim Editor',
    expectedText: 'Vim Editor',
    instructions: [
      '1. Delete "E" with x, then delete "d" with x',
      '2. Press u twice to undo both deletions',
      '3. All changes should be undone'
    ],
    completedMessage: 'Excellent! You mastered multiple undos!'
  },
  {
    id: 'undo-redo-combo',
    title: 'Undo and Redo',
    description: 'Learn to redo with Ctrl+r',
    initialText: 'Practice Text',
    expectedText: 'Practice',
    instructions: [
      '1. Delete " Text" (space and Text)',
      '2. Press u to undo',
      '3. Press Ctrl+r to redo the deletion',
      '4. Final text should be "Practice"'
    ],
    completedMessage: 'Perfect! You learned undo and redo!'
  },
  {
    id: 'insert-mode-history',
    title: 'Insert Mode History',
    description: 'Undo works with insert mode changes too',
    initialText: 'Hello',
    expectedText: 'Hello',
    instructions: [
      '1. Press i to enter insert mode',
      '2. Type " World" and press Escape',
      '3. Press u to undo the insertion',
      '4. Text should return to "Hello"'
    ],
    completedMessage: 'Amazing! Insert mode changes can be undone too!'
  },
  {
    id: 'complex-scenario',
    title: 'Complex Scenario',
    description: 'Mix of insertions, deletions, and undo/redo',
    initialText: 'Code',
    expectedText: 'Coding',
    instructions: [
      '1. Press A to append, type "ing", press Escape',
      '2. Delete the "g" with x',
      '3. Press u to undo the deletion',
      '4. Final result should be "Coding"'
    ],
    completedMessage: 'Mastery achieved! You understand the undo/redo system!'
  }
]

export default function UndoRedoLevel9() {
  const [currentChallenge, setCurrentChallenge] = useState(0)
  const [score, setScore] = useState(0)
  const [mode, setMode] = useState<VimMode>(VIM_MODES.NORMAL)
  const [, setLastKeyPressed] = useState<string | null>(null)
  const [showConfetti, setShowConfetti] = useState(false)
  const [challengeCompleted, setChallengeCompleted] = useState(false)

  const challenge = challenges[currentChallenge]
  const MAX_SCORE = challenges.length
  const isInsertMode = mode === VIM_MODES.INSERT
  const isLevelCompleted = score === MAX_SCORE

  const handleChallengeCompleted = ({ newText }: { newText: string }) => {
    if (newText.trim() === challenge.expectedText.trim() && !challengeCompleted) {
      setChallengeCompleted(true)
      setScore(score + 1)
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 2000)
    }
  }

  const nextChallenge = () => {
    if (currentChallenge < challenges.length - 1) {
      setCurrentChallenge(currentChallenge + 1)
      setChallengeCompleted(false)
      setMode(VIM_MODES.NORMAL)
    }
  }

  const resetChallenge = () => {
    setChallengeCompleted(false)
    setMode(VIM_MODES.NORMAL)
  }

  const resetLevel = () => {
    setCurrentChallenge(0)
    setScore(0)
    setChallengeCompleted(false)
    setMode(VIM_MODES.NORMAL)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-900 text-white p-8">
      {showConfetti && <ConfettiBurst />}
      
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Level 9: Undo & Redo
          </h1>
          <p className="text-zinc-400 text-lg">
            Master the power of history navigation with 'u' and 'Ctrl+r'
          </p>
        </div>

        {/* Progress */}
        <div className="flex justify-between items-center mb-6">
          <Scoreboard score={score} maxScore={MAX_SCORE} />
          <div className="text-sm text-zinc-400">
            Challenge {currentChallenge + 1} of {challenges.length}
          </div>
        </div>

        {/* Challenge Info */}
        <div className="bg-zinc-800 rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-2 text-purple-400">
            {challenge.title}
          </h2>
          <p className="text-zinc-300 mb-4">{challenge.description}</p>
          
          <div className="bg-zinc-900 rounded-lg p-4 mb-4">
            <h3 className="text-lg font-semibold mb-2 text-pink-400">Instructions:</h3>
            <ol className="list-decimal list-inside space-y-1 text-zinc-300">
              {challenge.instructions.map((instruction, index) => (
                <li key={index}>{instruction}</li>
              ))}
            </ol>
          </div>

          {challengeCompleted && (
            <div className="bg-green-800 rounded-lg p-4 mb-4">
              <p className="text-green-200 font-semibold">✅ {challenge.completedMessage}</p>
            </div>
          )}
        </div>

        {/* Editor */}
        <div className="bg-zinc-800 rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <ModeIndicator mode={mode} />
            <div className="flex gap-2">
              <button
                onClick={resetChallenge}
                className="flex items-center gap-2 px-3 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg transition-colors text-sm"
              >
                <RefreshCw size={16} />
                Reset Challenge
              </button>
              {challengeCompleted && currentChallenge < challenges.length - 1 && (
                <button
                  onClick={nextChallenge}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors text-sm font-semibold"
                >
                  Next Challenge →
                </button>
              )}
            </div>
          </div>

          <div className="border border-zinc-600 rounded-lg overflow-hidden">
            <TextEditorWithHistory
              key={`challenge-${currentChallenge}-${challengeCompleted ? 'completed' : 'active'}`}
              initialText={challenge.initialText}
              mode={mode}
              setMode={setMode}
              setLastKeyPressed={setLastKeyPressed}
              activeKeys={['h', 'j', 'k', 'l', 'i', 'a', 'A', 'o', 'O', 'x', 'u', 'ctrl+r']}
              onCompleted={handleChallengeCompleted}
              editor={{
                fontSize: 18,
                showLineNumbers: false,
                padding: 16,
              }}
            />
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-between items-center">
          <KeysAllowed 
            keys={['h', 'j', 'k', 'l', 'i', 'a', 'A', 'o', 'O', 'x', 'u', 'Ctrl+r']} 
            isInsertMode={isInsertMode}
          />
          
          <div className="flex gap-2">
            <button
              onClick={resetLevel}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
            >
              <RefreshCw size={16} />
              Reset Level
            </button>
          </div>
        </div>

        {/* Level Completion */}
        {isLevelCompleted && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-zinc-800 rounded-lg p-8 text-center max-w-md">
              <h2 className="text-3xl font-bold mb-4 text-purple-400">
                🎉 Level Complete!
              </h2>
              <p className="text-zinc-300 mb-6">
                Congratulations! You've mastered undo and redo operations. 
                You can now navigate through your editing history like a pro!
              </p>
              <div className="text-2xl font-bold text-green-400 mb-4">
                Score: {score}/{MAX_SCORE}
              </div>
              <button
                onClick={resetLevel}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors font-semibold"
              >
                Play Again
              </button>
            </div>
          </div>
        )}

        {/* Timer */}
        <div className="mt-6">
          <LevelTimer 
            levelId="level-9-undo-redo" 
            isActive={!isLevelCompleted} 
            isCompleted={isLevelCompleted}
          />
        </div>
      </div>
    </div>
  )
}