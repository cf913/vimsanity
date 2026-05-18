import { useEffect, useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import UnitSidebar from './UnitSidebar'
import { units } from './units/registry'
import { loadProgress, getUnitProgress } from '../../state/progress'
import type { Progress } from '../../state/types'

const UNIT_IDS = units.map((u) => u.id)

function nextReadyUnitId(progress: Progress): string {
  for (const u of units) {
    const up = getUnitProgress(progress, u.id)
    if (up.aStatus !== 'completed' || up.bStatus !== 'completed') return u.id
  }
  return units[units.length - 1].id
}

export default function LearnWing() {
  const [progress, setProgress] = useState<Progress>(() => loadProgress(UNIT_IDS))
  const location = useLocation()

  useEffect(() => {
    setProgress(loadProgress(UNIT_IDS))
  }, [location.pathname])

  if (location.pathname === '/learn' || location.pathname === '/learn/') {
    return <Navigate to={`/learn/${nextReadyUnitId(progress)}`} replace />
  }

  return (
    <div className="flex flex-1">
      <UnitSidebar progress={progress} />
      <Outlet />
    </div>
  )
}
