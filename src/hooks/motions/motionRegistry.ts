import { VimMotion, MotionRegistry, MotionContext } from './types'
import { movementMotions } from './movementMotions'
import { editingMotions } from './editingMotions'
import { modeMotions } from './modeMotions'

// Combine all motion types
const allMotions: VimMotion[] = [
  ...movementMotions,
  ...editingMotions,
  ...modeMotions,
]

// Create registry from motion array
export const createMotionRegistry = (
  motions: VimMotion[] = allMotions
): MotionRegistry => {
  return motions.reduce((registry, motion) => {
    registry[motion.key] = motion
    return registry
  }, {} as MotionRegistry)
}

// Default registry with all motions
export const defaultMotionRegistry = createMotionRegistry()

// Helper function to execute a motion
export const executeMotion = (
  key: string,
  context: MotionContext,
  registry: MotionRegistry = defaultMotionRegistry,
  args?: any
): boolean => {
  const motion = registry[key]

  if (!motion) {
    return false
  }

  // Check condition if it exists
  if (motion.condition && !motion.condition(context)) {
    return false
  }

  motion.execute(context, args)
  return true
}

// Helper function to get motions by category
export const getMotionsByCategory = (
  category: 'movement' | 'editing' | 'mode' | 'text-object',
  registry: MotionRegistry = defaultMotionRegistry
): VimMotion[] => {
  return Object.values(registry).filter(
    (motion) => motion.category === category
  )
}

// Helper function to get available motion keys for current mode
export const getAvailableKeys = (
  context: MotionContext,
  registry: MotionRegistry = defaultMotionRegistry
): string[] => {
  return Object.values(registry)
    .filter((motion) => !motion.condition || motion.condition(context))
    .map((motion) => motion.key)
}
