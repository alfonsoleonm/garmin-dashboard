import { MetricCard } from './MetricCard'
import { formatDuration } from '../utils/time'
import type { Activity } from '../types/garmin'

interface Props {
  activities: Activity[] | null | undefined
}

function activityIcon(type: string | null | undefined): string {
  const t = (type ?? '').toUpperCase()
  if (t.includes('RUN')) return '🏃'
  if (t.includes('CYCL') || t.includes('BIKE')) return '🚴'
  if (t.includes('SWIM')) return '🏊'
  if (t.includes('WALK')) return '🚶'
  if (t.includes('STRENGTH') || t.includes('WEIGHT')) return '🏋️'
  if (t.includes('HIKE')) return '🥾'
  if (t.includes('YOGA')) return '🧘'
  return '⚡'
}

function formatType(type: string | null | undefined): string {
  if (!type) return 'Activity'
  return type
    .split('_')
    .map(w => w.charAt(0) + w.slice(1).toLowerCase())
    .join(' ')
}

export function ActivitiesCard({ activities }: Props) {
  if (!activities || activities.length === 0) {
    return <MetricCard title="Today's Activities"><p className="no-data">No activities today</p></MetricCard>
  }

  return (
    <MetricCard title="Today's Activities">
      {activities.map((act, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '10px 0',
            borderBottom: i < activities.length - 1 ? '1px solid var(--color-border)' : 'none',
          }}
        >
          <span style={{ fontSize: 24 }} role="img" aria-label={formatType(act.type)}>
            {activityIcon(act.type)}
          </span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{formatType(act.type)}</div>
            <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>
              {act.duration_s != null && formatDuration(act.duration_s)}
              {act.average_hr != null && ` · ${act.average_hr} bpm avg`}
              {act.calories != null && ` · ${act.calories} kcal`}
            </div>
          </div>
          {act.aerobic_te != null && (
            <div style={{ textAlign: 'right', fontSize: 11, color: 'var(--color-text-secondary)' }}>
              <div>Aerobic TE</div>
              <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--color-text)' }}>
                {act.aerobic_te.toFixed(1)}
              </div>
            </div>
          )}
        </div>
      ))}
    </MetricCard>
  )
}
