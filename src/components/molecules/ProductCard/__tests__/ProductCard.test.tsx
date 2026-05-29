import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ProductCard } from '@/components/molecules/ProductCard/ProductCard'
import { makeCatalogProduct } from '@/test/fixtures/product.factory'

const userStub = vi.hoisted(() => ({ value: null as { role: string } | null }))
const addToCartSpy = vi.hoisted(() => vi.fn())

vi.mock('@/store/auth.store', () => ({
  useAuthStore: vi.fn((selector: (s: { user: typeof userStub.value }) => unknown) =>
    selector({ user: userStub.value })
  ),
  isStaffUser: vi.fn((user: { role: string } | null) =>
    user?.role === 'ADMIN' || user?.role === 'EMPLOYEE'
  ),
}))

vi.mock('@/store/ui.store', () => ({
  useUIStore: vi.fn((selector: (s: { addToCart: typeof addToCartSpy }) => unknown) =>
    selector({ addToCart: addToCartSpy })
  ),
}))

beforeEach(() => {
  userStub.value = null
  addToCartSpy.mockClear()
})

describe('ProductCard', () => {
  describe('rendering', () => {
    it('displays product name', () => {
      render(<ProductCard product={makeCatalogProduct({ name: 'Cappuccino' })} />)
      expect(screen.getByText('Cappuccino')).toBeInTheDocument()
    })

    it('displays formatted price (COP)', () => {
      render(<ProductCard product={makeCatalogProduct({ price: 8500 })} />)
      expect(screen.getByText(/8.500|8,500|\$\s*8/)).toBeInTheDocument()
    })

    it('displays description when provided', () => {
      render(<ProductCard product={makeCatalogProduct({ description: 'Café con leche espumosa' })} />)
      expect(screen.getByText('Café con leche espumosa')).toBeInTheDocument()
    })

    it('shows default description when none provided', () => {
      render(<ProductCard product={makeCatalogProduct({ description: undefined })} />)
      expect(screen.getByText(/Coffee & Chill/i)).toBeInTheDocument()
    })

    it('renders image when image_url provided', () => {
      render(<ProductCard product={makeCatalogProduct({ image_url: 'http://example.com/latte.jpg' })} />)
      expect(screen.getByRole('img')).toHaveAttribute('src', 'http://example.com/latte.jpg')
    })

    it('shows first letter as placeholder when no image', () => {
      render(<ProductCard product={makeCatalogProduct({ name: 'Brownie', image_url: undefined })} />)
      expect(screen.getByText('B')).toBeInTheDocument()
    })
  })

  describe('customer can add to cart', () => {
    beforeEach(() => { userStub.value = null })

    it('shows "Añadir al carrito" button', () => {
      render(<ProductCard product={makeCatalogProduct()} />)
      expect(screen.getByRole('button', { name: /añadir al carrito/i })).toBeInTheDocument()
    })

    it('calls addToCart when button clicked', () => {
      render(<ProductCard product={makeCatalogProduct()} />)
      fireEvent.click(screen.getByRole('button', { name: /añadir al carrito/i }))
      expect(addToCartSpy).toHaveBeenCalledOnce()
    })

    it('passes converted product to addToCart', () => {
      const product = makeCatalogProduct({ product_id: 42, name: 'Mocha', price: 9500 })
      render(<ProductCard product={product} />)
      fireEvent.click(screen.getByRole('button', { name: /añadir al carrito/i }))
      const [cartProduct] = addToCartSpy.mock.calls[0]
      expect(cartProduct.id).toBe('42')
      expect(cartProduct.name).toBe('Mocha')
      expect(cartProduct.price).toBe(9500)
    })
  })

  describe('staff cannot add to cart', () => {
    it('ADMIN sees staff-only label instead of cart button', () => {
      userStub.value = { role: 'ADMIN' }
      render(<ProductCard product={makeCatalogProduct()} />)
      expect(screen.queryByRole('button', { name: /añadir al carrito/i })).not.toBeInTheDocument()
      expect(screen.getByText(/vista de carta/i)).toBeInTheDocument()
    })

    it('EMPLOYEE sees staff-only label instead of cart button', () => {
      userStub.value = { role: 'EMPLOYEE' }
      render(<ProductCard product={makeCatalogProduct()} />)
      expect(screen.queryByRole('button', { name: /añadir al carrito/i })).not.toBeInTheDocument()
    })
  })

  describe('product status', () => {
    it('ACTIVE product renders add-to-cart for customer', () => {
      render(<ProductCard product={makeCatalogProduct({ status: 'ACTIVE' })} />)
      expect(screen.getByRole('button', { name: /añadir/i })).toBeInTheDocument()
    })
  })
})
