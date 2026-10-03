import { describe, it, expect, vi, beforeEach } from 'vitest'
import { validateBaseUrl, fetchDashboard, testConnection, AuthError, NetworkError } from './garmin'

describe('validateBaseUrl', () => {
  it('accepts https URLs', () => {
    expect(() => validateBaseUrl('https://api.example.com')).not.toThrow()
  })

  it('accepts localhost with http', () => {
    expect(() => validateBaseUrl('http://localhost:8080')).not.toThrow()
  })

  it('accepts 127.0.0.1 with http', () => {
    expect(() => validateBaseUrl('http://127.0.0.1:3000')).not.toThrow()
  })

  it('rejects http non-localhost', () => {
    expect(() => validateBaseUrl('http://api.example.com')).toThrow('HTTPS')
  })

  it('rejects empty string', () => {
    expect(() => validateBaseUrl('')).toThrow('required')
  })

  it('rejects invalid URL', () => {
    expect(() => validateBaseUrl('not-a-url')).toThrow()
  })

  it("rejects a URL whose origin matches the app's own origin", () => {
    expect(() =>
      validateBaseUrl('https://example.github.io', 'https://example.github.io'),
    ).toThrow("That's this app's own address")
  })

  it('accepts a URL that has the same host as the app but a different port', () => {
    expect(() =>
      validateBaseUrl('https://example.github.io:8443', 'https://example.github.io'),
    ).not.toThrow()
  })

  it('does not apply self-origin check when selfOrigin is omitted', () => {
    expect(() => validateBaseUrl('https://example.github.io')).not.toThrow()
  })
})

describe('fetchDashboard', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('throws AuthError on 401', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ status: 401, ok: false }))
    await expect(fetchDashboard('https://api.example.com', 'bad-key')).rejects.toBeInstanceOf(AuthError)
  })

  it('throws NetworkError on non-ok response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ status: 500, ok: false }))
    await expect(fetchDashboard('https://api.example.com', 'key')).rejects.toBeInstanceOf(NetworkError)
  })

  it('throws NetworkError on fetch failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))
    await expect(fetchDashboard('https://api.example.com', 'key')).rejects.toBeInstanceOf(NetworkError)
  })

  it('re-throws AbortError so callers can detect timeout', async () => {
    const abortErr = Object.assign(new Error('Aborted'), { name: 'AbortError' })
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(abortErr))
    await expect(fetchDashboard('https://api.example.com', 'key')).rejects.toMatchObject({ name: 'AbortError' })
  })

  it('returns parsed JSON on success', async () => {
    const payload = { date: '2024-01-01' }
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      status: 200,
      ok: true,
      json: () => Promise.resolve(payload),
    }))
    const result = await fetchDashboard('https://api.example.com', 'key')
    expect(result).toEqual(payload)
  })

  it('sends key only in Authorization header, not in URL', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      status: 200,
      ok: true,
      json: () => Promise.resolve({ date: '2024-01-01' }),
    })
    vi.stubGlobal('fetch', mockFetch)
    await fetchDashboard('https://api.example.com', 'my-secret-key')
    const [calledUrl, calledInit] = mockFetch.mock.calls[0] as [string, RequestInit]
    expect(calledUrl).not.toContain('my-secret-key')
    expect((calledInit.headers as Record<string, string>)['Authorization']).toBe('Bearer my-secret-key')
  })
})

describe('testConnection', () => {
  const neverAbort = new AbortController().signal

  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('returns url error for invalid base URL without making a request', async () => {
    const mockFetch = vi.fn()
    vi.stubGlobal('fetch', mockFetch)
    const result = await testConnection('not-a-url', 'key', neverAbort)
    expect(result.ok).toBe(false)
    expect(result.errorKind).toBe('url')
    expect(result.elapsedMs).toBe(0)
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('returns auth error for 401', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ status: 401, ok: false }))
    const result = await testConnection('https://api.example.com', 'bad', neverAbort)
    expect(result.ok).toBe(false)
    expect(result.errorKind).toBe('auth')
    expect(result.statusCode).toBe(401)
  })

  it('returns server error for 500', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ status: 500, ok: false }))
    const result = await testConnection('https://api.example.com', 'key', neverAbort)
    expect(result.ok).toBe(false)
    expect(result.errorKind).toBe('server')
    expect(result.statusCode).toBe(500)
  })

  it('returns ok=true and status code for 200', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ status: 200, ok: true }))
    const result = await testConnection('https://api.example.com', 'key', neverAbort)
    expect(result.ok).toBe(true)
    expect(result.statusCode).toBe(200)
  })

  it('returns timeout error on AbortError', async () => {
    const abortErr = Object.assign(new Error('Aborted'), { name: 'AbortError' })
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(abortErr))
    const result = await testConnection('https://api.example.com', 'key', neverAbort)
    expect(result.ok).toBe(false)
    expect(result.errorKind).toBe('timeout')
  })

  it('returns network error on TypeError', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))
    const result = await testConnection('https://api.example.com', 'key', neverAbort)
    expect(result.ok).toBe(false)
    expect(result.errorKind).toBe('network')
  })

  it('never reads or exposes the response body', async () => {
    const mockJson = vi.fn()
    const mockText = vi.fn()
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ status: 200, ok: true, json: mockJson, text: mockText }))
    await testConnection('https://api.example.com', 'key', neverAbort)
    expect(mockJson).not.toHaveBeenCalled()
    expect(mockText).not.toHaveBeenCalled()
  })

  it('does not include the API key in the request URL', async () => {
    const mockFetch = vi.fn().mockResolvedValue({ status: 200, ok: true })
    vi.stubGlobal('fetch', mockFetch)
    await testConnection('https://api.example.com', 'super-secret', neverAbort)
    const [calledUrl] = mockFetch.mock.calls[0] as [string, RequestInit]
    expect(calledUrl).not.toContain('super-secret')
  })
})
