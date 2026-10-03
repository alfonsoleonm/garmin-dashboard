import { describe, it, expect } from 'vitest'
import { trimpToStrain } from './strain'

describe('trimpToStrain', () => {
  it('0 → 0', () => {
    expect(trimpToStrain(0)).toBe(0)
  })

  it('100 → ~9.0 (within ±0.5)', () => {
    const result = trimpToStrain(100)
    expect(result).toBeGreaterThan(8.5)
    expect(result).toBeLessThan(9.5)
  })

  it('300 → 21', () => {
    expect(trimpToStrain(300)).toBe(21)
  })

  it('1000 → 21 (clamped)', () => {
    expect(trimpToStrain(1000)).toBe(21)
  })

  it('negative → 0', () => {
    expect(trimpToStrain(-50)).toBe(0)
  })
})
