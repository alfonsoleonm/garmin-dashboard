import { useState, useCallback } from 'react'

const KEYS = {
  baseUrl: 'gd_base_url',
  apiKey: 'gd_api_key',
  demoMode: 'gd_demo_mode',
  lastFetch: 'gd_last_fetch',
} as const

export interface Settings {
  baseUrl: string
  apiKey: string
  demoMode: boolean
  lastFetch: string | null
}

type UpdateSettings = (patch: Partial<Settings>) => void
type ClearSettings = () => void

export function useSettings(): [Settings, UpdateSettings, ClearSettings] {
  const [settings, setSettings] = useState<Settings>(() => ({
    baseUrl: localStorage.getItem(KEYS.baseUrl) ?? '',
    apiKey: localStorage.getItem(KEYS.apiKey) ?? '',
    demoMode: localStorage.getItem(KEYS.demoMode) === 'true',
    lastFetch: localStorage.getItem(KEYS.lastFetch),
  }))

  const update = useCallback((patch: Partial<Settings>) => {
    setSettings(prev => {
      const next = { ...prev, ...patch }
      if ('baseUrl' in patch) localStorage.setItem(KEYS.baseUrl, next.baseUrl)
      if ('apiKey' in patch) localStorage.setItem(KEYS.apiKey, next.apiKey)
      if ('demoMode' in patch) localStorage.setItem(KEYS.demoMode, String(next.demoMode))
      if ('lastFetch' in patch && next.lastFetch != null) {
        localStorage.setItem(KEYS.lastFetch, next.lastFetch)
      }
      return next
    })
  }, [])

  const clearAll = useCallback(() => {
    Object.values(KEYS).forEach(k => localStorage.removeItem(k))
    setSettings({ baseUrl: '', apiKey: '', demoMode: false, lastFetch: null })
  }, [])

  return [settings, update, clearAll]
}
