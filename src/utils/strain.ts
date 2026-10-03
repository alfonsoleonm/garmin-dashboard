/**
 * Convert a TRIMP value to a 0-21 Strain score using a power curve:
 *   strain = min(21, 21 * (max(trimp, 0) / 300) ^ 0.77)
 *
 * Reference points: 0 → 0, 100 → ~9.0, 300 → 21, >300 → 21 (clamped)
 * Negative TRIMP is treated as 0.
 */
export function trimpToStrain(trimp: number): number {
  const t = Math.max(trimp, 0)
  return Math.min(21, 21 * Math.pow(t / 300, 0.77))
}
