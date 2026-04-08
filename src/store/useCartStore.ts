import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface GiftBoxSelectedProduct {
    product_id: string;
    name: string;
    size_ml: number;
    price: number;
}

export interface CartItem {
    id: string;
    name: string;
    brand: string;
    size_ml: number;
    price: number;
    quantity: number;
    image_url?: string;
    is_pack?: boolean;
    gift_box_id?: string;
    gift_box_name?: string;
    selected_products?: GiftBoxSelectedProduct[];
    bottle_id?: string;
    bottle_name?: string;
    bottle_price?: number;
}

function cartKey(item: { id: string; size_ml: number; is_pack?: boolean; gift_box_id?: string; selected_products?: GiftBoxSelectedProduct[]; bottle_id?: string }) {
    if (item.gift_box_id && item.selected_products) {
        const ids = [...item.selected_products].map(s => s.product_id).sort().join(',');
        return `giftbox|${item.gift_box_id}|${ids}`;
    }
    return `${item.id}|${item.size_ml}|${item.is_pack ? '1' : '0'}|${item.bottle_id || ''}`;
}

interface CartState {
    items: CartItem[];
    addItem: (item: CartItem) => void;
    removeItem: (id: string, size_ml: number, is_pack?: boolean, gift_box_id?: string, selected_products?: GiftBoxSelectedProduct[], bottle_id?: string) => void;
    updateQuantity: (id: string, size_ml: number, quantity: number, is_pack?: boolean, gift_box_id?: string, selected_products?: GiftBoxSelectedProduct[], bottle_id?: string) => void;
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
            removeItem: (id, size_ml, is_pack, gift_box_id, selected_products, bottle_id) => {
                const key = cartKey({ id, size_ml, is_pack, gift_box_id, selected_products, bottle_id });
                set({
                    items: get().items.filter((item) => cartKey(item) !== key),
                });
            },
            updateQuantity: (id, size_ml, quantity, is_pack, gift_box_id, selected_products, bottle_id) => {
                const key = cartKey({ id, size_ml, is_pack, gift_box_id, selected_products, bottle_id });
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
