/**
 * Compute a 0-100 Recovery score from three components (weights sum to 1.0):
 *
 *   sleep   (0.40) = clamp(sleep_score / 100, 0, 1)
 *
 *   hrv     (0.35) = piecewise over the baseline band [L, H]:
 *     hrv ≥ H           → 1.0                              (above band is optimal)
 *     L ≤ hrv < H       → 0.6 + (hrv − L) / (H − L) × 0.4  (0.6 at L, 1.0 at H)
 *     hrv < L (dist=L−hrv) → max(0, 0.6 × (1 − dist / bandWidth))
 *                           (0.6 just below L, 0 at L − bandWidth and further)
 *
 *   battery (0.25) = clamp(body_battery_current / 100, 0, 1)
 *
 * If any input is unavailable, its weight is redistributed proportionally among
 * the remaining components. All unavailable → returns null.
 */
export function computeRecovery(
  sleepScore: number | null | undefined,
  hrvAvgMs: number | null | undefined,
  hrvBaselineLow: number | null | undefined,
  hrvBaselineHigh: number | null | undefined,
  bodyBatteryCurrent: number | null | undefined,
): number | null {
  type Component = { value: number; weight: number }
  const components: Component[] = []

  if (sleepScore != null) {
    components.push({ value: Math.min(Math.max(sleepScore / 100, 0), 1), weight: 0.40 })
  }

  if (
    hrvAvgMs != null &&
    hrvBaselineLow != null &&
    hrvBaselineHigh != null &&
    hrvBaselineHigh > hrvBaselineLow
  ) {
    const L = hrvBaselineLow
    const H = hrvBaselineHigh
    const bandWidth = H - L
    let hrv_value: number
    if (hrvAvgMs >= H) {
      hrv_value = 1.0
    } else if (hrvAvgMs >= L) {
      hrv_value = 0.6 + ((hrvAvgMs - L) / bandWidth) * 0.4
    } else {
      const dist = L - hrvAvgMs
      hrv_value = Math.max(0, 0.6 * (1 - dist / bandWidth))
    }
    components.push({ value: hrv_value, weight: 0.35 })
  }

  if (bodyBatteryCurrent != null) {
    components.push({ value: Math.min(Math.max(bodyBatteryCurrent / 100, 0), 1), weight: 0.25 })
  }

  if (components.length === 0) return null

  const totalWeight = components.reduce((s, c) => s + c.weight, 0)
  const weighted = components.reduce((s, c) => s + c.value * (c.weight / totalWeight), 0)
  return Math.round(Math.min(Math.max(weighted * 100, 0), 100))
}
