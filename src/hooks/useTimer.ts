import { useState, useEffect, useRef, useCallback } from 'react'

// Define a type for the timer data stored in localStorage
interface TimerData {
  [levelId: string]: number // Level ID to total seconds mapping
}

// Define the storage key as a constant outside the hook to ensure consistency
const STORAGE_KEY = 'vimsanity-level-timers'

/**
 * Custom hook for tracking time spent on levels
 * @param levelId - Unique identifier for the level
 * @param isActive - Whether the timer should be active
 * @returns Object containing timer state and controls
 */
export const useTimer = (
  levelId: string | number,
  isActive: boolean = false,
) => {
  // Track session start time
  const [sessionElapsedTime, setSessionElapsedTime] = useState<number>(0)
  const sessionStartRef = useRef<number | null>(null)
  // Get the initial elapsed time from localStorage or start at 0
  const getInitialElapsedTime = useCallback(() => {
    try {
      const storedData = localStorage.getItem(STORAGE_KEY)
      if (storedData) {
        const timerData: TimerData = JSON.parse(storedData)
        return timerData[levelId.toString()] || 0
      }
    } catch (error) {
      console.error('Error reading timer data from localStorage:', error)
    }
    return 0
  }, [levelId])

  const [elapsedTime, setElapsedTime] = useState<number>(getInitialElapsedTime)
  const [isRunning, setIsRunning] = useState<boolean>(false)
  const intervalRef = useRef<number | null>(null)
  const lastUpdateRef = useRef<number>(Date.now())
  const elapsedTimeRef = useRef<number>(elapsedTime)

  // Save timer data to localStorage
  const saveTimerData = useCallback(
    (seconds: number) => {
      try {
        const storedData = localStorage.getItem(STORAGE_KEY)
        const timerData: TimerData = storedData ? JSON.parse(storedData) : {}

        timerData[levelId.toString()] = seconds
        localStorage.setItem(STORAGE_KEY, JSON.stringify(timerData))
      } catch (error) {
        console.error('Error saving timer data to localStorage:', error)
      }
    },
    [levelId],
  )

  // Reset the timer
  const resetTimer = useCallback(() => {
    setElapsedTime(0)
    saveTimerData(0)
  }, [saveTimerData])

  // Format the elapsed time as HH:MM:SS
  const formatTime = useCallback((totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = Math.floor(totalSeconds % 60)

    const pad = (num: number) => num.toString().padStart(2, '0')

    if (hours > 0) {
      return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
    } else {
      return `${pad(minutes)}:${pad(seconds)}`
    }
  }, [])

  // Effect to start/stop timer based on isActive prop
  useEffect(() => {
    // If timer is being started, set session start
    if (isActive) {
      sessionStartRef.current = Date.now()
      setSessionElapsedTime(0)

      // if (isRunning) return

      // setIsRunning(true)
      lastUpdateRef.current = Date.now()
      elapsedTimeRef.current = elapsedTime

      // Clear any existing interval first to prevent duplicates
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }

      // Immediately save the current elapsed time to ensure it's in localStorage
      saveTimerData(elapsedTime)

      // Set a new interval that runs every second
      const tickFn = () => {
        // Update session elapsed time if timer is running
        if (sessionStartRef.current) {
          setSessionElapsedTime(
            () =>
              (Date.now() - (sessionStartRef.current || Date.now())) / 1000,
          )
        }
        const now = Date.now()
        const deltaTime = (now - lastUpdateRef.current) / 1000
        lastUpdateRef.current = now
        elapsedTimeRef.current = elapsedTimeRef.current + deltaTime

        setElapsedTime((prev) => {
          const newTime = prev + deltaTime
          // Only save to localStorage every second to reduce writes
          if (Math.floor(newTime) > Math.floor(prev)) {
            saveTimerData(newTime)
          }
          return newTime
        })
      }

      // Create the interval
      const id = setInterval(tickFn, 1000)

      setTimeout(tickFn, 0)

      // Store the interval ID
      intervalRef.current = id
    } else if (!isActive && sessionStartRef.current) {
      // If timer is being stopped, finalize session elapsed
      setSessionElapsedTime(
        (prev) =>
          prev + (Date.now() - (sessionStartRef.current || Date.now())) / 1000,
      )
      sessionStartRef.current = null
    }

    return () => {
      // Clear the timeout if the component unmounts before it fires
      // clearTimeout(timeoutId)
      try {
        const storedData = localStorage.getItem(STORAGE_KEY)
        const timerData: TimerData = storedData ? JSON.parse(storedData) : {}

        timerData[levelId.toString()] = elapsedTimeRef.current
        localStorage.setItem(STORAGE_KEY, JSON.stringify(timerData))
      } catch (error) {
        console.error('Error saving timer data to localStorage:', error)
      }
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
        elapsedTimeRef.current = 0
      }
      setIsRunning(false)
    }
  }, [levelId, isActive])

  // Initialize localStorage if needed
  useEffect(() => {
    try {
      const storedData = localStorage.getItem(STORAGE_KEY)
      if (!storedData) {
        // Initialize with empty object
        localStorage.setItem(STORAGE_KEY, JSON.stringify({}))
      }
    } catch (error) {
      console.error('Error accessing timer data:', error)
    }
  }, [])

  return {
    elapsedTime, // all time ever spent on this level
    isRunning,
    resetTimer,
    formattedTime: formatTime(elapsedTime),
    sessionElapsedTime, // time in this session only
    sessionFormattedTime: formatTime(sessionElapsedTime),
  }
}
