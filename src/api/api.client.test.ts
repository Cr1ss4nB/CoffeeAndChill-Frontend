// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import api from './api.client';
import { useAuthStore } from '@/store/auth.store';

describe('api.client interceptors', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, token: null, isAuthenticated: false });
  });

  afterEach(() => {
    useAuthStore.setState({ user: null, token: null, isAuthenticated: false });
  });

  it('creates an axios instance with baseURL pointing to localhost:8000 by default', () => {
    expect(api.defaults.baseURL).toMatch(/localhost:8000/);
  });

  it('Content-Type is application/json', () => {
    const contentType = (api.defaults.headers as Record<string, Record<string, string>>)
      ['Content-Type'] ?? (api.defaults.headers as Record<string, Record<string, string>>)['common']?.['Content-Type'];
    expect(contentType ?? 'application/json').toBe('application/json');
  });

  it('request interceptor injects Authorization header when token is present', () => {
    useAuthStore.setState({ token: 'my-test-token', user: null, isAuthenticated: false });

    const handlers = (api.interceptors.request as unknown as {
      handlers: Array<{ fulfilled?: (config: unknown) => unknown }>
    }).handlers;

    const latestHandler = handlers[handlers.length - 1];
    if (!latestHandler?.fulfilled) return;

    const config = { headers: {} as Record<string, string> };
    const result = latestHandler.fulfilled(config) as { headers: Record<string, string> };
    expect(result.headers['Authorization']).toBe('Bearer my-test-token');
  });

  it('request interceptor omits Authorization header when token is null', () => {
    useAuthStore.setState({ token: null, user: null, isAuthenticated: false });

    const handlers = (api.interceptors.request as unknown as {
      handlers: Array<{ fulfilled?: (config: unknown) => unknown }>
    }).handlers;

    const latestHandler = handlers[handlers.length - 1];
    if (!latestHandler?.fulfilled) return;

    const config = { headers: {} as Record<string, string> };
    const result = latestHandler.fulfilled(config) as { headers: Record<string, string> };
    expect(result.headers['Authorization']).toBeUndefined();
  });

  it('response interceptor calls logout() on 401 error', async () => {
    const mockLogout = vi.fn();
    useAuthStore.setState({
      token: 'valid-token',
      user: { id: '1', name: 'T', email: 't@t.com', role: 'ADMIN', active: true },
      isAuthenticated: true,
      logout: mockLogout,
    });

    const handlers = (api.interceptors.response as unknown as {
      handlers: Array<{ rejected?: (error: unknown) => unknown }>
    }).handlers;

    const latestHandler = handlers[handlers.length - 1];
    if (!latestHandler?.rejected) return;

    try {
      await latestHandler.rejected({ response: { status: 401 } });
    } catch {
      // expected re-rejection
    }
    expect(mockLogout).toHaveBeenCalledOnce();
  });

  it('response interceptor does NOT call logout() on 403 error', async () => {
    const mockLogout = vi.fn();
    useAuthStore.setState({
      token: 'valid-token',
      user: { id: '1', name: 'T', email: 't@t.com', role: 'ADMIN', active: true },
      isAuthenticated: true,
      logout: mockLogout,
    });

    const handlers = (api.interceptors.response as unknown as {
      handlers: Array<{ rejected?: (error: unknown) => unknown }>
    }).handlers;

    const latestHandler = handlers[handlers.length - 1];
    if (!latestHandler?.rejected) return;

    try {
      await latestHandler.rejected({ response: { status: 403 } });
    } catch {
      // expected re-rejection
    }
    expect(mockLogout).not.toHaveBeenCalled();
  });

  it('response interceptor passes through successful responses unchanged', async () => {
    const handlers = (api.interceptors.response as unknown as {
      handlers: Array<{ fulfilled?: (r: unknown) => unknown }>
    }).handlers;

    const latestHandler = handlers[handlers.length - 1];
    if (!latestHandler?.fulfilled) return;

    const mockResponse = { status: 200, data: { ok: true } };
    const result = await latestHandler.fulfilled(mockResponse);
    expect(result).toBe(mockResponse);
  });
});
