import { describe, it, expect } from 'vitest'
import { computeRecovery } from './recovery'

// HRV helper: hrv=55, baseline=[40,70]
// bandWidth=30, t=(55-40)/30=0.5, hrv_value=0.6+0.5*0.4=0.8
const HRV_55_IN_40_70 = 0.8
// RHR at average: bpm=55, avg7d=55 → delta=0 → 1.0
const RHR_AT_AVG = 1.0

describe('computeRecovery', () => {
  it('computes score when all inputs are present (hrv inside band, mid-position)', () => {
    // sleep=80→0.80, hrv=55 in [40,70]→0.8, rhr: bpm=55,avg=55→delta=0→1.0
    // weighted = 0.80*0.30 + 0.8*0.50 + 1.0*0.20 = 0.24+0.40+0.20 = 0.84 → 84
    const score = computeRecovery(80, 55, 40, 70, 55, 55)
    expect(score).toBe(Math.round((0.80 * 0.30 + HRV_55_IN_40_70 * 0.50 + RHR_AT_AVG * 0.20) * 100))
    expect(score).toBe(84)
  })

  it('hrv at band bottom (t=0) → hrv component = 0.6', () => {
    // hrv=40=L in [40,70] → value=0.6+0*0.4=0.6
    // sleep=80→0.8, rhr: delta=0→1.0
    // weighted = 0.80*0.30 + 0.60*0.50 + 1.0*0.20 = 0.24+0.30+0.20 = 0.74 → 74
    const score = computeRecovery(80, 40, 40, 70, 55, 55)
    expect(score).toBe(74)
  })

  it('hrv at band top (t=1) → hrv component = 1.0', () => {
    // hrv=70=H in [40,70] → value=0.6+1*0.4=1.0
    // sleep=80→0.8, rhr: delta=0→1.0
    // weighted = 0.80*0.30 + 1.0*0.50 + 1.0*0.20 = 0.24+0.50+0.20 = 0.94 → 94
    const score = computeRecovery(80, 70, 40, 70, 55, 55)
    expect(score).toBe(94)
  })

  it('hrv above band → hrv component = 1.0 (high HRV is optimal)', () => {
    // hrv=200 > H=70 → 1.0; sleep=100, rhr: delta=0 → all 1.0 → 100
    const score = computeRecovery(100, 200, 40, 70, 55, 55)
    expect(score).toBe(100)
  })

  it('hrv below band by half band width → hrv component = 0.3', () => {
    // hrv=25 < L=40, dist=15=bandWidth/2=15
    // hrv_value = max(0, 0.6*(1-15/30)) = 0.6*0.5 = 0.3
    // sleep=80→0.8, rhr: delta=0→1.0
    // weighted = 0.80*0.30 + 0.30*0.50 + 1.0*0.20 = 0.24+0.15+0.20 = 0.59 → 59
    const score = computeRecovery(80, 25, 40, 70, 55, 55)
    expect(score).toBe(59)
  })

  it('hrv below band by a full band width → hrv component = 0', () => {
    // hrv=10 < L=40, dist=30=bandWidth → hrv_value=max(0, 0.6*(1-30/30))=0
    // sleep=80→0.8, rhr: delta=0→1.0
    // weighted = 0.80*0.30 + 0.0*0.50 + 1.0*0.20 = 0.24+0+0.20 = 0.44 → 44
    const score = computeRecovery(80, 10, 40, 70, 55, 55)
    expect(score).toBe(44)
  })

  it('hrv far below band (beyond band width) → hrv component = 0', () => {
    // hrv=0, dist=40 > bandWidth=30 → max(0, negative) = 0
    const score = computeRecovery(80, 0, 40, 70, 55, 55)
    expect(score).toBe(44) // same as one full band width below
  })

  it('resting HR 4 bpm above 7-day avg → rhr component = 0.5', () => {
    // delta = 59 - 55 = 4, rhr_value = 1 - 4/8 = 0.5
    // sleep=80→0.8, hrv=55→0.8
    // weighted = 0.80*0.30 + 0.8*0.50 + 0.5*0.20 = 0.24+0.40+0.10 = 0.74 → 74
    const score = computeRecovery(80, 55, 40, 70, 59, 55)
    expect(score).toBe(74)
  })

  it('resting HR 8 bpm above 7-day avg → rhr component = 0', () => {
    // delta = 63 - 55 = 8, rhr_value = 0
    // sleep=80→0.8, hrv=55→0.8
    // weighted = 0.80*0.30 + 0.8*0.50 + 0.0*0.20 = 0.24+0.40+0 = 0.64 → 64
    const score = computeRecovery(80, 55, 40, 70, 63, 55)
    expect(score).toBe(64)
  })

  it('resting HR below 7-day avg → rhr component clamped to 1.0', () => {
    // delta = 52 - 55 = -3, rhr_value = clamp(1 - (-3)/8, 0, 1) = clamp(1.375, 0, 1) = 1.0
    const score = computeRecovery(80, 55, 40, 70, 52, 55)
    expect(score).toBe(84) // same as rhr_at_avg case
  })

  it('reweights when HRV is missing', () => {
    // weights: sleep=0.30, rhr=0.20 → total=0.50
    // sleep=80→0.80*(0.30/0.50), rhr: bpm=55,avg=55→1.0*(0.20/0.50)
    const score = computeRecovery(80, null, null, null, 55, 55)
    const expected = Math.round((0.80 * (0.30 / 0.50) + 1.0 * (0.20 / 0.50)) * 100)
    expect(score).toBe(expected)
    expect(score).toBe(88)
  })

  it('reweights when resting HR is missing', () => {
    // weights: hrv=0.50, sleep=0.30 → total=0.80
    // hrv=55 in [40,70] → hrv_value=0.8
    // weighted = 0.8*(0.50/0.80) + 0.80*(0.30/0.80) = 0.80 → 80
    const score = computeRecovery(80, 55, 40, 70, null, null)
    const expected = Math.round((0.80 * (0.30 / 0.80) + HRV_55_IN_40_70 * (0.50 / 0.80)) * 100)
    expect(score).toBe(expected)
    expect(score).toBe(80)
  })

  it('reweights when sleep is missing', () => {
    // weights: hrv=0.50, rhr=0.20 → total=0.70
    // hrv=55→0.8, rhr: bpm=55,avg=55→1.0
    // weighted = 0.8*(0.50/0.70) + 1.0*(0.20/0.70) = (4/7+2/7) = 6/7 ≈ 0.857 → 86
    const score = computeRecovery(null, 55, 40, 70, 55, 55)
    const expected = Math.round((HRV_55_IN_40_70 * (0.50 / 0.70) + RHR_AT_AVG * (0.20 / 0.70)) * 100)
    expect(score).toBe(expected)
    expect(score).toBe(86)
  })

  it('returns null when all inputs are null', () => {
    expect(computeRecovery(null, null, null, null, null, null)).toBeNull()
  })

  it('returns null when all inputs are undefined', () => {
    expect(computeRecovery(undefined, undefined, undefined, undefined, undefined, undefined)).toBeNull()
  })

  it('clamps sleep score above 100', () => {
    const score = computeRecovery(120, null, null, null, null, null)
    expect(score).toBe(100)
  })
})
