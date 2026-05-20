import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import ADrillStage from './stages/ADrillStage'
import BCheckStage from './stages/BCheckStage'
import ADrillStageText from './stages/ADrillStageText'
import BCheckStageText from './stages/BCheckStageText'
import ADrillStageEdit from './stages/ADrillStageEdit'
import BCheckStageEdit from './stages/BCheckStageEdit'
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
  const [replayMode, setReplayMode] = useState(false)
  const [replayKey, setReplayKey] = useState(0)

  useEffect(() => {
    if (!unit) return
    if (replayMode) return
    const up = getUnitProgress(progress, unit.id)
    if (up.aStatus !== 'completed') setActive('a')
    else if (up.bStatus !== 'completed') setActive('b')
    else setActive('done')
  }, [unit, progress, replayMode])

  const handleAComplete = useCallback(() => {
    if (!unit) return
    if (replayMode) {
      setActive('b')
      setReplayKey((k) => k + 1)
      return
    }
    const next = markStageCompleted(progress, unit.id, 'a', UNIT_IDS)
    saveProgress(next)
    setProgress(next)
  }, [progress, unit, replayMode])

  const handleBComplete = useCallback(() => {
    if (!unit) return
    if (replayMode) {
      setActive('done')
      return
    }
    const next = markStageCompleted(progress, unit.id, 'b', UNIT_IDS)
    saveProgress(next)
    setProgress(next)
  }, [progress, unit, replayMode])

  const handleReplay = useCallback(() => {
    setReplayMode(true)
    setActive('a')
    setReplayKey((k) => k + 1)
  }, [])

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
          {replayMode && (
            <span className="ml-2 text-orange-400">· replay</span>
          )}
        </div>
        <h1 className="text-xl font-semibold text-gray-100">{unit.title}</h1>
        <div className="mt-1 font-mono text-sm text-orange-300">{unit.motionLabel}</div>
      </header>
      {active === 'a' && (() => {
        switch (unit.aStage.kind) {
          case 'a-drill-grid':
            return <ADrillStage key={replayKey} def={unit.aStage} onCompleted={handleAComplete} />
          case 'a-drill-text':
            return <ADrillStageText key={replayKey} def={unit.aStage} onCompleted={handleAComplete} />
          case 'a-drill-edit':
            return <ADrillStageEdit key={replayKey} def={unit.aStage} onCompleted={handleAComplete} />
        }
      })()}
      {active === 'b' && (() => {
        switch (unit.bStage.kind) {
          case 'b-check-cursor-puzzles':
            return <BCheckStage key={replayKey} def={unit.bStage} onCompleted={handleBComplete} />
          case 'b-check-text-puzzles':
            return <BCheckStageText key={replayKey} def={unit.bStage} onCompleted={handleBComplete} />
          case 'b-check-edit-puzzles':
            return <BCheckStageEdit key={replayKey} def={unit.bStage} onCompleted={handleBComplete} />
        }
      })()}
      {active === 'done' && (() => {
        const currentIdx = UNIT_IDS.indexOf(unit.id)
        const nextUnit = currentIdx >= 0 ? units[currentIdx + 1] : undefined
        return (
          <div className="flex flex-col items-center gap-4 p-12 text-center">
            <div className="text-2xl">✓ Unit complete</div>
            <div className="text-sm text-gray-400">
              {nextUnit
                ? `Up next: ${nextUnit.title}.`
                : 'You’ve cleared every unit currently in the curriculum.'}
            </div>
            <div className="mt-2 flex gap-3">
              <button
                className="rounded bg-orange-500 px-4 py-2 text-sm font-medium text-black hover:bg-orange-400"
                onClick={handleReplay}
              >
                ↻ Replay unit
              </button>
              {nextUnit && (
                <button
                  className="rounded bg-orange-500/20 px-4 py-2 text-sm font-medium text-orange-200 hover:bg-orange-500/30"
                  onClick={() => navigate(`/learn/${nextUnit.id}`)}
                >
                  Continue to {nextUnit.title} →
                </button>
              )}
              <button
                className="rounded border border-gray-700 px-4 py-2 text-sm text-gray-200 hover:bg-gray-900"
                onClick={() => navigate('/learn')}
              >
                Back to Learn
              </button>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
