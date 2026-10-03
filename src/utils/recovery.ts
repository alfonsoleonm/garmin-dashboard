/**
 * Compute a 0-100 Recovery score from three components (weights sum to 1.0):
 *
 *   hrv     (0.50) = piecewise over the baseline band [L, H]:
 *     hrv ≥ H           → 1.0                              (above band is optimal)
 *     L ≤ hrv < H       → 0.6 + (hrv − L) / (H − L) × 0.4  (0.6 at L, 1.0 at H)
 *     hrv < L (dist=L−hrv) → max(0, 0.6 × (1 − dist / bandWidth))
 *                           (0.6 just below L, 0 at L − bandWidth and further)
 *
 *   sleep   (0.30) = clamp(sleep_score / 100, 0, 1)
 *
 *   rhr     (0.20) = based on delta = bpm − 7-day avg:
 *     delta ≤ 0 → 1.0 (at or below average is optimal)
 *     delta ≥ 8 → 0.0 (8 bpm above average is worst)
 *     else      → 1 − delta / 8 (linear)
 *
 * If any input is unavailable, its weight is redistributed proportionally among
 * the remaining components. All unavailable → returns null.
 */
export function computeRecovery(
  sleepScore: number | null | undefined,
  hrvAvgMs: number | null | undefined,
  hrvBaselineLow: number | null | undefined,
  hrvBaselineHigh: number | null | undefined,
  restingHrBpm: number | null | undefined,
  restingHrAvg7d: number | null | undefined,
): number | null {
  type Component = { value: number; weight: number }
  const components: Component[] = []

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
    components.push({ value: hrv_value, weight: 0.50 })
  }

  if (sleepScore != null) {
    components.push({ value: Math.min(Math.max(sleepScore / 100, 0), 1), weight: 0.30 })
  }

  if (restingHrBpm != null && restingHrAvg7d != null) {
    const delta = restingHrBpm - restingHrAvg7d
    const rhr_value = Math.min(Math.max(1 - delta / 8, 0), 1)
    components.push({ value: rhr_value, weight: 0.20 })
  }

  if (components.length === 0) return null

  const totalWeight = components.reduce((s, c) => s + c.weight, 0)
  const weighted = components.reduce((s, c) => s + c.value * (c.weight / totalWeight), 0)
  return Math.round(Math.min(Math.max(weighted * 100, 0), 100))
}
