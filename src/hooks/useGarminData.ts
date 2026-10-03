import { useState, useCallback, useRef } from 'react'
import { fetchDashboard, AuthError } from '../api/garmin'
import { mockDashboard } from '../mock/data'
import type { DashboardResponse } from '../types/garmin'
import type { Settings } from './useSettings'

export type FetchState = 'idle' | 'loading' | 'success' | 'error' | 'auth-error'

interface GarminDataState {
  data: DashboardResponse | null
  fetchState: FetchState
  errorMessage: string | null
  needsReauth: boolean
}

export function useGarminData(
  settings: Settings,
  onLastFetch: (iso: string) => void,
) {
  const [state, setState] = useState<GarminDataState>({
    data: null,
    fetchState: 'idle',
    errorMessage: null,
    needsReauth: false,
  })
  const abortRef = useRef<AbortController | null>(null)

  const refresh = useCallback(async () => {
    if (settings.demoMode || !settings.apiKey) {
      setState({ data: mockDashboard, fetchState: 'success', errorMessage: null, needsReauth: false })
      onLastFetch(new Date().toISOString())
      return
    }

    abortRef.current?.abort()
    abortRef.current = new AbortController()

    setState(prev => ({ ...prev, fetchState: 'loading', errorMessage: null }))
    try {
      const data = await fetchDashboard(settings.baseUrl, settings.apiKey)
      setState({ data, fetchState: 'success', errorMessage: null, needsReauth: false })
      onLastFetch(new Date().toISOString())
    } catch (err) {
      if (err instanceof AuthError) {
        setState(prev => ({
          ...prev,
          fetchState: 'auth-error',
          errorMessage: err.message,
          needsReauth: true,
        }))
      } else {
        setState(prev => ({
          ...prev,
          fetchState: 'error',
          errorMessage: err instanceof Error ? err.message : 'Unknown error',
        }))
      }
    }
  }, [settings, onLastFetch])

  return { ...state, refresh }
}
