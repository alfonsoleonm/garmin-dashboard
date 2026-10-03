import { MetricCard } from './MetricCard'
import { formatDuration, parseSleepTime, formatTime } from '../utils/time'
import type { SleepNight } from '../types/garmin'

interface Props {
  sleep: SleepNight | null | undefined
}

const STAGE_COLORS = {
  deep: '#4a9eff',
  rem: '#a78bfa',
  light: '#94a3b8',
  awake: '#4b5563',
}

export function SleepStagesCard({ sleep }: Props) {
  if (!sleep) return <MetricCard title="Sleep"><p className="no-data">No sleep data</p></MetricCard>

  const {
    deep_sleep_seconds, light_sleep_seconds, rem_sleep_seconds, awake_seconds,
    sleep_score, sleep_score_qualifier, sleep_hours,
    sleep_start, sleep_end,
  } = sleep

  const total = (deep_sleep_seconds ?? 0) + (light_sleep_seconds ?? 0) + (rem_sleep_seconds ?? 0) + (awake_seconds ?? 0)

  const startDate = parseSleepTime(sleep_start)
  const endDate = parseSleepTime(sleep_end)

  const stages: { label: string; seconds: number | null | undefined; color: string }[] = [
    { label: 'Deep', seconds: deep_sleep_seconds, color: STAGE_COLORS.deep },
    { label: 'REM', seconds: rem_sleep_seconds, color: STAGE_COLORS.rem },
    { label: 'Light', seconds: light_sleep_seconds, color: STAGE_COLORS.light },
    { label: 'Awake', seconds: awake_seconds, color: STAGE_COLORS.awake },
  ]

  return (
    <MetricCard title="Sleep">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 10 }}>
        <div>
          <span className="metric-large">{sleep_hours != null ? sleep_hours.toFixed(1) : '—'}</span>
          <span className="metric-unit">h</span>
        </div>
        <div style={{ textAlign: 'right' }}>
          {sleep_score != null && (
            <div style={{ fontSize: 22, fontWeight: 700, color: sleep_score >= 80 ? 'var(--color-green)' : sleep_score >= 60 ? 'var(--color-amber)' : 'var(--color-red)' }}>
              {sleep_score}
              <span style={{ fontSize: 11, color: 'var(--color-text-secondary)', fontWeight: 400, marginLeft: 4 }}>
                {sleep_score_qualifier ?? 'score'}
              </span>
            </div>
          )}
          {startDate && endDate && (
            <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 2 }}>
              {formatTime(startDate)} – {formatTime(endDate)}
            </div>
          )}
        </div>
      </div>

      {/* Stages bar */}
      {total > 0 && (
        <div className="stages-bar">
          {stages.map(s => s.seconds ? (
            <div
              key={s.label}
              style={{ flex: s.seconds / total, background: s.color, borderRadius: 3 }}
              title={`${s.label}: ${formatDuration(s.seconds)}`}
            />
          ) : null)}
        </div>
      )}

      {/* Legend */}
      <div className="stages-legend">
        {stages.map(s => (
          <div key={s.label} className="legend-item">
            <div className="legend-dot" style={{ background: s.color }} />
            <span>{s.label}</span>
            <span style={{ marginLeft: 'auto', color: 'var(--color-text)', fontWeight: 600 }}>
              {s.seconds ? formatDuration(s.seconds) : '—'}
            </span>
          </div>
        ))}
      </div>
    </MetricCard>
  )
}
