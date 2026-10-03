import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './App.css'
import App from './App'

// Returns true if the Settings form has values that differ from what's in
// localStorage — meaning the user has typed something unsaved.
function hasUnsavedInput(): boolean {
  const urlInput = document.querySelector<HTMLInputElement>('[name="gd-base-url"]')
  const keyInput = document.querySelector<HTMLInputElement>('[name="gd-api-key"]')
  if (!urlInput && !keyInput) return false
  const storedUrl = localStorage.getItem('gd_base_url') ?? ''
  const storedKey = localStorage.getItem('gd_api_key') ?? ''
  return (urlInput != null && urlInput.value !== storedUrl) ||
         (keyInput != null && keyInput.value !== storedKey)
}

registerSW({
  immediate: true,
  onRegisteredSW(_swUrl, registration) {
    if (!registration) return

    // Re-check for updates whenever the user returns to the tab
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') registration.update()
    })

    // Also poll every 30 minutes while the app is open
    setInterval(() => { registration.update() }, 30 * 60 * 1000)
  },
})

// When a new SW takes over, reload once to activate the new build.
// Skip on first-ever install (hadController starts false) and while the
// user has unsaved Settings input.
if ('serviceWorker' in navigator) {
  let hadController = Boolean(navigator.serviceWorker.controller)
  let reloading = false
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!hadController) { hadController = true; return }
    if (reloading || hasUnsavedInput()) return
    reloading = true
    window.location.reload()
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
