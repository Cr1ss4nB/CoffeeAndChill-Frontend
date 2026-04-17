// @vitest-environment node
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAuthStore } from './auth.store';

// persist captures localStorage at store-creation (import) time — mock it away
// so the store works without any DOM storage dependency
vi.mock('zustand/middleware', () => ({
  persist: (fn: unknown) => fn,
}));

// Stub localStorage for safeSetToken / safeRemoveToken direct calls
const _storage: Record<string, string> = {};
vi.stubGlobal('localStorage', {
  getItem: (key: string) => _storage[key] ?? null,
  setItem: (key: string, value: string) => { _storage[key] = value; },
  removeItem: (key: string) => { delete _storage[key]; },
  clear: () => { Object.keys(_storage).forEach((k) => delete _storage[k]); },
});

// Mock the API client
vi.mock('@/api/api.client', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  },
}));

describe('auth.store', () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    useAuthStore.setState({ user: null, token: null, isAuthenticated: false });
    localStorage.clear();
  });

  it('initial state is unauthenticated', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('setAuth stores user and token', () => {
    const mockUser = { id: '1', name: 'Test User', email: 'test@test.com', role: 'ADMIN', active: true };
    useAuthStore.getState().setAuth(mockUser, 'test-token-123');

    const state = useAuthStore.getState();
    expect(state.user).toEqual(mockUser);
    expect(state.token).toBe('test-token-123');
    expect(state.isAuthenticated).toBe(true);
  });

  it('setAuth writes token to localStorage', () => {
    const mockUser = { id: '1', name: 'Test User', email: 'test@test.com', role: 'ADMIN', active: true };
    useAuthStore.getState().setAuth(mockUser, 'my-jwt-token');

    expect(localStorage.getItem('coffee-chill:auth-token:v1')).toBe('my-jwt-token');
  });

  it('logout clears user and token', () => {
    const mockUser = { id: '1', name: 'Test User', email: 'test@test.com', role: 'ADMIN', active: true };
    useAuthStore.getState().setAuth(mockUser, 'test-token');

    useAuthStore.getState().logout();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('logout removes token from localStorage', () => {
    useAuthStore.getState().setAuth(
      { id: '1', name: 'Test', email: 't@t.com', role: 'ADMIN', active: true },
      'some-token'
    );
    useAuthStore.getState().logout();

    expect(localStorage.getItem('coffee-chill:auth-token:v1')).toBeNull();
  });

  it('login calls API and normalizes role client→CUSTOMER', async () => {
    const { default: api } = await import('@/api/api.client');
    const mockPost = vi.mocked(api.post);
    mockPost.mockResolvedValueOnce({
      data: {
        access_token: 'jwt-abc',
        refresh_token: 'refresh-xyz',
        user: { id: 10, name: 'Cliente', email: 'c@c.com', role: 'client' },
      },
    });

    await useAuthStore.getState().login({ email: 'c@c.com', password: 'pass' });

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.user?.role).toBe('CUSTOMER');
    expect(state.token).toBe('jwt-abc');
  });

  it('login normalizes role admin→ADMIN', async () => {
    const { default: api } = await import('@/api/api.client');
    const mockPost = vi.mocked(api.post);
    mockPost.mockResolvedValueOnce({
      data: {
        access_token: 'jwt-admin',
        refresh_token: 'refresh',
        user: { id: 1, name: 'Admin', email: 'a@a.com', role: 'admin' },
      },
    });

    await useAuthStore.getState().login({ email: 'a@a.com', password: 'pass' });

    expect(useAuthStore.getState().user?.role).toBe('ADMIN');
  });

  it('login normalizes role employee→EMPLOYEE', async () => {
    const { default: api } = await import('@/api/api.client');
    const mockPost = vi.mocked(api.post);
    mockPost.mockResolvedValueOnce({
      data: {
        access_token: 'jwt-emp',
        refresh_token: 'refresh',
        user: { id: 2, name: 'Emp', email: 'e@e.com', role: 'employee' },
      },
    });

    await useAuthStore.getState().login({ email: 'e@e.com', password: 'pass' });

    expect(useAuthStore.getState().user?.role).toBe('EMPLOYEE');
  });

  it('login throws on API error and keeps state unauthenticated', async () => {
    const { default: api } = await import('@/api/api.client');
    const mockPost = vi.mocked(api.post);
    mockPost.mockRejectedValueOnce(new Error('401 Unauthorized'));

    await expect(
      useAuthStore.getState().login({ email: 'bad@bad.com', password: 'wrong' })
    ).rejects.toThrow();

    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });
});
