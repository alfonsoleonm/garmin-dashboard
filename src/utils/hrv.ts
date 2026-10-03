/**
 * Returns a CSS variable for the HRV value color:
 *   green  → inside baseline band [low, high]
 *   amber  → outside band by ≤ half the band width
 *   red    → outside band by > half the band width
 * Returns neutral text color when baseline data is unavailable.
 */
export function hrvColor(
  avgMs: number | null | undefined,
  baselineLow: number | null | undefined,
  baselineHigh: number | null | undefined,
): string {
  if (avgMs == null || baselineLow == null || baselineHigh == null || baselineHigh <= baselineLow) {
    return 'var(--color-text)'
  }
  if (avgMs >= baselineLow && avgMs <= baselineHigh) {
    return 'var(--color-green)'
  }
  const bandWidth = baselineHigh - baselineLow
  const threshold = bandWidth / 2
  const distance = avgMs < baselineLow ? baselineLow - avgMs : avgMs - baselineHigh
  return distance <= threshold ? 'var(--color-amber)' : 'var(--color-red)'
}

// ── Feedback mapping ──────────────────────────────────────────────────────────

const FEEDBACK_MAP: Record<string, string> = {
  HRV_BALANCED_1: 'Your HRV is within your baseline — you are well recovered.',
  HRV_BALANCED_2: 'Your HRV is within your baseline — good recovery.',
  HRV_BALANCED_3: 'Your HRV is at the top of your baseline — excellent recovery.',
  HRV_LOW_1: 'Your HRV is below your baseline — consider extra rest today.',
  HRV_LOW_2: 'Your HRV is significantly below baseline — prioritise recovery.',
  HRV_UNBALANCED_1: 'Your HRV has been variable — monitor your stress and sleep.',
  HRV_UNBALANCED_2: 'Your HRV has been notably variable — ease your training load.',
  HRV_POOR_1: 'Your HRV indicates poor recovery — rest is advised.',
  HRV_POOR_2: 'Your HRV indicates very poor recovery — prioritise rest.',
}

// Prefix fallback for unknown variant numbers (e.g. HRV_BALANCED_99)
const FEEDBACK_PREFIX_MAP: [prefix: string, text: string][] = [
  ['HRV_BALANCED', 'Your HRV is within your baseline.'],
  ['HRV_LOW', 'Your HRV is below your baseline.'],
  ['HRV_UNBALANCED', 'Your HRV has been variable recently.'],
  ['HRV_POOR', 'Your HRV indicates poor recovery.'],
]

// Human-readable fallbacks for the status field
const STATUS_FRIENDLY: Record<string, string> = {
  BALANCED: 'HRV is balanced.',
  LOW: 'HRV is below baseline.',
  UNBALANCED: 'HRV is variable.',
  POOR: 'HRV indicates poor recovery.',
}

/**
 * Maps Garmin HRV feedback codes to friendly sentences.
 *
 * Rules (in order):
 *   1. feedback doesn't start with "HRV_" → it's already human-readable, return as-is
 *   2. Known exact code (e.g. HRV_BALANCED_1) → mapped sentence
 *   3. Unknown code with known prefix (e.g. HRV_BALANCED_99) → prefix fallback
 *   4. Completely unknown code → fall through to status
 *   5. Known status string → friendly label
 *   6. Nothing useful available → null
 *
 * Raw codes are never rendered verbatim.
 */
export function formatHrvFeedback(
  feedback: string | null | undefined,
  status: string | null | undefined,
): string | null {
  if (feedback) {
    if (!feedback.startsWith('HRV_')) return feedback

    if (feedback in FEEDBACK_MAP) return FEEDBACK_MAP[feedback]

    for (const [prefix, text] of FEEDBACK_PREFIX_MAP) {
      if (feedback.startsWith(prefix)) return text
    }
    // Unknown HRV_ code — fall through to status
  }

  if (status) {
    return STATUS_FRIENDLY[status.toUpperCase()] ?? null
  }

  return null
}
