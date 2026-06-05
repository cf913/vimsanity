import { useEffect, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import Hero from './screens/Hero'
import WorldMap from './screens/WorldMap'
import { units } from './units/registry'
import { loadProgress, getUnitProgress } from '../../state/progress'
import type { Progress } from '../../state/types'

const UNIT_IDS = units.map((u) => u.id)
const HERO_SEEN_KEY = 'vimsanity-v2-seen-hero'

function nextReadyUnitId(progress: Progress): string {
  for (const u of units) {
    const up = getUnitProgress(progress, u.id)
    if (up.aStatus !== 'completed' || up.bStatus !== 'completed') return u.id
  }
  return units[units.length - 1].id
}

export default function LearnWing() {
  const [progress, setProgress] = useState<Progress>(() => loadProgress(UNIT_IDS))
  const [showHero, setShowHero] = useState<boolean>(() => !localStorage.getItem(HERO_SEEN_KEY))
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    setProgress(loadProgress(UNIT_IDS))
  }, [location.pathname])

  const isIndex = location.pathname === '/learn' || location.pathname === '/learn/'

  if (isIndex && showHero) {
    const enterMap = () => {
      localStorage.setItem(HERO_SEEN_KEY, '1')
      setShowHero(false)
    }
    return (
      <Hero
        onEnter={enterMap}
        onResume={() => navigate(`/learn/${nextReadyUnitId(progress)}`)}
        resumeLabel="Resume"
      />
    )
  }

  if (isIndex) {
    return (
      <WorldMap
        progress={progress}
        onEnterUnit={(id) => navigate(`/learn/${id}`)}
        onOpenDex={() => navigate('/learn/dex')}
        onBack={() => setShowHero(true)}
      />
    )
  }

  return <Outlet />
}
