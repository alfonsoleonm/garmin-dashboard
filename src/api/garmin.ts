import type { DashboardResponse } from '../types/garmin'

export class AuthError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AuthError'
  }
}

export class NetworkError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'NetworkError'
  }
}

export function validateBaseUrl(url: string, selfOrigin?: string): void {
  const trimmed = url.trim()
  if (!trimmed) throw new Error('Base URL is required')
  let parsed: URL
  try {
    parsed = new URL(trimmed)
  } catch {
    throw new Error('Base URL is not a valid URL')
  }
  const isLocalhost =
    parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1'
  if (parsed.protocol !== 'https:' && !isLocalhost) {
    throw new Error('Base URL must use HTTPS (localhost is allowed for development)')
  }
  if (selfOrigin && parsed.origin === selfOrigin) {
    throw new Error("That's this app's own address, enter your API server URL")
  }
}

export async function fetchDashboard(
  baseUrl: string,
  apiKey: string,
  signal?: AbortSignal,
): Promise<DashboardResponse> {
  validateBaseUrl(baseUrl)
  const url = `${baseUrl.replace(/\/$/, '')}/api/dashboard`
  let response: Response
  try {
    response = await fetch(url, {
      headers: { Authorization: `Bearer ${apiKey}` },
      signal,
    })
  } catch (err) {
    // Re-throw AbortError so callers can distinguish timeout from network failure
    if (err instanceof Error && err.name === 'AbortError') throw err
    throw new NetworkError(`Network request failed: ${String(err)}`)
  }
  if (response.status === 401) throw new AuthError('Invalid API key — please check Settings')
  if (!response.ok) throw new NetworkError(`Server error ${response.status}`)
  return response.json() as Promise<DashboardResponse>
}

export type ConnectionErrorKind = 'url' | 'timeout' | 'network' | 'auth' | 'server'

export interface ConnectionTestResult {
  ok: boolean
  elapsedMs: number
  statusCode?: number
  errorKind?: ConnectionErrorKind
  message: string
}

/**
 * One-shot connectivity probe. Returns a structured result; never throws.
 * Never logs or exposes the API key or any response body — only the HTTP status code.
 */
export async function testConnection(
  baseUrl: string,
  apiKey: string,
  signal: AbortSignal,
  selfOrigin?: string,
): Promise<ConnectionTestResult> {
  try {
    validateBaseUrl(baseUrl, selfOrigin)
  } catch (err) {
    return {
      ok: false,
      elapsedMs: 0,
      errorKind: 'url',
      message: err instanceof Error ? err.message : 'Invalid URL',
    }
  }

  const url = `${baseUrl.replace(/\/$/, '')}/api/dashboard`
  const start = Date.now()

  try {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${apiKey}` },
      signal,
    })
    const elapsedMs = Date.now() - start

    if (response.status === 401) {
      return { ok: false, elapsedMs, statusCode: 401, errorKind: 'auth', message: 'HTTP 401 — API key rejected' }
    }
    if (!response.ok) {
      return { ok: false, elapsedMs, statusCode: response.status, errorKind: 'server', message: `HTTP ${response.status}` }
    }
    return { ok: true, elapsedMs, statusCode: response.status, message: `HTTP ${response.status} OK` }
  } catch (err) {
    const elapsedMs = Date.now() - start
    if (err instanceof Error && err.name === 'AbortError') {
      return { ok: false, elapsedMs, errorKind: 'timeout', message: 'Timed out after 60s' }
    }
    return { ok: false, elapsedMs, errorKind: 'network', message: 'Network / CORS error' }
  }
}
