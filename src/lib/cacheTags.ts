/** Next.js cache tag for a product's review list + summary fetches. */
export function productReviewsTag(productId: string) {
  return `product-reviews:${productId}`;
}

/** Daily deal payload (layout banner, homepage hero/rail, /deals/today). */
export const DAILY_DEAL_CACHE_TAG = "daily-deal";
