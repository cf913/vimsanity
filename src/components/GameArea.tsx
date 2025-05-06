import React from 'react'
import { LevelProps } from '../types/levelTypes'
import PlaygroundLevel from './levels/PlaygroundLevel'
import GridMovementLevel from './levels/GridMovementLevel'
import WordMovementLevel from './levels/WordMovementLevel'
import LineOperations3 from './levels/LineOperations3'
import FindChars4 from './levels/FindChars4'

interface GameAreaProps {
  level: number
  isMuted: boolean
}

const GameArea: React.FC<GameAreaProps> = ({ level, isMuted }) => {
  // Render the appropriate level component based on the current level
  const renderLevel = () => {
    switch (level) {
      case 0:
        return <PlaygroundLevel isMuted={isMuted} />
      case 1:
        return <GridMovementLevel isMuted={isMuted} />
      case 2:
        return <WordMovementLevel isMuted={isMuted} />
      case 3:
        return <LineOperations3 isMuted={isMuted} />
      case 4:
        return <FindChars4 isMuted={isMuted} />
      default:
        return <GridMovementLevel isMuted={isMuted} />
    }
  }

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold mEb-2">Level {level}</h2>
      </div>

      {renderLevel()}
    </div>
  )
}

export default GameArea
