import { MetricCard } from './MetricCard'
import type { HRVData } from '../types/garmin'

interface Props {
  hrv: HRVData | null | undefined
}

export function HRVCard({ hrv }: Props) {
  if (!hrv) return <MetricCard title="HRV"><p className="no-data">No HRV data</p></MetricCard>

  const { last_night_avg_ms, weekly_avg_ms, baseline_balanced_low, baseline_balanced_upper, status, feedback } = hrv

  // Position of marker as % of a 0-120ms range
  const rangeMin = 0
  const rangeMax = 120
  const bandLeft = baseline_balanced_low != null
    ? `${Math.max(0, ((baseline_balanced_low - rangeMin) / (rangeMax - rangeMin)) * 100)}%`
    : '30%'
  const bandWidth = baseline_balanced_low != null && baseline_balanced_upper != null
    ? `${Math.min(100, ((baseline_balanced_upper - baseline_balanced_low) / (rangeMax - rangeMin)) * 100)}%`
    : '30%'
  const markerLeft = last_night_avg_ms != null
    ? `${Math.min(100, Math.max(0, ((last_night_avg_ms - rangeMin) / (rangeMax - rangeMin)) * 100))}%`
    : null

  const isAbove = last_night_avg_ms != null && baseline_balanced_upper != null && last_night_avg_ms > baseline_balanced_upper
  const isBelow = last_night_avg_ms != null && baseline_balanced_low != null && last_night_avg_ms < baseline_balanced_low
  const markerColor = isAbove ? 'var(--color-green)' : isBelow ? 'var(--color-red)' : 'var(--color-amber)'

  return (
    <MetricCard title="Heart Rate Variability">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 8 }}>
        <div>
          <span className="metric-large" style={{ color: markerColor }}>
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
            style={{ left: markerLeft, background: markerColor }}
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

      {feedback && (
        <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 8 }}>{feedback}</p>
      )}
    </MetricCard>
  )
}
