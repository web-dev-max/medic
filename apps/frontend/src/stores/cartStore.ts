import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: number;
  name: string;
  slug: string;
  price: number;
  image: string;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
  hasPendingAnimation: boolean;
  triggerAddAnimation: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      hasPendingAnimation: false,

      addItem: (newItem) => {
        // Prevent adding items with zero price
        if (newItem.price <= 0) {
          console.warn('Cannot add item with zero price to cart:', newItem.name);
          return;
        }

        set((state) => {
          const existingIndex = state.items.findIndex(
            (item) => item.id === newItem.id
          );

          if (existingIndex >= 0) {
            const updatedItems = [...state.items];
            updatedItems[existingIndex] = {
              ...updatedItems[existingIndex],
              quantity: updatedItems[existingIndex].quantity + 1,
            };
            return { items: updatedItems };
          }

          return { items: [...state.items, { ...newItem, quantity: 1 }] };
        });

        set({ hasPendingAnimation: true });
        setTimeout(() => set({ hasPendingAnimation: false }), 600);
      },

      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          set((state) => ({
            items: state.items.filter((item) => item.id !== id),
          }));
          return;
        }

        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, quantity } : item
          ),
        }));
      },

      clearCart: () => {
        set({ items: [] });
      },

      totalItems: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      totalPrice: () => {
        return get().items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
      },

      triggerAddAnimation: () => {
        set({ hasPendingAnimation: true });
        setTimeout(() => set({ hasPendingAnimation: false }), 600);
      },
    }),
    {
      name: 'medikom-cart',
      onRehydrateStorage: () => (state) => {
        if (state) {
          console.log('medikom-cart: Cart restored:', state.items.length, 'items');
        }
      },
    }
  )
);
