import { create } from 'zustand';
import type { CartItem, Product, ProductCustomizations } from '@/types';

interface UIState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  cartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  cartItems: CartItem[];
  addToCart: (product: Product, quantity?: number, customizations?: ProductCustomizations) => void;
  removeFromCart: (cartItemId: string) => void;
  updateCartQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  activeOrderId: string | null;
  setActiveOrderId: (id: string | null) => void;
  tableId: number | null;
  setTableId: (id: number | null) => void;
}

export const useUIStore = create<UIState>()((set, get) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),

  cartOpen: false,
  openCart: () => set({ cartOpen: true }),
  closeCart: () => set({ cartOpen: false }),
  toggleCart: () => set((s) => ({ cartOpen: !s.cartOpen })),

  cartItems: [],

  addToCart: (product, quantity = 1, customizations) =>
    set((state) => ({
      cartItems: [
        ...state.cartItems,
        {
          cartItemId: `${product.id}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          product,
          quantity,
          customizations,
        },
      ],
    })),

  removeFromCart: (cartItemId) =>
    set((s) => ({ cartItems: s.cartItems.filter((i) => i.cartItemId !== cartItemId) })),

  updateCartQuantity: (cartItemId, quantity) =>
    set((state) => {
      if (quantity <= 0) {
        return { cartItems: state.cartItems.filter((i) => i.cartItemId !== cartItemId) };
      }
      return {
        cartItems: state.cartItems.map((i) =>
          i.cartItemId === cartItemId ? { ...i, quantity } : i
        ),
      };
    }),

  clearCart: () => set({ cartItems: [] }),

  getCartTotal: () =>
    get().cartItems.reduce((sum, i) => sum + i.product.price * i.quantity, 0),

  activeOrderId: null,
  setActiveOrderId: (id) => set({ activeOrderId: id }),

  tableId: null,
  setTableId: (id) => set({ tableId: id }),
}));
