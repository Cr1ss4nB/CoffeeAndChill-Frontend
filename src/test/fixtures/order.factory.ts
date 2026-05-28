import type { BoardOrder } from '@/hooks/useOrdersBoard'

let _id = 1

export function makeBoardOrder(overrides: Partial<BoardOrder> = {}): BoardOrder {
  return {
    order_id: _id++,
    customer_id: null,
    order_type: 'TABLE',
    status: 'PENDING',
    total_amount: 15000,
    order_date: new Date().toISOString(),
    table_id: 1,
    table_number: null,
    table_code: null,
    notes: null,
    items: [],
    ...overrides,
  }
}

export function resetOrderId() {
  _id = 1
}
