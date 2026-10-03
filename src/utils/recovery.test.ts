import { describe, it, expect } from 'vitest'
import { computeRecovery } from './recovery'

describe('computeRecovery', () => {
  it('computes score when all inputs are present', () => {
    // sleep=80 → 0.80*0.40=0.32
    // hrv=55 in [40,70] → (55-40)/(70-40)=0.5 → 0.5*0.35=0.175
    // battery=70 → 0.70*0.25=0.175
    // total = (0.32+0.175+0.175)/1.0 * 100 = 67
    const score = computeRecovery(80, 55, 40, 70, 70)
    expect(score).toBe(67)
  })

  it('reweights when HRV is missing', () => {
    // weights: sleep=0.40, battery=0.25 → total=0.65
    // sleep=80 → 0.80*(0.40/0.65), battery=70 → 0.70*(0.25/0.65)
    const score = computeRecovery(80, null, null, null, 70)
    const expected = Math.round((0.80 * (0.40 / 0.65) + 0.70 * (0.25 / 0.65)) * 100)
    expect(score).toBe(expected)
  })

  it('reweights when battery is missing', () => {
    // weights: sleep=0.40, hrv=0.35 → total=0.75
    const score = computeRecovery(80, 55, 40, 70, null)
    const expected = Math.round((0.80 * (0.40 / 0.75) + 0.5 * (0.35 / 0.75)) * 100)
    expect(score).toBe(expected)
  })

  it('returns null when all inputs are null', () => {
    expect(computeRecovery(null, null, null, null, null)).toBeNull()
  })

  it('returns null when all inputs are undefined', () => {
    expect(computeRecovery(undefined, undefined, undefined, undefined, undefined)).toBeNull()
  })

  it('clamps HRV above baseline to 1', () => {
    // hrv well above baseline → clamped to 1.0
    const score = computeRecovery(100, 200, 40, 70, 100)
    expect(score).toBe(100)
  })

  it('clamps sleep score above 100', () => {
    const score = computeRecovery(120, null, null, null, null)
    expect(score).toBe(100)
  })
})
