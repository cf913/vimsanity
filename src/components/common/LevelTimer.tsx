import React, { useEffect, useRef, useState } from 'react'
import { useTimer } from '../../hooks/useTimer'
import { Clock } from 'lucide-react'

interface LevelTimerProps {
  levelId: string | number
  isActive: boolean
  isCompleted?: boolean
}

interface LevelCompletion {
  time: string
  duration: string
  timestamp: number
  date: string
}

const LevelTimer: React.FC<LevelTimerProps> = ({
  levelId,
  isActive,
  isCompleted,
}) => {
  const [displayTime, setDisplayTime] = useState<string>('00:00')
  const { formattedTime, isRunning, sessionFormattedTime } = useTimer(
    levelId,
    isActive,
  )
  const [markedCompleted, setMarkedCompleted] = useState(false)
  const timerRef = useRef<HTMLDivElement>(null)
  const [lastCompletion, setLastCompletion] = useState<LevelCompletion | null>(
    null,
  )

  // Update the displayed time whenever formattedTime changes
  useEffect(() => {
    setDisplayTime(formattedTime)
  }, [formattedTime])

  // Load last completion data from localStorage when component mounts
  useEffect(() => {
    const storedCompletion = localStorage.getItem(`level-${levelId}-completion`)
    if (storedCompletion) {
      setLastCompletion(JSON.parse(storedCompletion))
    }
  }, [levelId])

  // Handle level completion
  useEffect(() => {
    if (!isCompleted) {
      if (markedCompleted) {
        setMarkedCompleted(false)
      }
      return
    }

    if (!markedCompleted) {
      const completionTime = new Date().toLocaleTimeString()
      const completionData: LevelCompletion = {
        time: completionTime,
        duration: sessionFormattedTime,
        timestamp: Date.now(),
        date: new Date().toLocaleString(),
      }

      // Save to last completion
      localStorage.setItem(
        `level-${levelId}-completion`,
        JSON.stringify(completionData),
      )
      setLastCompletion(completionData)
      setMarkedCompleted(true)

      // Append to session history
      const historyKey = `level-${levelId}-history`
      const prev = localStorage.getItem(historyKey)
      let arr = []
      if (prev) {
        try {
          arr = JSON.parse(prev)
        } catch {
          // Ignore parsing errors
        }
      }
      arr.push({
        duration: parseDuration(sessionFormattedTime),
        timestamp: Date.now(),
      })
      localStorage.setItem(historyKey, JSON.stringify(arr))
    }
  }, [isCompleted, markedCompleted, sessionFormattedTime, levelId])

  // Helper to parse mm:ss or hh:mm:ss to seconds
  function parseDuration(str: string): number {
    const parts = str.split(':').map(Number)
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2]
    if (parts.length === 2) return parts[0] * 60 + parts[1]
    return 0
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4 mt-4 w-full">
      {/* Current Timer */}
      <div
        ref={timerRef}
        className={`flex items-center gap-2 px-4 py-2 bg-bg-secondary rounded-lg shadow-md transition-all duration-300 ${
          isRunning ? 'timer-active' : ''
        }`}
      >
        <Clock
          size={18}
          className={`${isRunning ? 'text-emerald-400' : 'text-text-subtle'}`}
        />
        <span className="font-mono text-sm text-text-subtle hover:text-text-secondary transition-all">
          Total Time: {displayTime}
        </span>
      </div>

      {/* Last Completion Info */}
      {lastCompletion && (
        <div className="flex items-center gap-2 px-4 py-2 bg-bg-secondary rounded-lg shadow-md text-text-subtle">
          <Clock size={18} className="" />
          <div className="flex flex-col">
            <span className="font-mono text-sm">{lastCompletion.date}</span>
            <span className="font-mono text-sm">
              Duration: {lastCompletion.duration}
            </span>
          </div>
        </div>
      )}

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
      {/* Session History Chart */}
      {/* <SessionHistory levelId={levelId} /> */}
    </div>
  )
}

export default LevelTimer
