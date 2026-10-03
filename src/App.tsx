import { useEffect } from 'react'
import { NavBar, type Tab } from './components/NavBar'
import { TodayPage } from './pages/TodayPage'
import { TrendsPage } from './pages/TrendsPage'
import { SettingsPage } from './pages/SettingsPage'
import { useSettings } from './hooks/useSettings'
import { useGarminData } from './hooks/useGarminData'
import { useState } from 'react'

export default function App() {
  const [tab, setTab] = useState<Tab>('today')
  const [settings, updateSettings, clearSettings] = useSettings()

  const { data, fetchState, errorMessage, needsReauth, refresh } = useGarminData(
    settings,
    (iso) => updateSettings({ lastFetch: iso }),
  )

  // Auto-fetch on mount and when settings change (key/url/demo)
  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.apiKey, settings.baseUrl, settings.demoMode])

  // Redirect to settings on auth error
  useEffect(() => {
    if (needsReauth) setTab('settings')
  }, [needsReauth])

  const isOffline = fetchState === 'error' && data != null
  const isLoading = fetchState === 'loading' && data == null
  const isDemo = settings.demoMode || !settings.apiKey

  return (
    <div className="app">
      {isLoading ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="spinner" role="status" aria-label="Loading" />
        </div>
      ) : (
        <>
          {tab === 'today' && (
            <TodayPage
              data={data}
              isDemo={isDemo}
              isOffline={isOffline}
              needsReauth={needsReauth}
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
          {fetchState === 'error' && errorMessage && !isOffline && (
            <div
              style={{
                position: 'fixed', top: 'var(--safe-top)', left: 0, right: 0,
                padding: '12px 16px',
                background: 'rgba(224,92,92,0.15)',
                borderBottom: '1px solid rgba(224,92,92,0.3)',
                color: 'var(--color-red)',
                fontSize: 13,
                zIndex: 200,
              }}
            >
              {errorMessage}
            </div>
          )}
        </>
      )}
      <NavBar active={tab} onChange={setTab} />
    </div>
  )
}
