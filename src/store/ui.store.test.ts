// @vitest-environment node
import { describe, it, expect, beforeEach } from 'vitest';
import { useUIStore } from './ui.store';

describe('ui.store', () => {
  beforeEach(() => {
    useUIStore.setState({
      sidebarOpen: true,
      cartOpen: false,
      cartItems: [],
      activeOrderId: null,
    });
  });

  // ── Sidebar ──────────────────────────────────────────────────────────
  it('sidebarOpen is true by default', () => {
    expect(useUIStore.getState().sidebarOpen).toBe(true);
  });

  it('toggleSidebar flips sidebarOpen', () => {
    useUIStore.getState().toggleSidebar();
    expect(useUIStore.getState().sidebarOpen).toBe(false);
    useUIStore.getState().toggleSidebar();
    expect(useUIStore.getState().sidebarOpen).toBe(true);
  });

  // ── Cart drawer ──────────────────────────────────────────────────────
  it('cartOpen is false by default', () => {
    expect(useUIStore.getState().cartOpen).toBe(false);
  });

  it('openCart sets cartOpen to true', () => {
    useUIStore.getState().openCart();
    expect(useUIStore.getState().cartOpen).toBe(true);
  });

  it('closeCart sets cartOpen to false', () => {
    useUIStore.getState().openCart();
    useUIStore.getState().closeCart();
    expect(useUIStore.getState().cartOpen).toBe(false);
  });

  it('toggleCart flips cartOpen', () => {
    useUIStore.getState().toggleCart();
    expect(useUIStore.getState().cartOpen).toBe(true);
    useUIStore.getState().toggleCart();
    expect(useUIStore.getState().cartOpen).toBe(false);
  });

  // ── Cart items ───────────────────────────────────────────────────────
  const mockProduct = {
    id: 'p1',
    name: 'Café Latte',
    price: 8500,
    category: 'menu' as const,
    available: true,
    description: 'Café con leche',
  };

  it('cartItems starts empty', () => {
    expect(useUIStore.getState().cartItems).toHaveLength(0);
  });

  it('addToCart adds a product with default quantity 1', () => {
    useUIStore.getState().addToCart(mockProduct);
    expect(useUIStore.getState().cartItems).toHaveLength(1);
    expect(useUIStore.getState().cartItems[0].quantity).toBe(1);
    expect(useUIStore.getState().cartItems[0].product.id).toBe('p1');
  });

  it('addToCart respects custom quantity', () => {
    useUIStore.getState().addToCart(mockProduct, 3);
    expect(useUIStore.getState().cartItems[0].quantity).toBe(3);
  });

  it('addToCart creates unique cartItemId per addition', () => {
    useUIStore.getState().addToCart(mockProduct);
    useUIStore.getState().addToCart(mockProduct);
    const items = useUIStore.getState().cartItems;
    expect(items[0].cartItemId).not.toBe(items[1].cartItemId);
  });

  it('removeFromCart removes item by cartItemId', () => {
    useUIStore.getState().addToCart(mockProduct);
    const id = useUIStore.getState().cartItems[0].cartItemId;
    useUIStore.getState().removeFromCart(id);
    expect(useUIStore.getState().cartItems).toHaveLength(0);
  });

  it('updateCartQuantity updates item quantity', () => {
    useUIStore.getState().addToCart(mockProduct);
    const id = useUIStore.getState().cartItems[0].cartItemId;
    useUIStore.getState().updateCartQuantity(id, 5);
    expect(useUIStore.getState().cartItems[0].quantity).toBe(5);
  });

  it('updateCartQuantity with 0 removes the item', () => {
    useUIStore.getState().addToCart(mockProduct);
    const id = useUIStore.getState().cartItems[0].cartItemId;
    useUIStore.getState().updateCartQuantity(id, 0);
    expect(useUIStore.getState().cartItems).toHaveLength(0);
  });

  it('clearCart empties all items', () => {
    useUIStore.getState().addToCart(mockProduct);
    useUIStore.getState().addToCart(mockProduct);
    useUIStore.getState().clearCart();
    expect(useUIStore.getState().cartItems).toHaveLength(0);
  });

  it('getCartTotal calculates sum of price × quantity', () => {
    useUIStore.getState().addToCart(mockProduct, 2); // 8500 × 2 = 17000
    useUIStore.getState().addToCart({ ...mockProduct, id: 'p2', price: 5000 }, 1); // 5000
    expect(useUIStore.getState().getCartTotal()).toBe(22000);
  });

  it('getCartTotal returns 0 for empty cart', () => {
    expect(useUIStore.getState().getCartTotal()).toBe(0);
  });

  // ── Active order ─────────────────────────────────────────────────────
  it('setActiveOrderId sets the order id', () => {
    useUIStore.getState().setActiveOrderId('order-42');
    expect(useUIStore.getState().activeOrderId).toBe('order-42');
  });

  it('setActiveOrderId accepts null to clear', () => {
    useUIStore.getState().setActiveOrderId('order-42');
    useUIStore.getState().setActiveOrderId(null);
    expect(useUIStore.getState().activeOrderId).toBeNull();
  });
});
