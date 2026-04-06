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
    is_pack?: boolean;
}

function cartKey(item: { id: string; size_ml: number; is_pack?: boolean }) {
    return `${item.id}|${item.size_ml}|${item.is_pack ? '1' : '0'}`;
}

interface CartState {
    items: CartItem[];
    addItem: (item: CartItem) => void;
    removeItem: (id: string, size_ml: number, is_pack?: boolean) => void;
    updateQuantity: (id: string, size_ml: number, quantity: number, is_pack?: boolean) => void;
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
                const key = cartKey(newItem);
                const existingItemIndex = currentItems.findIndex(
                    (item) => cartKey(item) === key
                );

                if (existingItemIndex > -1) {
                    const updatedItems = [...currentItems];
                    updatedItems[existingItemIndex].quantity += newItem.quantity;
                    set({ items: updatedItems });
                } else {
                    set({ items: [...currentItems, newItem] });
                }
            },
            removeItem: (id, size_ml, is_pack) => {
                const key = cartKey({ id, size_ml, is_pack });
                set({
                    items: get().items.filter((item) => cartKey(item) !== key),
                });
            },
            updateQuantity: (id, size_ml, quantity, is_pack) => {
                const key = cartKey({ id, size_ml, is_pack });
                const updatedItems = get().items.map((item) =>
                    cartKey(item) === key ? { ...item, quantity } : item
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
