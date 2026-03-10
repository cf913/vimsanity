import React from 'react'
import { UseVimLevelReturn } from '../../hooks/useVimLevel'
import ConfettiBurst from '../levels/ConfettiBurst'
import LevelTimer from '../common/LevelTimer'

interface LevelShellProps {
  level: UseVimLevelReturn
  children: React.ReactNode
  completionContent?: React.ReactNode
}

export default function LevelShell({
  level,
  children,
  completionContent,
}: LevelShellProps) {
  return (
    <div className="w-full h-full flex flex-col items-center gap-6">
      {level.showConfetti && <ConfettiBurst />}

      {level.levelCompleted && completionContent ? completionContent : children}

      <LevelTimer
        levelId={level.levelId}
        isActive={level.isActive}
        isCompleted={level.levelCompleted}
      />
    </div>
  )
}
