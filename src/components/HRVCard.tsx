import { MetricCard } from './MetricCard'
import { hrvColor, formatHrvFeedback } from '../utils/hrv'
import type { HRVData } from '../types/garmin'

interface Props {
  hrv: HRVData | null | undefined
}

export function HRVCard({ hrv }: Props) {
  if (!hrv) return <MetricCard title="HRV"><p className="no-data">No HRV data</p></MetricCard>

  const {
    last_night_avg_ms, weekly_avg_ms,
    baseline_balanced_low, baseline_balanced_upper,
    status, feedback,
  } = hrv

  const valueColor = hrvColor(last_night_avg_ms, baseline_balanced_low, baseline_balanced_upper)
  const friendlyFeedback = formatHrvFeedback(feedback, status)

  // Position of band and marker as % of a 0–120 ms display range
  const rangeMin = 0
  const rangeMax = 120
  const toPercent = (v: number) =>
    `${Math.min(100, Math.max(0, ((v - rangeMin) / (rangeMax - rangeMin)) * 100))}%`

  const bandLeft = baseline_balanced_low != null ? toPercent(baseline_balanced_low) : '30%'
  const bandWidth = baseline_balanced_low != null && baseline_balanced_upper != null
    ? `${Math.min(100, ((baseline_balanced_upper - baseline_balanced_low) / (rangeMax - rangeMin)) * 100)}%`
    : '30%'
  const markerLeft = last_night_avg_ms != null ? toPercent(last_night_avg_ms) : null

  return (
    <MetricCard title="Heart Rate Variability">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 8 }}>
        <div>
          <span className="metric-large" style={{ color: valueColor }}>
            {last_night_avg_ms != null ? Math.round(last_night_avg_ms) : '—'}
          </span>
          <span className="metric-unit">ms</span>
          {status && (
            <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 2 }}>
              {status}
            </div>
          )}
        </div>
        {weekly_avg_ms != null && (
          <div style={{ textAlign: 'right', fontSize: 12, color: 'var(--color-text-secondary)' }}>
            <div>7d avg</div>
            <div style={{ fontWeight: 700, color: 'var(--color-text)', fontSize: 16 }}>
              {Math.round(weekly_avg_ms)}ms
            </div>
          </div>
        )}
      </div>

      {/* Baseline band bar */}
      <div className="hrv-bar-container">
        <div className="hrv-band" style={{ left: bandLeft, width: bandWidth }} />
        {markerLeft && (
          <div
            className="hrv-marker"
            style={{ left: markerLeft, background: valueColor }}
            role="img"
            aria-label={`HRV at ${Math.round(last_night_avg_ms!)}ms`}
          />
        )}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--color-text-dim)', marginTop: 4 }}>
        <span>0ms</span>
        {baseline_balanced_low != null && baseline_balanced_upper != null && (
          <span style={{ color: 'var(--color-text-secondary)' }}>
            Baseline {Math.round(baseline_balanced_low)}–{Math.round(baseline_balanced_upper)}ms
          </span>
        )}
        <span>120ms</span>
      </div>

      {friendlyFeedback && (
        <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 8 }}>
          {friendlyFeedback}
        </p>
      )}
    </MetricCard>
  )
}
