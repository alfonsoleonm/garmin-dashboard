import { useEffect, useState } from 'react'
import { NavBar, type Tab } from './components/NavBar'
import { TodayPage } from './pages/TodayPage'
import { TrendsPage } from './pages/TrendsPage'
import { SettingsPage } from './pages/SettingsPage'
import { useSettings } from './hooks/useSettings'
import { useGarminData } from './hooks/useGarminData'

export default function App() {
  const [tab, setTab] = useState<Tab>('today')
  const [settings, updateSettings, clearSettings] = useSettings()

  const { data, dataIsReal, fetchState, errorMessage, needsReauth, slowFetch, refresh } =
    useGarminData(settings, (iso) => updateSettings({ lastFetch: iso }))

  // Auto-fetch on mount and when credentials/mode change
  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.apiKey, settings.baseUrl, settings.demoMode])

  // Redirect to settings on auth error
  useEffect(() => {
    if (needsReauth) setTab('settings')
  }, [needsReauth])

  const isDemo = settings.demoMode || !settings.apiKey
  // Real stale data available — show it with an offline banner
  const isOffline = fetchState === 'error' && dataIsReal
  // Failed with no real data and not in demo — show an error state, not mock data
  const isNoData = !isDemo && !dataIsReal && (fetchState === 'error' || fetchState === 'auth-error')
  const isLoading = fetchState === 'loading' && data == null

  return (
    <div className="app">
      {isLoading ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
          <div className="spinner" role="status" aria-label="Loading" />
          {slowFetch && (
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 13 }}>
              Waking up the server…
            </p>
          )}
        </div>
      ) : (
        <>
          {tab === 'today' && (
            <TodayPage
              data={data}
              isDemo={isDemo}
              isOffline={isOffline}
              isNoData={isNoData}
              needsReauth={needsReauth}
              slowFetch={slowFetch}
              errorMessage={errorMessage}
              lastFetch={settings.lastFetch}
              onRefresh={refresh}
            />
          )}
          {tab === 'trends' && <TrendsPage data={data} />}
          {tab === 'settings' && (
            <SettingsPage
              settings={settings}
              onUpdate={updateSettings}
              onClear={clearSettings}
            />
          )}
        </>
      )}
      <NavBar active={tab} onChange={setTab} />
    </div>
  )
}
