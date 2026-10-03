import { describe, it, expect, vi, beforeEach } from 'vitest'
import { validateBaseUrl, fetchDashboard, AuthError, NetworkError } from './garmin'

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
