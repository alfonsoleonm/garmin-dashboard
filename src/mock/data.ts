import type { DashboardResponse } from '../types/garmin'

const today = new Date().toISOString().slice(0, 10)

function dateOffset(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

export const mockDashboard: DashboardResponse = {
  date: today,
  sleep: {
    today: {
      sleep_score: 72,
      sleep_score_qualifier: 'FAIR',
      sleep_hours: 7.2,
      sleep_seconds: 25920,
      deep_sleep_seconds: 5400,
      deep_sleep_percent: 20.8,
      light_sleep_seconds: 12600,
      light_sleep_percent: 48.6,
      rem_sleep_seconds: 6480,
      rem_sleep_percent: 25.0,
      awake_seconds: 1440,
      awake_count: 4,
      nap_seconds: 0,
      avg_overnight_hrv: 48,
      avg_sleep_stress: 24,
      sleep_start: new Date(new Date().setHours(23, 0, 0, 0) - 86400000).getTime(),
      sleep_end: new Date(new Date().setHours(6, 12, 0, 0)).getTime(),
    },
    trend_7d: [
      { date: dateOffset(-6), sleep_score: 65, sleep_hours: 6.5, avg_overnight_hrv: 41 },
      { date: dateOffset(-5), sleep_score: 78, sleep_hours: 7.8, avg_overnight_hrv: 52 },
      { date: dateOffset(-4), sleep_score: 71, sleep_hours: 7.1, avg_overnight_hrv: 46 },
      { date: dateOffset(-3), sleep_score: 58, sleep_hours: 6.0, avg_overnight_hrv: 38 },
      { date: dateOffset(-2), sleep_score: 80, sleep_hours: 8.1, avg_overnight_hrv: 55 },
      { date: dateOffset(-1), sleep_score: 74, sleep_hours: 7.4, avg_overnight_hrv: 50 },
      { date: today, sleep_score: 72, sleep_hours: 7.2, avg_overnight_hrv: 48 },
    ],
  },
  hrv: {
    last_night_avg_ms: 48,
    last_night_5min_high_ms: 62,
    weekly_avg_ms: 47,
    status: 'BALANCED',
    feedback: 'Your HRV is within your baseline range.',
    baseline_balanced_low: 38,
    baseline_balanced_upper: 58,
  },
  body_battery: {
    current: 68,
    highest: 91,
    lowest: 22,
    charged: 69,
    drained: 46,
  },
  resting_hr: {
    bpm: 54,
    last_7d_avg_bpm: 56,
  },
  activities: {
    [today]: [
      {
        type: 'RUNNING',
        duration_s: 2700,
        calories: 320,
        average_hr: 148,
        max_hr: 172,
        aerobic_te: 3.2,
        anaerobic_te: 0.4,
      },
    ],
  },
  strain_7d: {
    [dateOffset(-6)]: 180,
    [dateOffset(-5)]: 95,
    [dateOffset(-4)]: 210,
    [dateOffset(-3)]: 60,
    [dateOffset(-2)]: 145,
    [dateOffset(-1)]: 290,
    [today]: 120,
  },
}
