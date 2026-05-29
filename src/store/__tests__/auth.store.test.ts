import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useAuthStore, isStaffUser, AUTH_TOKEN_KEY } from '@/store/auth.store'
import { makeUser } from '@/test/fixtures/user.factory'
import type { AxiosResponse } from 'axios'

const apiStub = vi.hoisted(() => ({ post: vi.fn() }))

vi.mock('@/api/api.client', () => ({
  default: apiStub,
}))

const adminResponse: AxiosResponse = {
  data: {
    user: { id: 1, name: 'Admin', email: 'admin@coffee.com', role: 'admin' },
    access_token: 'test-access-token',
    refresh_token: 'refresh-token',
    token_type: 'bearer',
  },
  status: 200, statusText: 'OK', headers: {}, config: {} as AxiosResponse['config'],
}

beforeEach(() => {
  localStorage.clear()
  useAuthStore.setState({ user: null, token: null, isAuthenticated: false })
  apiStub.post.mockResolvedValue(adminResponse)
})

describe('isStaffUser()', () => {
  it('ADMIN → true', () => expect(isStaffUser(makeUser({ role: 'ADMIN' }))).toBe(true))
  it('EMPLOYEE → true', () => expect(isStaffUser(makeUser({ role: 'EMPLOYEE' }))).toBe(true))
  it('CUSTOMER → false', () => expect(isStaffUser(makeUser({ role: 'CUSTOMER' }))).toBe(false))
  it('null → false', () => expect(isStaffUser(null)).toBe(false))
  it('undefined → false', () => expect(isStaffUser(undefined)).toBe(false))
})

describe('login()', () => {
  it('sets isAuthenticated, token, user on success', async () => {
    await useAuthStore.getState().login({ email: 'admin@coffee.com', password: 'pass' })
    const { isAuthenticated, token, user } = useAuthStore.getState()
    expect(isAuthenticated).toBe(true)
    expect(token).toBe('test-access-token')
    expect(user).not.toBeNull()
  })

  it('normalizes "admin" → "ADMIN"', async () => {
    await useAuthStore.getState().login({ email: 'admin@coffee.com', password: 'pass' })
    expect(useAuthStore.getState().user?.role).toBe('ADMIN')
  })

  it('normalizes "employee" → "EMPLOYEE"', async () => {
    apiStub.post.mockResolvedValueOnce({
      ...adminResponse,
      data: { user: { id: 2, name: 'Emp', email: 'emp@c.com', role: 'employee' }, access_token: 'emp-token', refresh_token: 'r', token_type: 'bearer' },
    })
    await useAuthStore.getState().login({ email: 'emp@c.com', password: 'p' })
    expect(useAuthStore.getState().user?.role).toBe('EMPLOYEE')
  })

  it('normalizes "client" → "CUSTOMER"', async () => {
    apiStub.post.mockResolvedValueOnce({
      ...adminResponse,
      data: { user: { id: 3, name: 'Client', email: 'c@c.com', role: 'client' }, access_token: 'client-token', refresh_token: 'r', token_type: 'bearer' },
    })
    await useAuthStore.getState().login({ email: 'c@c.com', password: 'p' })
    expect(useAuthStore.getState().user?.role).toBe('CUSTOMER')
  })

  it('unknown role → uppercase fallback', async () => {
    apiStub.post.mockResolvedValueOnce({
      ...adminResponse,
      data: { user: { id: 99, name: 'X', email: 'x@x.com', role: 'superadmin' }, access_token: 'tok', refresh_token: 'r', token_type: 'bearer' },
    })
    await useAuthStore.getState().login({ email: 'x@x.com', password: 'p' })
    expect(useAuthStore.getState().user?.role).toBe('SUPERADMIN')
  })

  it('coerces user.id to string', async () => {
    await useAuthStore.getState().login({ email: 'admin@coffee.com', password: 'pass' })
    expect(typeof useAuthStore.getState().user?.id).toBe('string')
  })

  it('forces user.active = true', async () => {
    await useAuthStore.getState().login({ email: 'admin@coffee.com', password: 'pass' })
    expect(useAuthStore.getState().user?.active).toBe(true)
  })

  it('persists token to localStorage', async () => {
    await useAuthStore.getState().login({ email: 'admin@coffee.com', password: 'pass' })
    expect(localStorage.getItem(AUTH_TOKEN_KEY)).toBe('test-access-token')
  })

  it('throws on 401 and keeps state null', async () => {
    apiStub.post.mockRejectedValueOnce({ response: { status: 401, data: { detail: 'Credenciales incorrectas' } }, isAxiosError: true })
    await expect(useAuthStore.getState().login({ email: 'bad@bad.com', password: 'wrong' })).rejects.toBeDefined()
    expect(useAuthStore.getState().user).toBeNull()
    expect(useAuthStore.getState().isAuthenticated).toBe(false)
  })

  it('throws on network error and keeps state null', async () => {
    apiStub.post.mockRejectedValueOnce(new Error('Network Error'))
    await expect(useAuthStore.getState().login({ email: 'a@a.com', password: 'p' })).rejects.toBeDefined()
    expect(useAuthStore.getState().isAuthenticated).toBe(false)
  })
})

describe('logout()', () => {
  beforeEach(async () => {
    await useAuthStore.getState().login({ email: 'admin@coffee.com', password: 'pass' })
  })

  it('clears user', () => { useAuthStore.getState().logout(); expect(useAuthStore.getState().user).toBeNull() })
  it('clears token', () => { useAuthStore.getState().logout(); expect(useAuthStore.getState().token).toBeNull() })
  it('sets isAuthenticated to false', () => { useAuthStore.getState().logout(); expect(useAuthStore.getState().isAuthenticated).toBe(false) })
  it('removes token from localStorage', () => {
    expect(localStorage.getItem(AUTH_TOKEN_KEY)).toBe('test-access-token')
    useAuthStore.getState().logout()
    expect(localStorage.getItem(AUTH_TOKEN_KEY)).toBeNull()
  })
  it('is idempotent', () => {
    useAuthStore.getState().logout()
    expect(() => useAuthStore.getState().logout()).not.toThrow()
    expect(useAuthStore.getState().isAuthenticated).toBe(false)
  })
})

describe('setAuth()', () => {
  it('sets user, token, isAuthenticated', () => {
    const user = makeUser({ role: 'EMPLOYEE' })
    useAuthStore.getState().setAuth(user, 'direct-token')
    const state = useAuthStore.getState()
    expect(state.user).toEqual(user)
    expect(state.token).toBe('direct-token')
    expect(state.isAuthenticated).toBe(true)
  })

  it('persists token to localStorage', () => {
    useAuthStore.getState().setAuth(makeUser(), 'ls-token')
    expect(localStorage.getItem(AUTH_TOKEN_KEY)).toBe('ls-token')
  })
})

describe('localStorage unavailable', () => {
  it('login succeeds silently when setItem throws', async () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new DOMException('QuotaExceededError') })
    await expect(useAuthStore.getState().login({ email: 'admin@coffee.com', password: 'pass' })).resolves.not.toThrow()
    vi.restoreAllMocks()
  })

  it('logout succeeds silently when removeItem throws', async () => {
    await useAuthStore.getState().login({ email: 'admin@coffee.com', password: 'pass' })
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => { throw new DOMException('SecurityError') })
    expect(() => useAuthStore.getState().logout()).not.toThrow()
    vi.restoreAllMocks()
  })
})
