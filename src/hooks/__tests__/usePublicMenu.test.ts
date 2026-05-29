import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import {
  getPublicMenu,
  getTableInfo,
  getPublicOrderStatus,
} from '@/services/public.service'
import { usePublicMenu, usePublicOrderStatus, useTableInfo } from '@/hooks/usePublicMenu'

vi.mock('@/services/public.service', () => ({
  getPublicMenu: vi.fn(),
  getTableInfo: vi.fn(),
  getPublicOrderStatus: vi.fn(),
  getPublicTables: vi.fn(),
}))

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  })
  const Wrapper = ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children)
  return { queryClient, Wrapper }
}

class FakeEventSource {
  static instances: FakeEventSource[] = []
  url: string
  onmessage: ((e: { data: string }) => void) | null = null
  onerror: (() => void) | null = null
  close = vi.fn()
  constructor(url: string) {
    this.url = url
    FakeEventSource.instances.push(this)
  }
  simulateMessage(data: unknown) { this.onmessage?.({ data: JSON.stringify(data) }) }
  simulateError() { this.onerror?.() }
}

beforeEach(() => {
  FakeEventSource.instances = []
  vi.stubGlobal('EventSource', FakeEventSource)
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('usePublicMenu()', () => {
  it('fetches menu without category filter', async () => {
    const products = [{ product_id: 1, name: 'Café Latte' }]
    vi.mocked(getPublicMenu).mockResolvedValueOnce(products)
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => usePublicMenu(), { wrapper: Wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(products)
  })

  it('fetches menu with category filter', async () => {
    vi.mocked(getPublicMenu).mockResolvedValueOnce([])
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => usePublicMenu(3), { wrapper: Wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(vi.mocked(getPublicMenu)).toHaveBeenCalledWith(3)
  })

  it('returns error state on failure', async () => {
    vi.mocked(getPublicMenu).mockRejectedValueOnce(new Error('Server Error'))
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => usePublicMenu(), { wrapper: Wrapper })
    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})

describe('useTableInfo()', () => {
  it('fetches table by code', async () => {
    const table = { id: 1, code: 'TBL-01', name: 'Mesa 1' }
    vi.mocked(getTableInfo).mockResolvedValueOnce(table)
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useTableInfo('TBL-01'), { wrapper: Wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toMatchObject({ code: 'TBL-01' })
  })

  it('has retry: false — does not retry on error', async () => {
    let callCount = 0
    vi.mocked(getTableInfo).mockImplementation(async () => {
      callCount++
      throw new Error('Not found')
    })
    const { Wrapper } = makeWrapper()
    const { result } = renderHook(() => useTableInfo('BAD'), { wrapper: Wrapper })
    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(callCount).toBe(1)
  })
})

describe('usePublicOrderStatus()', () => {
  it('does NOT connect EventSource when orderId is null', () => {
    const { Wrapper } = makeWrapper()
    renderHook(() => usePublicOrderStatus(null), { wrapper: Wrapper })
    expect(FakeEventSource.instances).toHaveLength(0)
  })

  it('connects EventSource for valid orderId', () => {
    vi.mocked(getPublicOrderStatus).mockResolvedValue({ order_id: 123, status: 'PENDING' })
    const { Wrapper } = makeWrapper()
    renderHook(() => usePublicOrderStatus(123), { wrapper: Wrapper })
    expect(FakeEventSource.instances).toHaveLength(1)
    expect(FakeEventSource.instances[0].url).toContain('/public/orders/123/stream')
  })

  it('closes EventSource on unmount', () => {
    vi.mocked(getPublicOrderStatus).mockResolvedValue({ order_id: 456, status: 'PENDING' })
    const { Wrapper } = makeWrapper()
    const { unmount } = renderHook(() => usePublicOrderStatus(456), { wrapper: Wrapper })
    const instance = FakeEventSource.instances[0]
    unmount()
    expect(instance.close).toHaveBeenCalledOnce()
  })

  it('SSE message calls queryClient.setQueryData with parsed payload', async () => {
    vi.mocked(getPublicOrderStatus).mockResolvedValue({ order_id: 789, status: 'PENDING' })
    const { queryClient, Wrapper } = makeWrapper()
    const setQueryData = vi.spyOn(queryClient, 'setQueryData')

    const { result } = renderHook(() => usePublicOrderStatus(789), { wrapper: Wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    const instance = FakeEventSource.instances[0]
    await act(async () => { instance.simulateMessage({ order_id: 789, status: 'COMPLETED' }) })

    expect(setQueryData).toHaveBeenCalledWith(
      ['public-order-status', 789],
      { order_id: 789, status: 'COMPLETED' }
    )
  })

  it('SSE error calls invalidateQueries', async () => {
    vi.mocked(getPublicOrderStatus).mockResolvedValue({ order_id: 101, status: 'IN_PROGRESS' })
    const { queryClient, Wrapper } = makeWrapper()
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => usePublicOrderStatus(101), { wrapper: Wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    const instance = FakeEventSource.instances[0]
    await act(async () => instance.simulateError())

    expect(invalidate).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ['public-order-status', 101] })
    )
  })
})
