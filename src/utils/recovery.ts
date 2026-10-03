/**
 * Compute a 0-100 Recovery score from three components:
 *   sleep   (weight 0.40) = sleep_score / 100
 *   hrv     (weight 0.35) = clamp((last_night_avg_ms - baseline_low) / (baseline_upper - baseline_low), 0, 1)
 *   battery (weight 0.25) = body_battery_current / 100
 *
 * If any input is null/undefined, its weight is redistributed proportionally
 * among the remaining available inputs. If all three are null, returns null.
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
    const norm = (hrvAvgMs - hrvBaselineLow) / (hrvBaselineHigh - hrvBaselineLow)
    components.push({ value: Math.min(Math.max(norm, 0), 1), weight: 0.35 })
  }

  if (bodyBatteryCurrent != null) {
    components.push({ value: Math.min(Math.max(bodyBatteryCurrent / 100, 0), 1), weight: 0.25 })
  }

  if (components.length === 0) return null

  const totalWeight = components.reduce((s, c) => s + c.weight, 0)
  const weighted = components.reduce((s, c) => s + c.value * (c.weight / totalWeight), 0)
  return Math.round(Math.min(Math.max(weighted * 100, 0), 100))
}
