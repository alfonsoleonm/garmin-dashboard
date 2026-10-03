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

export function validateBaseUrl(url: string): void {
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
}

export async function fetchDashboard(
  baseUrl: string,
  apiKey: string,
): Promise<DashboardResponse> {
  validateBaseUrl(baseUrl)
  const url = `${baseUrl.replace(/\/$/, '')}/api/dashboard`
  let response: Response
  try {
    response = await fetch(url, {
      headers: { Authorization: `Bearer ${apiKey}` },
    })
  } catch (err) {
    throw new NetworkError(`Network request failed: ${String(err)}`)
  }
  if (response.status === 401) throw new AuthError('Invalid API key — please check Settings')
  if (!response.ok) throw new NetworkError(`Server error ${response.status}`)
  return response.json() as Promise<DashboardResponse>
}
