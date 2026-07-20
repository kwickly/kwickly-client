import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
  id: string; // The specific menu_item_id or variant_id
  name: string;
  price: number;
  quantity: number;
  fulfillmentMode?: 'dine_in' | 'takeaway';
}

interface CartState {
  tenantSlug: string | null;
  qrToken: string | null;
  items: CartItem[];
  addItem: (item: CartItem, tenantSlug: string) => void;
  setQrToken: (token: string | null) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  updateItemFulfillmentMode: (id: string, mode: 'dine_in' | 'takeaway' | undefined) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      tenantSlug: null,
      qrToken: null,
      items: [],
      setQrToken: (token) => set({ qrToken: token }),
      addItem: (newItem, slug) => {
        set((state) => {
          // If we add an item for a different tenant (or old format cart), clear the cart first!
          if (state.tenantSlug !== slug) {
            return { tenantSlug: slug, items: [newItem] };
          }
          const existing = state.items.find((i) => i.id === newItem.id);
          if (existing) {
            return {
              tenantSlug: slug,
              items: state.items.map((i) =>
                i.id === newItem.id ? { ...i, quantity: i.quantity + newItem.quantity } : i
              ),
            };
          }
          return { tenantSlug: slug, items: [...state.items, newItem] };
        });
      },
      removeItem: (id) =>
        set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
      updateQuantity: (id, quantity) =>
        set((state) => ({
          items: state.items.map((i) => (i.id === id ? { ...i, quantity } : i)),
        })),
      updateItemFulfillmentMode: (id, mode) =>
        set((state) => ({
          items: state.items.map((i) => (i.id === id ? { ...i, fulfillmentMode: mode } : i)),
        })),
      clearCart: () => set({ items: [], tenantSlug: null, qrToken: null }),
      totalItems: () => get().items.reduce((acc, item) => acc + item.quantity, 0),
      totalPrice: () => get().items.reduce((acc, item) => acc + item.price * item.quantity, 0),
    }),
    {
      name: 'kwickly-shopping-cart',
    }
  )
);
