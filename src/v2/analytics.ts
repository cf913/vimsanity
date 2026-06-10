import posthog from 'posthog-js'

/**
 * V2 funnel events — the minimal set from the analytics design spec
 * (docs/superpowers/specs/2026-06-10-v2-analytics-design.md).
 * `undefined` marks events that carry no properties.
 */
export interface AnalyticsEvents {
  v2_onboarding_started: undefined
  v2_onboarding_completed: { placement_unit: string; skipped: boolean }
  v2_unit_started: { unit_id: string }
  v2_unit_completed: { unit_id: string; keystrokes: number; par: number; stars: number }
  v2_graduated: { units_total: number }
  v2_daily_started: { puzzle_id: string }
  v2_daily_solved: { puzzle_id: string; keystrokes: number; par: number; stars: number }
}

/**
 * Capture a funnel event. Safe everywhere: no-ops when PostHog was never
 * initialized (no VITE_PUBLIC_POSTHOG_KEY configured) and swallows capture
 * errors — analytics must never break gameplay.
 */
export function track<K extends keyof AnalyticsEvents>(
  event: K,
  ...props: AnalyticsEvents[K] extends undefined ? [] : [AnalyticsEvents[K]]
): void {
  try {
    if (!posthog.__loaded) return
    posthog.capture(event, props[0])
  } catch {
    /* analytics must never break gameplay */
  }
}
