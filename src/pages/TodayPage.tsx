import { RingGauge } from '../components/RingGauge'
import { HRVCard } from '../components/HRVCard'
import { BodyBatteryCard } from '../components/BodyBatteryCard'
import { RestingHRCard } from '../components/RestingHRCard'
import { SleepStagesCard } from '../components/SleepStagesCard'
import { ActivitiesCard } from '../components/ActivitiesCard'
import { PullToRefresh } from '../components/PullToRefresh'
import { computeRecovery } from '../utils/recovery'
import { trimpToStrain } from '../utils/strain'
import type { DashboardResponse } from '../types/garmin'

interface Props {
  data: DashboardResponse | null
  isDemo: boolean
  isOffline: boolean
  isNoData: boolean
  needsReauth: boolean
  slowFetch: boolean
  errorMessage: string | null
  lastFetch: string | null
  onRefresh: () => void
}

export function TodayPage({
  data, isDemo, isOffline, isNoData, needsReauth, slowFetch, errorMessage, lastFetch, onRefresh,
}: Props) {
  const sleep = data?.sleep?.today
  const hrv = data?.hrv
  const battery = data?.body_battery
  const rhr = data?.resting_hr
  const todayStr = data?.date ?? new Date().toISOString().slice(0, 10)
  const todayActivities = data?.activities?.[todayStr] ?? null

  const recovery = computeRecovery(
    sleep?.sleep_score,
    hrv?.last_night_avg_ms,
    hrv?.baseline_balanced_low,
    hrv?.baseline_balanced_upper,
    battery?.highest ?? battery?.current,
  )

  const todayTrimp = data?.strain_7d?.[todayStr]
  const strain = todayTrimp != null ? trimpToStrain(todayTrimp) : null
  const strainPct = strain != null ? (strain / 21) * 100 : null
  const sleepScore = sleep?.sleep_score ?? null

  const asOf = lastFetch
    ? new Date(lastFetch).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null

  return (
    <PullToRefresh onRefresh={onRefresh}>
      {/* Header */}
      <div className="page-header">
        <div className="page-header-title">
          {new Date(todayStr + 'T12:00:00').toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {asOf && !isNoData && <span className="as-of">as of {asOf}</span>}
          {slowFetch && (
            <span style={{ fontSize: 11, color: 'var(--color-amber)' }}>Waking up…</span>
          )}
          <button className="btn-icon" onClick={onRefresh} aria-label="Refresh">↻</button>
        </div>
      </div>

      {/* Banners */}
      {isDemo && (
        <div className="banner banner-demo">Demo mode — connect your API in Settings</div>
      )}
      {needsReauth && (
        <div className="banner banner-error">API key rejected — go to Settings to update it</div>
      )}
      {isOffline && !needsReauth && (
        <div className="banner banner-offline">Offline — showing last fetched data</div>
      )}

      {/* Error state: fetch failed and no real data has ever loaded */}
      {isNoData ? (
        <div className="card" style={{ textAlign: 'center', padding: '32px 16px', marginTop: 16 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>⚠</div>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>Could not load data</div>
          <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 20, lineHeight: 1.5 }}>
            {errorMessage ?? 'Check your API URL and key in Settings, then try again.'}
          </div>
          <button className="btn btn-secondary" onClick={onRefresh}>Try again</button>
        </div>
      ) : (
        <>
          {/* Rings */}
          <div className="rings-row">
            <RingGauge value={recovery} label="Recovery" />
            <RingGauge
              value={strainPct}
              label="Strain"
              size={80}
              strokeWidth={7}
              color="var(--color-blue)"
              centerText={strain != null ? strain.toFixed(1) : undefined}
            />
            <RingGauge value={sleepScore} label="Sleep" size={80} strokeWidth={7} />
          </div>

          {/* Cards */}
          <HRVCard hrv={hrv} />
          <BodyBatteryCard battery={battery} />
          <RestingHRCard rhr={rhr} />
          <SleepStagesCard sleep={sleep} />
          <ActivitiesCard activities={todayActivities} />
        </>
      )}
    </PullToRefresh>
  )
}
