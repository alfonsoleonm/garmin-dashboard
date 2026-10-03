import { describe, it, expect } from 'vitest'
import { hrvColor, formatHrvFeedback } from './hrv'

describe('hrvColor', () => {
  // baseline [40, 70], bandWidth=30, threshold=15
  const L = 40, H = 70

  it('returns green when HRV is inside the band', () => {
    expect(hrvColor(55, L, H)).toBe('var(--color-green)')
    expect(hrvColor(40, L, H)).toBe('var(--color-green)') // at lower boundary
    expect(hrvColor(70, L, H)).toBe('var(--color-green)') // at upper boundary
  })

  it('returns amber when HRV is slightly below (distance ≤ half band width)', () => {
    expect(hrvColor(30, L, H)).toBe('var(--color-amber)') // distance=10 ≤ 15
    expect(hrvColor(25, L, H)).toBe('var(--color-amber)') // distance=15 = threshold
  })

  it('returns red when HRV is far below (distance > half band width)', () => {
    expect(hrvColor(24, L, H)).toBe('var(--color-red)') // distance=16 > 15
    expect(hrvColor(0,  L, H)).toBe('var(--color-red)')
  })

  it('returns amber when HRV is slightly above (distance ≤ half band width)', () => {
    expect(hrvColor(80, L, H)).toBe('var(--color-amber)') // distance=10 ≤ 15
    expect(hrvColor(85, L, H)).toBe('var(--color-amber)') // distance=15 = threshold
  })

  it('returns red when HRV is far above (distance > half band width)', () => {
    expect(hrvColor(86, L, H)).toBe('var(--color-red)') // distance=16 > 15
  })

  it('returns neutral text color when any baseline value is null', () => {
    expect(hrvColor(55, null, 70)).toBe('var(--color-text)')
    expect(hrvColor(55, 40, null)).toBe('var(--color-text)')
    expect(hrvColor(null, 40, 70)).toBe('var(--color-text)')
  })

  it('returns neutral text color when band is degenerate (low >= high)', () => {
    expect(hrvColor(55, 70, 40)).toBe('var(--color-text)')
    expect(hrvColor(55, 50, 50)).toBe('var(--color-text)')
  })
})

describe('formatHrvFeedback', () => {
  it('returns human-readable feedback string unchanged when it lacks the HRV_ prefix', () => {
    const text = 'Your HRV is within your baseline range.'
    expect(formatHrvFeedback(text, 'BALANCED')).toBe(text)
  })

  it('maps a known exact code to a friendly sentence', () => {
    expect(formatHrvFeedback('HRV_BALANCED_1', null)).toContain('within your baseline')
    expect(formatHrvFeedback('HRV_LOW_1', null)).toContain('below your baseline')
    expect(formatHrvFeedback('HRV_UNBALANCED_1', null)).toContain('variable')
    expect(formatHrvFeedback('HRV_POOR_1', null)).toContain('poor recovery')
  })

  it('uses prefix fallback for unknown variant numbers', () => {
    expect(formatHrvFeedback('HRV_BALANCED_99', null)).toBe('Your HRV is within your baseline.')
    expect(formatHrvFeedback('HRV_LOW_99', null)).toBe('Your HRV is below your baseline.')
  })

  it('falls back to status label when the code is completely unknown', () => {
    expect(formatHrvFeedback('HRV_UNKNOWN_FUTURE_CODE', 'BALANCED')).toBe('HRV is balanced.')
    expect(formatHrvFeedback('HRV_UNKNOWN_FUTURE_CODE', 'LOW')).toBe('HRV is below baseline.')
  })

  it('falls back to status when feedback is null', () => {
    expect(formatHrvFeedback(null, 'BALANCED')).toBe('HRV is balanced.')
    expect(formatHrvFeedback(null, 'POOR')).toBe('HRV indicates poor recovery.')
  })

  it('returns null when status is also unknown', () => {
    expect(formatHrvFeedback('HRV_FUTURE_UNRECOGNISED', 'NEWSTATUS')).toBeNull()
  })

  it('returns null when both inputs are null', () => {
    expect(formatHrvFeedback(null, null)).toBeNull()
    expect(formatHrvFeedback(undefined, undefined)).toBeNull()
  })

  it('status comparison is case-insensitive', () => {
    expect(formatHrvFeedback(null, 'balanced')).toBe('HRV is balanced.')
    expect(formatHrvFeedback(null, 'Unbalanced')).toBe('HRV is variable.')
  })
})
