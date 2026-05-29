import { describe, it, expect, beforeEach } from 'vitest'
import { useUIStore } from '@/store/ui.store'
import { makeProduct } from '@/test/fixtures/product.factory'

const INITIAL = {
  sidebarOpen: true,
  mobileNavOpen: false,
  cartOpen: false,
  cartItems: [],
  activeOrderId: null,
  tableId: null,
}

beforeEach(() => {
  useUIStore.setState(INITIAL)
})

describe('toggleSidebar()', () => {
  it('false → true', () => {
    useUIStore.setState({ sidebarOpen: false })
    useUIStore.getState().toggleSidebar()
    expect(useUIStore.getState().sidebarOpen).toBe(true)
  })

  it('true → false', () => {
    useUIStore.getState().toggleSidebar()
    expect(useUIStore.getState().sidebarOpen).toBe(false)
  })
})

describe('mobile nav', () => {
  it('setMobileNavOpen(true) opens', () => {
    useUIStore.getState().setMobileNavOpen(true)
    expect(useUIStore.getState().mobileNavOpen).toBe(true)
  })

  it('closeMobileNav() closes', () => {
    useUIStore.setState({ mobileNavOpen: true })
    useUIStore.getState().closeMobileNav()
    expect(useUIStore.getState().mobileNavOpen).toBe(false)
  })

  it('toggleMobileNav() alternates', () => {
    useUIStore.getState().toggleMobileNav()
    expect(useUIStore.getState().mobileNavOpen).toBe(true)
    useUIStore.getState().toggleMobileNav()
    expect(useUIStore.getState().mobileNavOpen).toBe(false)
  })
})

describe('cart open/close', () => {
  it('openCart() sets cartOpen = true', () => {
    useUIStore.getState().openCart()
    expect(useUIStore.getState().cartOpen).toBe(true)
  })

  it('closeCart() sets cartOpen = false', () => {
    useUIStore.setState({ cartOpen: true })
    useUIStore.getState().closeCart()
    expect(useUIStore.getState().cartOpen).toBe(false)
  })

  it('toggleCart() alternates', () => {
    useUIStore.getState().toggleCart()
    expect(useUIStore.getState().cartOpen).toBe(true)
    useUIStore.getState().toggleCart()
    expect(useUIStore.getState().cartOpen).toBe(false)
  })
})

describe('addToCart()', () => {
  it('adds item with default quantity 1', () => {
    const product = makeProduct()
    useUIStore.getState().addToCart(product)
    const { cartItems } = useUIStore.getState()
    expect(cartItems).toHaveLength(1)
    expect(cartItems[0].quantity).toBe(1)
    expect(cartItems[0].product).toEqual(product)
  })

  it('adds item with custom quantity', () => {
    const product = makeProduct()
    useUIStore.getState().addToCart(product, 3)
    expect(useUIStore.getState().cartItems[0].quantity).toBe(3)
  })

  it('stores customizations', () => {
    const product = makeProduct()
    const customizations = { bebida: { azucar: 'sin_azucar' as const, temperatura: 'caliente' as const, leche: 'entera' as const }, notas: 'extra shot' }
    useUIStore.getState().addToCart(product, 1, customizations)
    expect(useUIStore.getState().cartItems[0].customizations).toEqual(customizations)
  })

  it('generates unique cartItemId for same product added twice', () => {
    const product = makeProduct()
    useUIStore.getState().addToCart(product)
    useUIStore.getState().addToCart(product)
    const { cartItems } = useUIStore.getState()
    expect(cartItems).toHaveLength(2)
    expect(cartItems[0].cartItemId).not.toBe(cartItems[1].cartItemId)
  })

  it('cartItemId is unique across 100 rapid adds', () => {
    const product = makeProduct()
    for (let i = 0; i < 100; i++) useUIStore.getState().addToCart(product)
    const ids = new Set(useUIStore.getState().cartItems.map((i) => i.cartItemId))
    expect(ids.size).toBe(100)
  })

  it('accumulates multiple different products', () => {
    useUIStore.getState().addToCart(makeProduct({ id: '1', name: 'A' }))
    useUIStore.getState().addToCart(makeProduct({ id: '2', name: 'B' }))
    useUIStore.getState().addToCart(makeProduct({ id: '3', name: 'C' }))
    expect(useUIStore.getState().cartItems).toHaveLength(3)
  })
})

