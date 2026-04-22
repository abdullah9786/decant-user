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

export interface FreeDecantItem {
    product_id: string;
    name: string;
    brand: string;
    image_url?: string;
    size_ml: number;
    offer_id: string;
}

function cartKey(item: { id: string; size_ml: number; is_pack?: boolean; gift_box_id?: string; selected_products?: GiftBoxSelectedProduct[]; bottle_id?: string }) {
    if (item.gift_box_id && item.selected_products) {
        const ids = [...item.selected_products].map(s => s.product_id).sort().join(',');
        return `giftbox|${item.gift_box_id}|${ids}`;
    }
    return `${item.id}|${item.size_ml}|${item.is_pack ? '1' : '0'}|${item.bottle_id || ''}`;
}

export function getQualifyingCount(items: CartItem[], minMl: number, qualifyingType: string = 'decant'): number {
    return items.reduce((count, item) => {
        if (item.gift_box_id) return count;
        const itemIsPack = !!item.is_pack;
        if (qualifyingType === 'decant' && itemIsPack) return count;
        if (qualifyingType === 'sealed' && !itemIsPack) return count;
        if (item.size_ml >= minMl) return count + item.quantity;
        return count;
    }, 0);
}

interface CartState {
    items: CartItem[];
    freeDecants: FreeDecantItem[];
    addItem: (item: CartItem) => void;
    removeItem: (id: string, size_ml: number, is_pack?: boolean, gift_box_id?: string, selected_products?: GiftBoxSelectedProduct[], bottle_id?: string) => void;
    updateQuantity: (id: string, size_ml: number, quantity: number, is_pack?: boolean, gift_box_id?: string, selected_products?: GiftBoxSelectedProduct[], bottle_id?: string) => void;
    clearCart: () => void;
    totalItems: () => number;
    totalPrice: () => number;
    addFreeDecant: (item: FreeDecantItem) => void;
    removeFreeDecant: (productId: string) => void;
    clearFreeDecants: () => void;
    trimFreeDecants: (entitled: number) => void;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            freeDecants: [],
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
                const newItems = get().items.filter((item) => cartKey(item) !== key);
                set({ items: newItems });
            },
            updateQuantity: (id, size_ml, quantity, is_pack, gift_box_id, selected_products, bottle_id) => {
                const key = cartKey({ id, size_ml, is_pack, gift_box_id, selected_products, bottle_id });
                const updatedItems = get().items.map((item) =>
                    cartKey(item) === key ? { ...item, quantity } : item
                );
                set({ items: updatedItems });
            },
            clearCart: () => set({ items: [], freeDecants: [] }),
            totalItems: () => get().items.reduce((acc, item) => acc + item.quantity, 0),
            totalPrice: () => get().items.reduce((acc, item) => acc + item.price * item.quantity, 0),
            addFreeDecant: (item) => {
                set({ freeDecants: [...get().freeDecants, item] });
            },
            removeFreeDecant: (productId) => {
                const current = get().freeDecants;
                const idx = current.findLastIndex(d => d.product_id === productId);
                if (idx === -1) return;
                const updated = [...current];
                updated.splice(idx, 1);
                set({ freeDecants: updated });
            },
            clearFreeDecants: () => set({ freeDecants: [] }),
            trimFreeDecants: (entitled) => {
                const current = get().freeDecants;
                if (current.length > entitled) {
                    set({ freeDecants: current.slice(0, entitled) });
                }
            },
        }),
        {
            name: 'cart-storage',
        }
    )
);
