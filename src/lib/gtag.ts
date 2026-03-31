import type { CartItem } from "@/store/useCartStore";

declare global {
  interface Window {
    gtag?: (command: string, ...args: unknown[]) => void;
  }
}

/** GA4 recommended item shape for ecommerce events */
export function cartItemsToGaItems(items: CartItem[]) {
  return items.map((item) => ({
    item_id: item.id,
    item_name: item.name,
    item_brand: item.brand,
    price: item.price,
    quantity: item.quantity,
  }));
}

export function gaEvent(name: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") {
    return;
  }
  window.gtag("event", name, params ?? {});
}
