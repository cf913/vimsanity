export type StageStatus = 'locked' | 'ready' | 'in-progress' | 'completed'

export interface UnitProgress {
  aStatus: StageStatus
  bStatus: StageStatus
}

export interface Progress {
  units: Record<string, UnitProgress>
}

export const STORAGE_KEY = 'vimsanity-v2-progress'
