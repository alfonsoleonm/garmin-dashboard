import { MetricCard } from './MetricCard'
import type { BodyBattery } from '../types/garmin'

interface Props {
  battery: BodyBattery | null | undefined
}

export function BodyBatteryCard({ battery }: Props) {
  if (!battery) return <MetricCard title="Body Battery"><p className="no-data">No body battery data</p></MetricCard>

  const { current, highest, lowest, charged, drained } = battery
  const pct = current != null ? Math.min(100, Math.max(0, current)) : null
  const color = pct == null ? 'var(--color-border)'
    : pct >= 67 ? 'var(--color-green)'
    : pct >= 34 ? 'var(--color-amber)'
    : 'var(--color-red)'

  return (
    <MetricCard title="Body Battery">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div>
          <span className="metric-large" style={{ color }}>{pct != null ? pct : '—'}</span>
          <span className="metric-unit">/ 100</span>
        </div>
        <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--color-text-secondary)' }}>
          {highest != null && <div><div>Peak</div><div style={{ fontWeight: 700, color: 'var(--color-text)' }}>{highest}</div></div>}
          {lowest != null && <div><div>Low</div><div style={{ fontWeight: 700, color: 'var(--color-text)' }}>{lowest}</div></div>}
        </div>
      </div>

      {/* Bar */}
      <div style={{ height: 8, background: 'var(--color-surface-2)', borderRadius: 4, overflow: 'hidden' }}>
        {pct != null && (
          <div style={{
            height: '100%',
            width: `${pct}%`,
            background: color,
            borderRadius: 4,
            transition: 'width 0.6s ease',
          }} />
        )}
      </div>

      {(charged != null || drained != null) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 11, color: 'var(--color-text-secondary)' }}>
          {charged != null && <span>+{charged} charged</span>}
          {drained != null && <span>-{drained} drained</span>}
        </div>
      )}
    </MetricCard>
  )
}