describe('removeFromCart()', () => {
  it('removes the correct item', () => {
    useUIStore.getState().addToCart(makeProduct({ id: '1' }))
    useUIStore.getState().addToCart(makeProduct({ id: '2' }))
    const { cartItems } = useUIStore.getState()
    const idToRemove = cartItems[0].cartItemId
    useUIStore.getState().removeFromCart(idToRemove)
    expect(useUIStore.getState().cartItems).toHaveLength(1)
    expect(useUIStore.getState().cartItems[0].cartItemId).not.toBe(idToRemove)
  })

  it('non-existent id → no crash, array unchanged', () => {
    useUIStore.getState().addToCart(makeProduct())
    expect(() => useUIStore.getState().removeFromCart('does-not-exist')).not.toThrow()
    expect(useUIStore.getState().cartItems).toHaveLength(1)
  })

  it('empty cart + remove → no crash', () => {
    expect(() => useUIStore.getState().removeFromCart('any')).not.toThrow()
  })
})

describe('updateCartQuantity()', () => {
  it('updates quantity for correct item', () => {
    useUIStore.getState().addToCart(makeProduct({ id: '1' }))
    const id = useUIStore.getState().cartItems[0].cartItemId
    useUIStore.getState().updateCartQuantity(id, 5)
    expect(useUIStore.getState().cartItems[0].quantity).toBe(5)
  })

  it('does not affect other items', () => {
    useUIStore.getState().addToCart(makeProduct({ id: '1' }))
    useUIStore.getState().addToCart(makeProduct({ id: '2' }))
    const [first, second] = useUIStore.getState().cartItems
    useUIStore.getState().updateCartQuantity(first.cartItemId, 7)
    expect(useUIStore.getState().cartItems.find((i) => i.cartItemId === second.cartItemId)?.quantity).toBe(1)
  })

  it('quantity = 0 → auto-removes item', () => {
    useUIStore.getState().addToCart(makeProduct())
    const id = useUIStore.getState().cartItems[0].cartItemId
    useUIStore.getState().updateCartQuantity(id, 0)
    expect(useUIStore.getState().cartItems).toHaveLength(0)
  })

  it('negative quantity → auto-removes item', () => {
    useUIStore.getState().addToCart(makeProduct())
    const id = useUIStore.getState().cartItems[0].cartItemId
    useUIStore.getState().updateCartQuantity(id, -1)
    expect(useUIStore.getState().cartItems).toHaveLength(0)
  })
})

describe('clearCart()', () => {
  it('empties all cart items', () => {
    useUIStore.getState().addToCart(makeProduct({ id: '1' }))
    useUIStore.getState().addToCart(makeProduct({ id: '2' }))
    useUIStore.getState().clearCart()
    expect(useUIStore.getState().cartItems).toHaveLength(0)
  })

  it('safe on empty cart', () => {
    expect(() => useUIStore.getState().clearCart()).not.toThrow()
  })
})

describe('getCartTotal()', () => {
  it('returns 0 for empty cart', () => {
    expect(useUIStore.getState().getCartTotal()).toBe(0)
  })

  it('single item: price × quantity', () => {
    useUIStore.getState().addToCart(makeProduct({ price: 8500 }), 2)
    expect(useUIStore.getState().getCartTotal()).toBe(17000)
  })

  it('multiple items: correct sum', () => {
    useUIStore.getState().addToCart(makeProduct({ id: '1', price: 8500 }), 1)
    useUIStore.getState().addToCart(makeProduct({ id: '2', price: 5000 }), 3)
    expect(useUIStore.getState().getCartTotal()).toBe(23500) // 8500 + 15000
  })

  it('decimal prices: no floating-point drift', () => {
    useUIStore.getState().addToCart(makeProduct({ price: 1.10 }), 3)
    // 1.10 * 3 = 3.30, not 3.3000000000000003
    expect(useUIStore.getState().getCartTotal()).toBeCloseTo(3.30, 10)
  })
})

describe('activeOrderId', () => {
  it('setActiveOrderId sets and clears', () => {
    useUIStore.getState().setActiveOrderId('order-123')
    expect(useUIStore.getState().activeOrderId).toBe('order-123')
    useUIStore.getState().setActiveOrderId(null)
    expect(useUIStore.getState().activeOrderId).toBeNull()
  })
})

describe('tableId', () => {
  it('setTableId sets and clears', () => {
    useUIStore.getState().setTableId(5)
    expect(useUIStore.getState().tableId).toBe(5)
    useUIStore.getState().setTableId(null)
    expect(useUIStore.getState().tableId).toBeNull()
  })
})
