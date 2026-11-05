import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, MenuItem, OrderType } from '@/types';

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  orderType: OrderType;
  tableNumber: string;
  specialInstructions: string;

  // Actions
  addItem: (item: MenuItem, quantity?: number, instructions?: string) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  setOrderType: (orderType: OrderType) => void;
  setTableNumber: (tableNumber: string) => void;
  setSpecialInstructions: (instructions: string) => void;

  // Selectors
  getItemCount: () => number;
  getSubtotal: () => number;
  getTax: () => number;
  getDeliveryFee: () => number;
  getTotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      orderType: 'takeaway',
      tableNumber: '',
      specialInstructions: '',

      addItem: (item, quantity = 1, instructions = '') => {
        set((state) => {
          const existingIndex = state.items.findIndex((i) => i.item.id === item.id);
          if (existingIndex > -1) {
            const updated = [...state.items];
            updated[existingIndex].quantity += quantity;
            if (instructions) {
              updated[existingIndex].instructions = instructions;
            }
            return { items: updated, isOpen: true };
          }
          return {
            items: [...state.items, { item, quantity, instructions }],
            isOpen: true,
          };
        });
      },

      removeItem: (itemId) => {
        set((state) => ({
          items: state.items.filter((i) => i.item.id !== itemId),
        }));
      },

      updateQuantity: (itemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(itemId);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.item.id === itemId ? { ...i, quantity } : i
          ),
        }));
      },

      clearCart: () => {
        set({ items: [], specialInstructions: '' });
      },

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      setOrderType: (orderType) => set({ orderType }),
      setTableNumber: (tableNumber) => set({ tableNumber }),
      setSpecialInstructions: (specialInstructions) => set({ specialInstructions }),

      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      getSubtotal: () => {
        return get().items.reduce((sum, item) => sum + item.item.price * item.quantity, 0);
      },

      getTax: () => {
        // Menu prices are inclusive of 5% GST (Tax = Total - Total / 1.05)
        const total = get().getSubtotal();
        const base = total / 1.05;
        return Math.round((total - base) * 100) / 100;
      },

      getDeliveryFee: () => {
        return 0;
      },

      getTotal: () => {
        // Menu prices are inclusive of 5% GST; order total matches menu prices exactly
        return get().getSubtotal();
      },
    }),
    {
      name: 'five-star-cart',
      partialize: (state) => ({
        items: state.items,
        orderType: state.orderType,
        tableNumber: state.tableNumber,
        specialInstructions: state.specialInstructions,
      }),
    }
  )
);
