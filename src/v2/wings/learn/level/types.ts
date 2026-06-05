// Shared contracts between a play stage and the LevelChrome HUD / UnitRunner.
// Both are OPTIONAL on the stage components so the engine loop and the original
// `{ def, onCompleted }` contract stay intact — a stage that doesn't report
// telemetry just renders without a live HUD.

export type StageMode = 'normal' | 'insert' | 'visual'

/** Live, per-keystroke snapshot a stage publishes for the HUD. */
export interface StageTelemetry {
  keystrokes: number
  lastKey?: string
  mode?: StageMode
  /** Pending operator/count buffer (editable stages), e.g. "d", "2d". */
  pending?: string
  /** Progress through the stage (targets hit, or puzzle index). */
  progress?: { current: number; total: number; label: string }
  /** Par for the active puzzle (B-check stages). */
  par?: number
}

/** Final result a B-check stage reports on completion, for stars/score. */
export interface StageResult {
  keystrokes: number
  par: number
}

/** Completion callback — optional result lets B stages report par performance. */
export type OnStageCompleted = (result?: StageResult) => void
export type OnTelemetry = (t: StageTelemetry) => void
