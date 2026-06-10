import { useEffect, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import Hero from './screens/Hero'
import WorldMap from './screens/WorldMap'
import Onboarding from './onboarding/Onboarding'
import { units } from './units/registry'
import { loadProgress, saveProgress, getUnitProgress, unlockUpTo } from '../../state/progress'
import type { Progress } from '../../state/types'
import { track } from '../../analytics'

const UNIT_IDS = units.map((u) => u.id)
const HERO_SEEN_KEY = 'vimsanity-v2-seen-hero'
const ONBOARDED_KEY = 'vimsanity-v2-onboarded'

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
  const [onboarding, setOnboarding] = useState(false)
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
      // First-timers get placement before the map.
      if (!localStorage.getItem(ONBOARDED_KEY)) {
        setOnboarding(true)
        track('v2_onboarding_started')
      }
    }
    return (
      <Hero
        onEnter={enterMap}
        onResume={() => navigate(`/learn/${nextReadyUnitId(progress)}`)}
        resumeLabel="Resume"
      />
    )
  }

  if (isIndex && onboarding) {
    const finishOnboarding = (unitId: string) => {
      localStorage.setItem(ONBOARDED_KEY, '1')
      const idx = UNIT_IDS.indexOf(unitId)
      const next = unlockUpTo(loadProgress(UNIT_IDS), UNIT_IDS, idx)
      saveProgress(next)
      setProgress(next)
      setOnboarding(false)
      track('v2_onboarding_completed', { placement_unit: unitId, skipped: false })
      navigate(`/learn/${unitId}`)
    }
    return (
      <Onboarding
        onFinish={finishOnboarding}
        onSkip={() => {
          localStorage.setItem(ONBOARDED_KEY, '1')
          track('v2_onboarding_completed', { placement_unit: UNIT_IDS[0], skipped: true })
          setOnboarding(false)
        }}
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
