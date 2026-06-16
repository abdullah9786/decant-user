/** Next.js cache tag for a product's review list + summary fetches. */
export function productReviewsTag(productId: string) {
  return `product-reviews:${productId}`;
}
