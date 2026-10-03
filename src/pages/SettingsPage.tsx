import { useState, useRef } from 'react'
import { validateBaseUrl, testConnection, type ConnectionTestResult } from '../api/garmin'
import type { Settings } from '../hooks/useSettings'

interface Props {
  settings: Settings
  onUpdate: (patch: Partial<Settings>) => void
  onClear: () => void
}

type TestPhase = 'idle' | 'testing' | 'done'

export function SettingsPage({ settings, onUpdate, onClear }: Props) {
  const [baseUrl, setBaseUrl] = useState(settings.baseUrl)
  const [apiKey, setApiKey] = useState(settings.apiKey)
  const [showKey, setShowKey] = useState(false)
  const [urlError, setUrlError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  // Test connection state
  const [testPhase, setTestPhase] = useState<TestPhase>('idle')
  const [testResult, setTestResult] = useState<ConnectionTestResult | null>(null)
  const [testSlow, setTestSlow] = useState(false)
  const testAbortRef = useRef<AbortController | null>(null)

  function save() {
    setUrlError(null)
    if (baseUrl.trim() && !settings.demoMode) {
      try {
        validateBaseUrl(baseUrl, window.location.origin)
      } catch (err) {
        setUrlError(err instanceof Error ? err.message : 'Invalid URL')
        return
      }
    }
    onUpdate({ baseUrl: baseUrl.trim(), apiKey: apiKey.trim() })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function handleTest() {
    // Cancel an in-flight test
    if (testPhase === 'testing') {
      testAbortRef.current?.abort()
      setTestPhase('idle')
      setTestSlow(false)
      return
    }

    testAbortRef.current?.abort()
    const controller = new AbortController()
    testAbortRef.current = controller

    setTestPhase('testing')
    setTestResult(null)
    setTestSlow(false)

    const timeoutId = setTimeout(() => controller.abort(), 60_000)
    const wakeupId = setTimeout(() => setTestSlow(true), 5_000)

    const result = await testConnection(baseUrl.trim(), apiKey.trim(), controller.signal, window.location.origin)

    clearTimeout(timeoutId)
    clearTimeout(wakeupId)
    setTestSlow(false)
    setTestResult(result)
    setTestPhase('done')
  }

  const canTest = !settings.demoMode && baseUrl.trim().length > 0 && apiKey.trim().length > 0

  const asOf = settings.lastFetch
    ? new Date(settings.lastFetch).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })
    : null

  return (
    <div className="page-content">
      <div className="page-header">
        <div className="page-header-title">Settings</div>
      </div>

      {asOf && (
        <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 16 }}>
          Last fetched: {asOf}
        </p>
      )}

      {/* Demo mode toggle */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="toggle-row">
          <div>
            <div className="toggle-label">Demo mode</div>
            <div className="toggle-desc">Use synthetic data instead of your Garmin API</div>
          </div>
          <label className="toggle">
            <input
              type="checkbox"
              checked={settings.demoMode}
              onChange={e => onUpdate({ demoMode: e.target.checked })}
            />
            <div className="toggle-track" />
            <div className="toggle-thumb" />
          </label>
        </div>
      </div>

      {/* API config */}
      <div className="card">
        <div className="field">
          <label htmlFor="base-url">API Base URL</label>
          <input
            id="base-url"
            name="gd-base-url"
            type="url"
            value={baseUrl}
            onChange={e => { setBaseUrl(e.target.value); setTestPhase('idle'); setTestResult(null) }}
            placeholder="https://your-api.example.com"
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            disabled={settings.demoMode}
          />
          {urlError
            ? <div className="field-error">{urlError}</div>
            : <div className="field-hint">Must use HTTPS (localhost allowed for dev)</div>
          }
        </div>

        <div className="field">
          <label htmlFor="api-key">API Key</label>
          <div style={{ position: 'relative' }}>
            <input
              id="api-key"
              name="gd-api-key"
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={e => { setApiKey(e.target.value); setTestPhase('idle'); setTestResult(null) }}
              placeholder="Enter your API key"
              autoComplete="new-password"
              disabled={settings.demoMode}
              style={{ paddingRight: 44 }}
            />
            <button
              type="button"
              className="btn-icon"
              onClick={() => setShowKey(v => !v)}
              aria-label={showKey ? 'Hide key' : 'Show key'}
              style={{ position: 'absolute', right: 4, top: '50%', transform: 'translateY(-50%)' }}
            >
              {showKey ? '🙈' : '👁'}
            </button>
          </div>
          <div className="field-hint">Stored in localStorage on this device only</div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-primary" onClick={save} style={{ flex: 1 }}>
            {saved ? '✓ Saved' : 'Save'}
          </button>
          <button
            className="btn btn-secondary"
            onClick={handleTest}
            disabled={!canTest && testPhase !== 'testing'}
            aria-label="Test API connection"
            title={!canTest ? 'Enter a URL and API key first' : undefined}
          >
            {testPhase === 'testing' ? 'Cancel' : 'Test connection'}
          </button>
        </div>

        {/* Test connection status */}
        {testPhase === 'testing' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12, fontSize: 13, color: 'var(--color-text-secondary)' }}>
            <div className="spinner spinner-sm" />
            {testSlow ? 'Waking up the server…' : 'Testing connection…'}
          </div>
        )}
        {testPhase === 'done' && testResult && (
          <div
            className={`banner ${testResult.ok ? 'banner-demo' : 'banner-error'}`}
            style={{ marginTop: 12 }}
          >
            {testResult.ok ? '✓' : '✗'} {testResult.message} — {(testResult.elapsedMs / 1000).toFixed(1)}s
          </div>
        )}
      </div>

      {/* Danger zone */}
      <div style={{ marginTop: 24 }}>
        <div className="section-divider">Danger zone</div>
        <div className="card">
          <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 12 }}>
            Clears all stored settings and data from this device.
          </div>
          <button
            className="btn btn-danger"
            style={{ width: '100%' }}
            onClick={() => {
              if (window.confirm('Clear all settings and data?')) onClear()
            }}
          >
            Clear all data
          </button>
        </div>
      </div>
    </div>
  )
}
