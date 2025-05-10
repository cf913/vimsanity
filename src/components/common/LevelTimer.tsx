import React, { useEffect, useRef, useState } from 'react'
import { useTimer } from '../../hooks/useTimer'
import { Clock } from 'lucide-react'

interface LevelTimerProps {
  levelId: string | number
  isActive: boolean
}

const LevelTimer: React.FC<LevelTimerProps> = ({ levelId, isActive }) => {
  // Use local state to track the displayed time
  const [displayTime, setDisplayTime] = useState<string>('00:00')
  const { formattedTime, isRunning } = useTimer(levelId, isActive)
  const timerRef = useRef<HTMLDivElement>(null)

  // Update the displayed time whenever formattedTime changes
  useEffect(() => {
    setDisplayTime(formattedTime)
  }, [formattedTime])

  // No longer needed since we're using className directly
  // This was causing issues with the animation not applying correctly

  return (
    <div className="flex items-center justify-center mt-4">
      <div
        ref={timerRef}
        className={`flex items-center gap-2 px-4 py-2 bg-zinc-800 rounded-lg shadow-md transition-all duration-300 ${
          isRunning ? 'timer-active' : ''
        }`}
      >
        <Clock
          size={18}
          className={`${isRunning ? 'text-emerald-400' : 'text-zinc-600'}`}
        />
        <span className="font-mono text-sm text-zinc-600 hover:text-zinc-300 transition-all">
          {displayTime}
        </span>
      </div>
      <style jsx>{`
        .timer-active {
          box-shadow: 0 0 0 rgba(52, 211, 153, 0.4);
          animation: timer-pulse 2s infinite;
        }

        @keyframes timer-pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(52, 211, 153, 0.4);
          }
          70% {
            box-shadow: 0 0 0 8px rgba(52, 211, 153, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(52, 211, 153, 0);
          }
        }
      `}</style>
    </div>
  )
}

export default LevelTimer
