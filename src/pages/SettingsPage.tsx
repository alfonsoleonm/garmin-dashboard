import { useState } from 'react'
import { validateBaseUrl } from '../api/garmin'
import type { Settings } from '../hooks/useSettings'

interface Props {
  settings: Settings
  onUpdate: (patch: Partial<Settings>) => void
  onClear: () => void
}

export function SettingsPage({ settings, onUpdate, onClear }: Props) {
  const [baseUrl, setBaseUrl] = useState(settings.baseUrl)
  const [apiKey, setApiKey] = useState(settings.apiKey)
  const [showKey, setShowKey] = useState(false)
  const [urlError, setUrlError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  function save() {
    setUrlError(null)
    if (baseUrl.trim() && !settings.demoMode) {
      try {
        validateBaseUrl(baseUrl)
      } catch (err) {
        setUrlError(err instanceof Error ? err.message : 'Invalid URL')
        return
      }
    }
    onUpdate({ baseUrl: baseUrl.trim(), apiKey: apiKey.trim() })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

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
            type="url"
            value={baseUrl}
            onChange={e => setBaseUrl(e.target.value)}
            placeholder="https://your-api.example.com"
            autoComplete="off"
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
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder="Enter your API key"
              autoComplete="off"
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

        <button className="btn btn-primary" onClick={save} style={{ width: '100%' }}>
          {saved ? '✓ Saved' : 'Save'}
        </button>
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
