import { useState, useCallback, useRef } from 'react'
import { fetchDashboard, AuthError } from '../api/garmin'
import { mockDashboard } from '../mock/data'
import type { DashboardResponse } from '../types/garmin'
import type { Settings } from './useSettings'

export type FetchState = 'idle' | 'loading' | 'success' | 'error' | 'auth-error'

interface GarminDataState {
  data: DashboardResponse | null
  /** True only when data came from a live API response, not demo/mock. */
  dataIsReal: boolean
  fetchState: FetchState
  errorMessage: string | null
  needsReauth: boolean
  /** True after 5s of a pending request — caller shows "Waking up the server…" */
  slowFetch: boolean
}

export function useGarminData(
  settings: Settings,
  onLastFetch: (iso: string) => void,
) {
  const [state, setState] = useState<GarminDataState>({
    data: null,
    dataIsReal: false,
    fetchState: 'idle',
    errorMessage: null,
    needsReauth: false,
    slowFetch: false,
  })
  const abortRef = useRef<AbortController | null>(null)

  const refresh = useCallback(async () => {
    if (settings.demoMode || !settings.apiKey) {
      setState({
        data: mockDashboard,
        dataIsReal: false,
        fetchState: 'success',
        errorMessage: null,
        needsReauth: false,
        slowFetch: false,
      })
      onLastFetch(new Date().toISOString())
      return
    }

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    // 60s hard timeout (Cloud Run cold starts can take up to ~30s)
    const timeoutId = setTimeout(() => controller.abort(), 60_000)
    // After 5s, signal that the server may be cold-starting
    const wakeupId = setTimeout(
      () => setState(prev => ({ ...prev, slowFetch: true })),
      5_000,
    )

    setState(prev => ({
      ...prev,
      fetchState: 'loading',
      errorMessage: null,
      slowFetch: false,
      // Don't carry mock/demo data forward — a failed real request should show
      // an error state, not mock data under an "Offline" banner.
      data: prev.dataIsReal ? prev.data : null,
    }))

    try {
      const data = await fetchDashboard(settings.baseUrl, settings.apiKey, controller.signal)
      clearTimeout(timeoutId)
      clearTimeout(wakeupId)
      setState({
        data,
        dataIsReal: true,
        fetchState: 'success',
        errorMessage: null,
        needsReauth: false,
        slowFetch: false,
      })
      onLastFetch(new Date().toISOString())
    } catch (err) {
      clearTimeout(timeoutId)
      clearTimeout(wakeupId)
      if (err instanceof AuthError) {
        setState(prev => ({
          ...prev,
          fetchState: 'auth-error',
          errorMessage: err.message,
          needsReauth: true,
          slowFetch: false,
        }))
      } else {
        const isTimeout = err instanceof Error && err.name === 'AbortError'
        setState(prev => ({
          ...prev,
          fetchState: 'error',
          errorMessage: isTimeout
            ? 'Request timed out after 60s — server may still be starting up'
            : err instanceof Error ? err.message : 'Unknown error',
          slowFetch: false,
        }))
      }
    }
  }, [settings, onLastFetch])

  return { ...state, refresh }
}
