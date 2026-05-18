import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import ADrillStage from './stages/ADrillStage'
import BCheckStage from './stages/BCheckStage'
import { units, findUnit } from './units/registry'
import {
  loadProgress,
  saveProgress,
  markStageCompleted,
  getUnitProgress,
} from '../../state/progress'

const UNIT_IDS = units.map((u) => u.id)

type ActiveStage = 'a' | 'b' | 'done'

export default function UnitRunner() {
  const { unitId } = useParams<{ unitId: string }>()
  const navigate = useNavigate()
  const unit = unitId ? findUnit(unitId) : undefined

  const [progress, setProgress] = useState(() => loadProgress(UNIT_IDS))
  const [active, setActive] = useState<ActiveStage>('a')

  useEffect(() => {
    if (!unit) return
    const up = getUnitProgress(progress, unit.id)
    if (up.aStatus !== 'completed') setActive('a')
    else if (up.bStatus !== 'completed') setActive('b')
    else setActive('done')
  }, [unit, progress])

  const handleAComplete = useCallback(() => {
    if (!unit) return
    const next = markStageCompleted(progress, unit.id, 'a', UNIT_IDS)
    saveProgress(next)
    setProgress(next)
  }, [progress, unit])

  const handleBComplete = useCallback(() => {
    if (!unit) return
    const next = markStageCompleted(progress, unit.id, 'b', UNIT_IDS)
    saveProgress(next)
    setProgress(next)
  }, [progress, unit])

  if (!unit) {
    return (
      <div className="p-8 text-gray-400">
        Unknown unit. <button onClick={() => navigate('/learn')}>Back to Learn</button>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-gray-800 px-6 py-4">
        <div className="text-xs uppercase tracking-wider text-gray-500">
          Unit · {unit.id}
        </div>
        <h1 className="text-xl font-semibold text-gray-100">{unit.title}</h1>
        <div className="mt-1 font-mono text-sm text-orange-300">{unit.motionLabel}</div>
      </header>
      {active === 'a' && <ADrillStage def={unit.aStage} onCompleted={handleAComplete} />}
      {active === 'b' && <BCheckStage def={unit.bStage} onCompleted={handleBComplete} />}
      {active === 'done' && (
        <div className="flex flex-col items-center gap-4 p-12 text-center">
          <div className="text-2xl">✓ Unit complete</div>
          <div className="text-sm text-gray-400">
            More units arrive in the next release.
          </div>
          <button
            className="rounded bg-orange-500 px-4 py-2 text-sm text-black"
            onClick={() => navigate('/learn')}
          >
            Back to Learn
          </button>
        </div>
      )}
    </div>
  )
}
