import React from 'react'
import { BookOpen, Lock, Volume2, VolumeX } from 'lucide-react'

interface SidebarProps {
  currentLevel: number
  setCurrentLevel: (level: number) => void
  isMuted: boolean
  setIsMuted: (muted: boolean) => void
}

const levels = [
  { id: 1, title: 'Basic Movement (h, j, k, l)', description: 'Learn the fundamental vim motions' },
  { id: 2, title: 'Word Movement (w, b, e)', description: 'Navigate through words efficiently' },
  { id: 3, title: 'Line Operations (0, $)', description: 'Move to start and end of lines', locked: true },
  { id: 4, title: 'Find Characters (f, t)', description: 'Jump to specific characters', locked: true },
]

const Sidebar: React.FC<SidebarProps> = ({ currentLevel, setCurrentLevel, isMuted, setIsMuted }) => {
  return (
    <div className="w-64 h-full bg-zinc-800 p-4">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <BookOpen className="text-emerald-500" />
          <h1 className="text-xl font-bold">VIM Quest</h1>
        </div>
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="p-2 hover:bg-zinc-700 rounded-lg transition-colors"
        >
          {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
      </div>

      <div className="space-y-2">
        {levels.map((level) => (
          <button
            key={level.id}
            onClick={() => !level.locked && setCurrentLevel(level.id)}
            className={`w-full text-left p-3 rounded-lg transition-all ${
              currentLevel === level.id
                ? 'bg-emerald-500 text-white'
                : level.locked
                ? 'bg-zinc-700/50 text-zinc-500 cursor-not-allowed'
                : 'bg-zinc-700 hover:bg-zinc-600'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">Level {level.id}</span>
              {level.locked && <Lock size={16} />}
            </div>
            <p className="text-sm mt-1">{level.title}</p>
          </button>
        ))}
      </div>
    </div>
  )
}

export default Sidebar