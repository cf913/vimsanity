import React from 'react'
import { RefreshCw } from 'lucide-react'
import Scoreboard from '../common/Scoreboard'
import ModeIndicator from '../common/ModeIndicator'
import { VimMode } from '../../utils/constants'

interface LevelHeaderProps {
  title: string
  titleColor?: string
  description?: React.ReactNode
  score: number
  maxScore: number
  onReset: () => void
  mode?: VimMode
  insertCommand?: string
  extra?: React.ReactNode
}

export default function LevelHeader({
  title,
  titleColor = 'text-emerald-400',
  description,
  score,
  maxScore,
  onReset,
  mode,
  insertCommand,
  extra,
}: LevelHeaderProps) {
  return (
    <>
      {/* Title & Description */}
      <div className="text-center">
        <h2 className={`text-2xl font-bold mb-2 ${titleColor}`}>{title}</h2>
        {description && <p className="text-text-muted">{description}</p>}
      </div>

      {/* Controls row */}
      <div className="flex items-center gap-4">
        <Scoreboard score={score} maxScore={maxScore} />
        {mode !== undefined && (
          <ModeIndicator
            isInsertMode={mode === 'insert'}
            insertCommand={insertCommand}
          />
        )}
        <button
          onClick={onReset}
          className="bg-bg-secondary p-2 rounded-lg hover:bg-bg-tertiary transition-colors"
          aria-label="Reset Level"
        >
          <RefreshCw size={18} className="text-text-muted" />
        </button>
        {extra}
      </div>
    </>
  )
}
