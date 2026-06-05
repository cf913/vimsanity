import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import ADrillStage from './stages/ADrillStage'
import BCheckStage from './stages/BCheckStage'
import ADrillStageText from './stages/ADrillStageText'
import BCheckStageText from './stages/BCheckStageText'
import ADrillStageEdit from './stages/ADrillStageEdit'
import BCheckStageEdit from './stages/BCheckStageEdit'
import LevelChrome from './level/LevelChrome'
import LevelComplete, { type LevelResult } from './level/LevelComplete'
import type { StageTelemetry, StageResult } from './level/types'
import { units, findUnit } from './units/registry'
import { getMeta, starsForKeystrokes, scoreForResult } from './progression'
import {
  loadProgress,
  saveProgress,
  markStageCompleted,
  recordUnitResult,
  touchStreak,
  getUnitProgress,
} from '../../state/progress'

const UNIT_IDS = units.map((u) => u.id)

type ActiveStage = 'a' | 'b' | 'done'

function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

export default function UnitRunner() {
  const { unitId } = useParams<{ unitId: string }>()
  const navigate = useNavigate()
  const unit = unitId ? findUnit(unitId) : undefined

  const [progress, setProgress] = useState(() => loadProgress(UNIT_IDS))
  const [active, setActive] = useState<ActiveStage>('a')
  const [replayMode, setReplayMode] = useState(false)
  const [replayKey, setReplayKey] = useState(0)
  const [telemetry, setTelemetry] = useState<StageTelemetry | null>(null)
  const [result, setResult] = useState<LevelResult | null>(null)

  useEffect(() => {
    if (!unit) return
    if (replayMode) return
    const up = getUnitProgress(progress, unit.id)
    if (up.aStatus !== 'completed') setActive('a')
    else if (up.bStatus !== 'completed') setActive('b')
    else setActive('done')
  }, [unit, progress, replayMode])

  // Reset live telemetry whenever the stage (or a replay) changes.
  useEffect(() => {
    setTelemetry(null)
  }, [active, replayKey])

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

  const handleBComplete = useCallback(
    (stageResult?: StageResult) => {
      if (!unit) return
      // Derive light-progression result from the B-check par performance.
      let levelResult: LevelResult | null = null
      if (stageResult) {
        const stars = starsForKeystrokes(stageResult.keystrokes, stageResult.par)
        levelResult = {
          stars,
          keystrokes: stageResult.keystrokes,
          par: stageResult.par,
          score: scoreForResult(stars, stageResult.keystrokes, stageResult.par),
        }
      }
      setResult(levelResult)

      if (replayMode) {
        setActive('done')
        return
      }
      let next = markStageCompleted(progress, unit.id, 'b', UNIT_IDS)
      if (levelResult) {
        next = recordUnitResult(next, unit.id, {
          stars: levelResult.stars,
          score: levelResult.score,
          keystrokes: levelResult.keystrokes,
        })
      }
      next = touchStreak(next, todayISO())
      saveProgress(next)
      setProgress(next)
    },
    [progress, unit, replayMode],
  )

  const handleReplay = useCallback(() => {
    setReplayMode(true)
    setActive('a')
    setResult(null)
    setReplayKey((k) => k + 1)
  }, [])

  const currentIdx = unit ? UNIT_IDS.indexOf(unit.id) : -1
  const nextUnit = currentIdx >= 0 ? units[currentIdx + 1] : undefined

  // Completion-screen shortcuts.
  useEffect(() => {
    if (active !== 'done') return
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      if (e.key === 'Enter' && nextUnit) {
        e.preventDefault()
        navigate(`/learn/${nextUnit.id}`)
      } else if (e.key === 'r') {
        e.preventDefault()
        handleReplay()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [active, nextUnit, navigate, handleReplay])

  if (!unit) {
    return (
      <div style={{ padding: 32, color: '#9af0b8' }}>
        Unknown unit. <button onClick={() => navigate('/learn')}>Back to Learn</button>
      </div>
    )
  }

  if (active === 'done') {
    // On a revisit (no fresh result), fall back to the stored best so earned
    // stars/score still show.
    const up = getUnitProgress(progress, unit.id)
    const displayResult: LevelResult | null =
      result ??
      (up.stars !== undefined
        ? { stars: up.stars, keystrokes: up.bestKeystrokes ?? 0, score: up.bestScore ?? 0 }
        : null)
    const cleared = UNIT_IDS.filter((id) => getUnitProgress(progress, id).bStatus === 'completed').length
    return (
      <LevelComplete
        unit={unit}
        result={displayResult}
        streak={progress.streak?.count ?? 0}
        nextUnit={nextUnit}
        replayMode={replayMode}
        cleared={cleared}
        totalUnits={UNIT_IDS.length}
        bestKeystrokes={up.bestKeystrokes}
        onReplay={handleReplay}
        onNext={nextUnit ? () => navigate(`/learn/${nextUnit.id}`) : undefined}
        onMap={() => navigate('/learn')}
      />
    )
  }

  const stage: 'A' | 'B' = active === 'a' ? 'A' : 'B'
  const stageName = active === 'a' ? 'Drill' : 'Check'
  const allowedKeys = active === 'a' ? unit.aStage.allowedKeys : unit.bStage.allowedKeys
  const hint = getMeta(unit.id)?.blurb

  const stageEl =
    active === 'a'
      ? (() => {
          switch (unit.aStage.kind) {
            case 'a-drill-grid':
              return <ADrillStage key={replayKey} def={unit.aStage} onCompleted={handleAComplete} onTelemetry={setTelemetry} />
            case 'a-drill-text':
              return <ADrillStageText key={replayKey} def={unit.aStage} onCompleted={handleAComplete} onTelemetry={setTelemetry} />
            case 'a-drill-edit':
              return <ADrillStageEdit key={replayKey} def={unit.aStage} onCompleted={handleAComplete} onTelemetry={setTelemetry} />
          }
        })()
      : (() => {
          switch (unit.bStage.kind) {
            case 'b-check-cursor-puzzles':
              return <BCheckStage key={replayKey} def={unit.bStage} onCompleted={handleBComplete} onTelemetry={setTelemetry} />
            case 'b-check-text-puzzles':
              return <BCheckStageText key={replayKey} def={unit.bStage} onCompleted={handleBComplete} onTelemetry={setTelemetry} />
            case 'b-check-edit-puzzles':
              return <BCheckStageEdit key={replayKey} def={unit.bStage} onCompleted={handleBComplete} onTelemetry={setTelemetry} />
          }
        })()

  return (
    <LevelChrome
      unit={unit}
      stage={stage}
      stageName={stageName}
      replayMode={replayMode}
      runKey={`${active}-${replayKey}`}
      telemetry={telemetry}
      allowedKeys={allowedKeys}
      hint={hint}
      onBack={() => navigate('/learn')}
    >
      {stageEl}
    </LevelChrome>
  )
}
