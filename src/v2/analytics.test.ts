import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('posthog-js', () => ({
  default: { __loaded: false, capture: vi.fn() },
}))

import posthog from 'posthog-js'
import { track } from './analytics'

const capture = vi.mocked(posthog.capture)

beforeEach(() => {
  posthog.__loaded = false
  capture.mockReset()
})

describe('track', () => {
  it('does nothing when PostHog is not initialized', () => {
    track('v2_unit_started', { unit_id: 'hjkl' })
    expect(capture).not.toHaveBeenCalled()
  })

  it('captures the event with its properties when PostHog is loaded', () => {
    posthog.__loaded = true
    track('v2_unit_completed', { unit_id: 'wbe', keystrokes: 12, par: 9, stars: 2 })
    expect(capture).toHaveBeenCalledWith('v2_unit_completed', {
      unit_id: 'wbe',
      keystrokes: 12,
      par: 9,
      stars: 2,
    })
  })

  it('captures a property-less event with undefined props', () => {
    posthog.__loaded = true
    track('v2_onboarding_started')
    expect(capture).toHaveBeenCalledWith('v2_onboarding_started', undefined)
  })

  it('never throws, even if capture does', () => {
    posthog.__loaded = true
    capture.mockImplementation(() => {
      throw new Error('boom')
    })
    expect(() => track('v2_graduated', { units_total: 7 })).not.toThrow()
  })
})
