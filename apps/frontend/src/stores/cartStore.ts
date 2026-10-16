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
  refreshItemImage: (id: number) => Promise<void>;
  refreshAllImages: () => Promise<void>;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

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

      // Refresh image for a single item from API
      refreshItemImage: async (id: number) => {
        try {
          const response = await fetch(`${API_BASE_URL}/products`);
          if (!response.ok) return;
          
          const data = await response.json();
          const items = (data as unknown as { items?: unknown[] })?.items || [];
          const product = (items as unknown[]).find((p: unknown) => (p as { id: number }).id === id) as { id: number; images?: string[] } | undefined;
          
          if (product?.images && product.images.length > 0) {
            set((state) => ({
              items: state.items.map((item) =>
                item.id === id && !item.image
                  ? { ...item, image: product.images![0] }
                  : item
              ),
            }));
          }
        } catch (error) {
          console.error('Failed to refresh image for cart item:', error);
        }
      },

      // Refresh images for all items that don't have images
      refreshAllImages: async () => {
        try {
          const state = get();
          const itemsWithoutImage = state.items.filter((item) => !item.image);
          
          if (itemsWithoutImage.length === 0) {
            return;
          }

          const response = await fetch(`${API_BASE_URL}/products`);
          if (!response.ok) return;
          
          const data = await response.json();
          const items = (data as unknown as { items?: unknown[] })?.items || [];
          
          set((state) => {
            const updatedItems = state.items.map((item) => {
              const product = (items as unknown[]).find((p: unknown) => (p as { id: number }).id === item.id) as { id: number; images?: string[] } | undefined;
              
              if (!item.image && product?.images && product.images.length > 0) {
                return { ...item, image: product.images[0] };
              }
              return item;
            });
            
            return { items: updatedItems };
          });
        } catch (error) {
          console.error('Failed to refresh cart images:', error);
        }
      },
    }),
    {
      name: 'medikom-cart',
      onRehydrateStorage: () => (state) => {
        if (state) {
          console.log('medikom-cart: Cart restored:', state.items.length, 'items');
          // Refresh images for items that don't have images
          state.refreshAllImages();
        }
      },
    }
  )
);
