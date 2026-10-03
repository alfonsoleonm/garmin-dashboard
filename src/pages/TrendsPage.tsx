import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts'
import { MetricCard } from '../components/MetricCard'
import { trimpToStrain } from '../utils/strain'
import type { DashboardResponse } from '../types/garmin'

interface Props {
  data: DashboardResponse | null
}

function shortDate(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString([], { weekday: 'short' })
}

const tooltipStyle = {
  backgroundColor: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: 8,
  color: 'var(--color-text)',
  fontSize: 12,
}

export function TrendsPage({ data }: Props) {
  // Sleep trend
  const sleepData = (data?.sleep?.trend_7d ?? []).map(d => ({
    date: shortDate(d.date),
    hours: d.sleep_hours ?? null,
    score: d.sleep_score ?? null,
  }))

  // Strain 7d
  const strainData = Object.entries(data?.strain_7d ?? {})
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, trimp]) => ({
      date: shortDate(date),
      strain: parseFloat(trimpToStrain(trimp).toFixed(1)),
    }))

  // RHR trend — derived from sleep trend avg_overnight_hrv as proxy, or use resting_hr single point
  const rhrPoint = data?.resting_hr
  const rhrData = (data?.sleep?.trend_7d ?? []).map(d => ({
    date: shortDate(d.date),
    hrv: d.avg_overnight_hrv ?? null,
  }))

  const weeklyHRVAvg = data?.hrv?.weekly_avg_ms

  const isEmpty = !data
  if (isEmpty) {
    return (
      <div className="page-content">
        <div className="page-header">
          <div className="page-header-title">Trends</div>
        </div>
        <p className="no-data" style={{ marginTop: 40 }}>No data yet — refresh on the Today tab</p>
      </div>
    )
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <div className="page-header-title">Trends</div>
      </div>

      {/* Sleep hours */}
      <MetricCard title="Sleep Hours (7 days)">
        <ResponsiveContainer width="100%" height={120}>
          <BarChart data={sleepData} barSize={18}>
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis domain={[0, 10]} tick={{ fontSize: 11 }} width={24} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v}h`, 'Sleep']} />
            <ReferenceLine y={7} stroke="var(--color-green)" strokeDasharray="4 4" />
            <Bar dataKey="hours" fill="var(--color-blue)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </MetricCard>

      {/* Sleep score */}
      <MetricCard title="Sleep Score (7 days)">
        <ResponsiveContainer width="100%" height={120}>
          <LineChart data={sleepData}>
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} width={28} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [v, 'Score']} />
            <ReferenceLine y={80} stroke="var(--color-green)" strokeDasharray="4 4" />
            <Line type="monotone" dataKey="score" stroke="var(--color-amber)" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </MetricCard>

      {/* Strain */}
      <MetricCard title="Strain (7 days)">
        <ResponsiveContainer width="100%" height={120}>
          <BarChart data={strainData} barSize={18}>
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis domain={[0, 21]} tick={{ fontSize: 11 }} width={24} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [v, 'Strain']} />
            <Bar dataKey="strain" fill="var(--color-amber)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </MetricCard>

      {/* Overnight HRV */}
      <MetricCard title="Overnight HRV (7 days)">
        <ResponsiveContainer width="100%" height={120}>
          <LineChart data={rhrData}>
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis domain={['auto', 'auto']} tick={{ fontSize: 11 }} width={28} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v}ms`, 'HRV']} />
            {weeklyHRVAvg != null && (
              <ReferenceLine y={weeklyHRVAvg} stroke="var(--color-green)" strokeDasharray="4 4" />
            )}
            <Line type="monotone" dataKey="hrv" stroke="var(--color-green)" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </MetricCard>

      {/* Resting HR single value note */}
      {rhrPoint?.bpm != null && (
        <MetricCard title="Resting Heart Rate">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span className="metric-large">{rhrPoint.bpm}</span>
              <span className="metric-unit">bpm today</span>
            </div>
            {rhrPoint.last_7d_avg_bpm != null && (
              <div style={{ textAlign: 'right', fontSize: 12, color: 'var(--color-text-secondary)' }}>
                <div>7d avg</div>
                <div style={{ fontWeight: 700, color: 'var(--color-text)', fontSize: 18 }}>{rhrPoint.last_7d_avg_bpm} bpm</div>
              </div>
            )}
          </div>
        </MetricCard>
      )}
    </div>
  )
}
