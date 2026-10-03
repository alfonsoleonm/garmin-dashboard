import { MetricCard } from './MetricCard'
import type { RestingHR } from '../types/garmin'

interface Props {
  rhr: RestingHR | null | undefined
}

export function RestingHRCard({ rhr }: Props) {
  if (!rhr) return <MetricCard title="Resting Heart Rate"><p className="no-data">No resting HR data</p></MetricCard>

  const { bpm, last_7d_avg_bpm } = rhr
  const delta = bpm != null && last_7d_avg_bpm != null ? bpm - last_7d_avg_bpm : null
  const deltaColor = delta == null ? undefined : delta <= 0 ? 'var(--color-green)' : 'var(--color-red)'

  return (
    <MetricCard title="Resting Heart Rate">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <span className="metric-large">{bpm != null ? bpm : '—'}</span>
          <span className="metric-unit">bpm</span>
        </div>
        {last_7d_avg_bpm != null && (
          <div style={{ textAlign: 'right', fontSize: 12, color: 'var(--color-text-secondary)' }}>
            <div>7d avg</div>
            <div style={{ fontWeight: 700, color: 'var(--color-text)', fontSize: 16 }}>{last_7d_avg_bpm} bpm</div>
            {delta != null && (
              <div style={{ color: deltaColor, fontWeight: 600, marginTop: 2 }}>
                {delta > 0 ? `+${delta}` : delta} vs avg
              </div>
            )}
          </div>
        )}
      </div>
    </MetricCard>
  )
}
