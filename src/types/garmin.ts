export interface SleepNight {
  avg_overnight_hrv?: number | null
  avg_sleep_stress?: number | null
  awake_count?: number | null
  awake_seconds?: number | null
  deep_sleep_percent?: number | null
  deep_sleep_seconds?: number | null
  light_sleep_percent?: number | null
  light_sleep_seconds?: number | null
  nap_seconds?: number | null
  rem_sleep_percent?: number | null
  rem_sleep_seconds?: number | null
  sleep_end?: number | string | null
  sleep_hours?: number | null
  sleep_score?: number | null
  sleep_score_qualifier?: string | null
  sleep_seconds?: number | null
  sleep_start?: number | string | null
}

export interface SleepNightWithDate extends SleepNight {
  date: string
}

export interface HRVData {
  last_night_avg_ms?: number | null
  last_night_5min_high_ms?: number | null
  weekly_avg_ms?: number | null
  status?: string | null
  feedback?: string | null
  baseline_balanced_low?: number | null
  baseline_balanced_upper?: number | null
}

export interface BodyBattery {
  current?: number | null
  highest?: number | null
  lowest?: number | null
  charged?: number | null
  drained?: number | null
}

export interface RestingHR {
  bpm?: number | null
  last_7d_avg_bpm?: number | null
}

export interface Activity {
  aerobic_te?: number | null
  anaerobic_te?: number | null
  average_hr?: number | null
  calories?: number | null
  duration_s?: number | null
  max_hr?: number | null
  type?: string | null
}

export interface SleepSection {
  today: SleepNight | null
  trend_7d: SleepNightWithDate[]
}

export interface DashboardResponse {
  date: string
  sleep?: SleepSection | null
  hrv?: HRVData | null
  body_battery?: BodyBattery | null
  resting_hr?: RestingHR | null
  activities?: Record<string, Activity[]> | null
  strain_7d?: Record<string, number> | null
  errors?: Record<string, string>
}
