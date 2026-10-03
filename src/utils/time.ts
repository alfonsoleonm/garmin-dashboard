/**
 * Parse a sleep_start / sleep_end value that may be either:
 *   - epoch milliseconds (number or numeric string, e.g. 1700000000000)
 *   - an ISO 8601 string (e.g. "2024-11-14T22:30:00")
 * Returns a Date, or null if the value is absent or unparseable.
 */
export function parseSleepTime(value: number | string | null | undefined): Date | null {
  if (value == null) return null

  if (typeof value === 'number') {
    const d = new Date(value)
    return isNaN(d.getTime()) ? null : d
  }

  // Numeric string → treat as epoch ms
  const asNum = Number(value)
  if (!isNaN(asNum) && String(asNum) === value.trim()) {
    const d = new Date(asNum)
    return isNaN(d.getTime()) ? null : d
  }

  // ISO string
  const d = new Date(value)
  return isNaN(d.getTime()) ? null : d
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}
