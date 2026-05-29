import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { InternalAxiosRequestConfig, AxiosResponse } from 'axios'

const authStub = vi.hoisted(() => ({
  token: null as string | null,
  logout: vi.fn(),
}))

vi.mock('@/store/auth.store', () => ({
  useAuthStore: { getState: () => authStub },
}))

const { default: api } = await import('@/api/api.client')

type ReqHandler = { fulfilled?: (c: InternalAxiosRequestConfig) => InternalAxiosRequestConfig }
type ResHandler = { fulfilled?: (r: AxiosResponse) => AxiosResponse; rejected?: (e: unknown) => unknown }

function reqInterceptor() {
  const mgr = api.interceptors.request as unknown as { handlers: ReqHandler[] }
  return mgr.handlers.find(h => h?.fulfilled)!.fulfilled!
}

function resInterceptor() {
  const mgr = api.interceptors.response as unknown as { handlers: ResHandler[] }
  const h = mgr.handlers.find(h => h?.rejected)!
  return { fulfilled: h.fulfilled!, rejected: h.rejected! }
}

beforeEach(() => {
  authStub.token = null
  authStub.logout.mockClear()
})

describe('Request interceptor — token injection', () => {
  it('adds Authorization header when token present', () => {
    authStub.token = 'my-jwt-token'
    const config = { headers: {} } as InternalAxiosRequestConfig
    const result = reqInterceptor()(config)
    expect((result.headers as Record<string, string>).Authorization).toBe('Bearer my-jwt-token')
  })

  it('does not add Authorization header when token is null', () => {
    authStub.token = null
    const config = { headers: {} } as InternalAxiosRequestConfig
    const result = reqInterceptor()(config)
    expect((result.headers as Record<string, unknown>).Authorization).toBeUndefined()
  })

  it('removes Content-Type for FormData', () => {
    authStub.token = null
    const headers = { set: vi.fn() } as unknown as InternalAxiosRequestConfig['headers']
    const config = { headers, data: new FormData() } as InternalAxiosRequestConfig
    reqInterceptor()(config)
    expect(headers.set).toHaveBeenCalledWith('Content-Type', false)
  })
})

describe('Response interceptor — 401 handling', () => {
  it('calls logout when server returns 401', async () => {
    const error = { response: { status: 401 } }
    await expect(resInterceptor().rejected(error)).rejects.toEqual(error)
    expect(authStub.logout).toHaveBeenCalledOnce()
  })

  it('rejects promise after calling logout', async () => {
    await expect(resInterceptor().rejected({ response: { status: 401 } })).rejects.toBeDefined()
  })

  it('does NOT call logout on 403', async () => {
    await expect(resInterceptor().rejected({ response: { status: 403 } })).rejects.toBeDefined()
    expect(authStub.logout).not.toHaveBeenCalled()
  })

  it('does NOT call logout on 500', async () => {
    await expect(resInterceptor().rejected({ response: { status: 500 } })).rejects.toBeDefined()
    expect(authStub.logout).not.toHaveBeenCalled()
  })

  it('passes through 200 responses unchanged', () => {
    const response = { status: 200, data: { message: 'ok' } } as AxiosResponse
    expect(resInterceptor().fulfilled(response)).toBe(response)
    expect(authStub.logout).not.toHaveBeenCalled()
  })
})
