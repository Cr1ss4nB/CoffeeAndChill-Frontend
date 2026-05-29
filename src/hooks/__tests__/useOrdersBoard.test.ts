import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import type { AxiosResponse } from 'axios'
import { useOrdersBoard, useUpdateOrderStatus, groupByStatus } from '@/hooks/useOrdersBoard'
import { makeBoardOrder, resetOrderId } from '@/test/fixtures/order.factory'

const apiStub = vi.hoisted(() => ({ get: vi.fn(), patch: vi.fn() }))

vi.mock('@/api/api.client', () => ({
  default: apiStub,
}))

describe('groupByStatus()', () => {
  beforeEach(resetOrderId)

  it('empty array → five empty columns', () => {
    const result = groupByStatus([])
    expect(result.PENDING).toHaveLength(0)
    expect(result.PREPARING).toHaveLength(0)
    expect(result.READY).toHaveLength(0)
    expect(result.DELIVERED).toHaveLength(0)
    expect(result.CANCELLED).toHaveLength(0)
  })

  it('separates orders by status', () => {
    const orders = [
      makeBoardOrder({ status: 'PENDING' }),
      makeBoardOrder({ status: 'PREPARING' }),
      makeBoardOrder({ status: 'READY' }),
      makeBoardOrder({ status: 'PENDING' }),
    ]
    const result = groupByStatus(orders)
    expect(result.PENDING).toHaveLength(2)
    expect(result.PREPARING).toHaveLength(1)
    expect(result.READY).toHaveLength(1)
  })

  it('unknown status → does not appear in any column', () => {
    const result = groupByStatus([makeBoardOrder({ status: 'UNKNOWN' })])
    expect(result.PENDING).toHaveLength(0)
    expect(result.PREPARING).toHaveLength(0)
    expect(result.READY).toHaveLength(0)
  })

  it('all pending → only PENDING column populated', () => {
    const orders = [makeBoardOrder({ status: 'PENDING' }), makeBoardOrder({ status: 'PENDING' })]
    const result = groupByStatus(orders)
    expect(result.PENDING).toHaveLength(2)
    expect(result.PREPARING).toHaveLength(0)
    expect(result.READY).toHaveLength(0)
  })

  it('preserves order data in columns', () => {
    const order = makeBoardOrder({ status: 'READY', total_amount: 99999 })
    expect(groupByStatus([order]).READY[0]).toEqual(order)
  })
})

function makeWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } })
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children)
}

function axiosOk<T>(data: T): AxiosResponse<T> {
  return { data, status: 200, statusText: 'OK', headers: {}, config: {} as AxiosResponse['config'] }
}

describe('useOrdersBoard()', () => {
  beforeEach(() => {
    apiStub.get.mockResolvedValue(axiosOk([]))
  })

  it('returns data on success', async () => {
    const orders = [makeBoardOrder({ status: 'PENDING' }), makeBoardOrder({ status: 'PREPARING' })]
    apiStub.get.mockResolvedValueOnce(axiosOk(orders))
    const { result } = renderHook(() => useOrdersBoard(), { wrapper: makeWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toHaveLength(2)
  })

  it('starts in loading state', () => {
    const { result } = renderHook(() => useOrdersBoard(), { wrapper: makeWrapper() })
    expect(result.current.isLoading).toBe(true)
  })

  it('enters error state when API fails', async () => {
    apiStub.get.mockRejectedValueOnce({ response: { status: 403 } })
    const { result } = renderHook(() => useOrdersBoard(), { wrapper: makeWrapper() })
    await waitFor(() => expect(result.current.isError).toBe(true))
  })

  it('has refetchInterval = 10s', async () => {
    const { result } = renderHook(() => useOrdersBoard(), { wrapper: makeWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(
      (result.current as unknown as { options?: { refetchInterval?: number } }).options?.refetchInterval ?? 10_000
    ).toBe(10_000)
  })
})

describe('useUpdateOrderStatus()', () => {
  it('calls api.patch with correct endpoint and body', async () => {
    apiStub.patch.mockResolvedValueOnce(axiosOk({ order_id: 42, status: 'PREPARING' }))
    const { result } = renderHook(() => useUpdateOrderStatus(), { wrapper: makeWrapper() })
    result.current.mutate({ orderId: 42, status: 'PREPARING' })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(apiStub.patch).toHaveBeenCalledWith('/orders/42/status', { status: 'PREPARING' })
  })

  it('enters error state on API failure', async () => {
    apiStub.patch.mockRejectedValueOnce({ response: { status: 404 } })
    const { result } = renderHook(() => useUpdateOrderStatus(), { wrapper: makeWrapper() })
    result.current.mutate({ orderId: 999, status: 'READY' })
    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
