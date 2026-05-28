import type { Product } from '@/types'
import type { Product as CatalogProduct } from '@/hooks/useCatalog'

export function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: '1',
    name: 'Café Latte',
    description: 'Café con leche espumosa',
    price: 8500,
    category: 'bebidas',
    available: true,
    ...overrides,
  }
}

export function makeCatalogProduct(overrides: Partial<CatalogProduct> = {}): CatalogProduct {
  return {
    product_id: 1,
    name: 'Café Latte',
    category_id: 1,
    price: 8500,
    stock_quantity: 10,
    status: 'ACTIVE',
    description: 'Café con leche espumosa',
    ...overrides,
  }
}
