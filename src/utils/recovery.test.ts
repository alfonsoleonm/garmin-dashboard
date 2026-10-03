import { describe, it, expect } from 'vitest'
import { computeRecovery } from './recovery'

// HRV component helper for tests: hrv=55, baseline=[40,70]
// bandWidth=30, t=(55-40)/30=0.5, hrv_value=0.6+0.5*0.4=0.8
const HRV_55_IN_40_70 = 0.8
// Last argument to computeRecovery is the peak body battery level (highest reading
// for the day, a proxy for wake-up level; falls back to current when unavailable).

describe('computeRecovery', () => {
  it('computes score when all inputs are present (hrv inside band, mid-position)', () => {
    // sleep=80 → 0.80, hrv=55 in [40,70] → 0.8, battery=70 → 0.70
    // weighted = 0.80*0.40 + 0.8*0.35 + 0.70*0.25 = 0.32+0.28+0.175 = 0.775 → 78
    const score = computeRecovery(80, 55, 40, 70, 70)
    expect(score).toBe(Math.round((0.80 * 0.40 + HRV_55_IN_40_70 * 0.35 + 0.70 * 0.25) * 100))
    expect(score).toBe(78)
  })

  it('hrv at band bottom (t=0) → hrv component = 0.6', () => {
    // hrv=40=L in [40,70] → value=0.6+0*0.4=0.6
    // sleep=80→0.8, battery=70→0.7
    // weighted = 0.80*0.40 + 0.60*0.35 + 0.70*0.25 = 0.32+0.21+0.175 = 0.705 → 71
    const score = computeRecovery(80, 40, 40, 70, 70)
    expect(score).toBe(71)
  })

  it('hrv at band top (t=1) → hrv component = 1.0', () => {
    // hrv=70=H in [40,70] → value=0.6+1*0.4=1.0
    // sleep=80→0.8, battery=70→0.7
    // weighted = 0.80*0.40 + 1.0*0.35 + 0.70*0.25 = 0.32+0.35+0.175 = 0.845 → 85
    const score = computeRecovery(80, 70, 40, 70, 70)
    expect(score).toBe(85)
  })

  it('hrv above band → hrv component = 1.0 (high HRV is optimal)', () => {
    // hrv=200 > H=70 → value=1.0; sleep=100, battery=100 → all 1.0 → 100
    const score = computeRecovery(100, 200, 40, 70, 100)
    expect(score).toBe(100)
  })

  it('hrv below band by half band width → hrv component = 0.3', () => {
    // hrv=25 < L=40, dist=15=bandWidth/2=15
    // hrv_value = max(0, 0.6*(1-15/30)) = 0.6*0.5 = 0.3
    // sleep=80→0.8, battery=70→0.7
    // weighted = 0.80*0.40 + 0.30*0.35 + 0.70*0.25 = 0.32+0.105+0.175 = 0.60 → 60
    const score = computeRecovery(80, 25, 40, 70, 70)
    expect(score).toBe(60)
  })

  it('hrv below band by a full band width → hrv component = 0 (no contribution)', () => {
    // hrv=10 < L=40, dist=30=bandWidth → hrv_value=max(0, 0.6*(1-30/30))=0
    // sleep=80→0.8, battery=70→0.7
    // weighted = 0.80*0.40 + 0.0*0.35 + 0.70*0.25 = 0.32+0+0.175 = 0.495 → 50
    const score = computeRecovery(80, 10, 40, 70, 70)
    expect(score).toBe(50)
  })

  it('hrv far below band (beyond band width) → hrv component = 0', () => {
    // hrv=0, dist=40 > bandWidth=30 → max(0, negative) = 0
    const score = computeRecovery(80, 0, 40, 70, 70)
    expect(score).toBe(50) // same as one full band width below
  })

  it('reweights when HRV is missing', () => {
    // weights: sleep=0.40, battery=0.25 → total=0.65
    // sleep=80→0.80*(0.40/0.65), battery=70→0.70*(0.25/0.65)
    const score = computeRecovery(80, null, null, null, 70)
    const expected = Math.round((0.80 * (0.40 / 0.65) + 0.70 * (0.25 / 0.65)) * 100)
    expect(score).toBe(expected)
  })

  it('reweights when battery is missing', () => {
    // weights: sleep=0.40, hrv=0.35 → total=0.75
    // hrv=55 in [40,70] → hrv_value=0.8
    // weighted = 0.80*(0.40/0.75) + 0.8*(0.35/0.75) = 0.8 → 80
    const score = computeRecovery(80, 55, 40, 70, null)
    const expected = Math.round((0.80 * (0.40 / 0.75) + HRV_55_IN_40_70 * (0.35 / 0.75)) * 100)
    expect(score).toBe(expected)
    expect(score).toBe(80)
  })

  it('returns null when all inputs are null', () => {
    expect(computeRecovery(null, null, null, null, null)).toBeNull()
  })

  it('returns null when all inputs are undefined', () => {
    expect(computeRecovery(undefined, undefined, undefined, undefined, undefined)).toBeNull()
  })

  it('clamps sleep score above 100', () => {
    const score = computeRecovery(120, null, null, null, null)
    expect(score).toBe(100)
  })
})
