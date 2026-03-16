import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
    id: string;
    name: string;
    brand: string;
    size_ml: number;
    price: number;
    quantity: number;
    image_url?: string;
}

interface CartState {
    items: CartItem[];
    addItem: (item: CartItem) => void;
    removeItem: (id: string, size_ml: number) => void;
    updateQuantity: (id: string, size_ml: number, quantity: number) => void;
    clearCart: () => void;
    totalItems: () => number;
    totalPrice: () => number;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            addItem: (newItem) => {
                const currentItems = get().items;
                const existingItemIndex = currentItems.findIndex(
                    (item) => item.id === newItem.id && item.size_ml === newItem.size_ml
                );

                if (existingItemIndex > -1) {
                    const updatedItems = [...currentItems];
                    updatedItems[existingItemIndex].quantity += newItem.quantity;
                    set({ items: updatedItems });
                } else {
                    set({ items: [...currentItems, newItem] });
                }
            },
            removeItem: (id, size_ml) => {
                set({
                    items: get().items.filter((item) => !(item.id === id && item.size_ml === size_ml)),
                });
            },
            updateQuantity: (id, size_ml, quantity) => {
                const updatedItems = get().items.map((item) =>
                    item.id === id && item.size_ml === size_ml ? { ...item, quantity } : item
                );
                set({ items: updatedItems });
            },
            clearCart: () => set({ items: [] }),
            totalItems: () => get().items.reduce((acc, item) => acc + item.quantity, 0),
            totalPrice: () => get().items.reduce((acc, item) => acc + item.price * item.quantity, 0),
        }),
        {
            name: 'cart-storage',
        }
    )
);
