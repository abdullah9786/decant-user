/**
 * Stock-availability helpers, kept in one place so cards in the catalogue
 * rail, the daily-deal collage, the homepage rail, and the product detail
 * page all agree on what "out of stock" means.
 *
 * Two storage models live side-by-side in our data:
 *   - Decant variants (`is_pack: false`) share a single pool measured in
 *     ml at the *product* level (`product.stock_ml`). A decant variant
 *     is available iff that pool is at least as large as the variant's
 *     size_ml.
 *   - Pack variants (`is_pack: true`) each have their own integer unit
 *     count (`variant.stock`). A pack is available iff that count is
 *     1 or more.
 *
 * Anything else (no variants, all variants exhausted) means out of stock.
 */

export interface StockVariant {
  size_ml: number;
  is_pack?: boolean;
  stock?: number;
}

export interface StockProduct {
  variants?: StockVariant[];
  stock_ml?: number;
}

export function isVariantInStock(
  variant: StockVariant,
  availableMl: number,
): boolean {
  if (variant.is_pack) return (variant.stock ?? 0) >= 1;
  return availableMl >= variant.size_ml;
}

export function isProductOutOfStock(product: StockProduct): boolean {
  const variants = product.variants ?? [];
  if (variants.length === 0) return true;
  const availableMl = product.stock_ml ?? 0;
  return !variants.some((v) => isVariantInStock(v, availableMl));
}

/**
 * Returns true when every product in the list is out of stock.
 *
 * Returns `false` for an empty list rather than `true` — an empty list
 * means "no products configured" which is a different state than "every
 * product is sold out". Callers (e.g. the daily-deal chrome) typically
 * want to differentiate "show regret copy" from "show nothing at all".
 */
export function areAllProductsOutOfStock(
  products: StockProduct[] | undefined | null,
): boolean {
  if (!products || products.length === 0) return false;
  return products.every(isProductOutOfStock);
}
