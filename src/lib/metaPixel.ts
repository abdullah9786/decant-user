declare global {
  interface Window {
    fbq?: (command: string, eventName: string, params?: Record<string, unknown>) => void;
  }
}

const META_PIXEL_ID = "986804581122178";
const CURRENCY = "INR";

type MetaEventParams = {
  content_ids?: string[];
  content_type?: string;
  value?: number;
  currency?: string;
  eventID?: string;
};

/**
 * Fire a Meta Pixel event with proper error handling
 */
function fireEvent(eventName: string, params?: MetaEventParams): void {
  const fbq = typeof window !== "undefined" ? window.fbq : undefined;
  if (typeof fbq !== "function") {
    return;
  }

  try {
    fbq("track", eventName, params);
  } catch (error) {
    console.error("Meta Pixel event error:", error);
  }
}

/**
 * Track ViewContent event when a user views a product
 * @param productId - Product ID
 * @param value - Product price
 * @param productName - Product name (optional, for debugging)
 */
export function trackViewContent(productId: string, value: number, productName?: string): void {
  fireEvent("ViewContent", {
    content_ids: [productId],
    content_type: "product",
    value,
    currency: CURRENCY,
  });
}

/**
 * Track AddToCart event after successful cart addition
 * @param productId - Product ID
 * @param value - Product price
 * @param quantity - Quantity added
 */
export function trackAddToCart(productId: string, value: number, quantity: number = 1): void {
  fireEvent("AddToCart", {
    content_ids: [productId],
    content_type: "product",
    value: value * quantity,
    currency: CURRENCY,
  });
}

/**
 * Track InitiateCheckout event when user begins checkout
 * @param cartItems - Array of cart items
 * @param totalValue - Total cart value
 * @param eventId - Optional event ID for deduplication with server CAPI
 */
export function trackInitiateCheckout(cartItems: Array<{ id: string; price: number; quantity: number }>, totalValue: number, eventId?: string): void {
  const contentIds = cartItems.map((item) => item.id);
  
  fireEvent("InitiateCheckout", {
    content_ids: contentIds,
    content_type: "product",
    value: totalValue,
    currency: CURRENCY,
    ...(eventId && { eventID: eventId }),
  });
}

/**
 * Track Purchase event after successful order completion
 * @param orderItems - Array of order items
 * @param totalValue - Total order value
 * @param orderId - Order ID for event deduplication
 */
export function trackPurchase(orderItems: Array<{ id: string; price: number; quantity: number }>, totalValue: number, orderId: string): void {
  const contentIds = orderItems.map((item) => item.id);
  
  fireEvent("Purchase", {
    content_ids: contentIds,
    content_type: "product",
    value: totalValue,
    currency: CURRENCY,
    eventID: orderId,
  });
}
