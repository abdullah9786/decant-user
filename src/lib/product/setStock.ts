export interface SetItemRef {
  product_id: string;
  stock_ml?: number;
}

export interface SetProductRef {
  product_type?: string;
  set_items?: SetItemRef[];
  variants?: {
    size_ml: number;
    is_pack?: boolean;
    price?: number;
    sale_price?: number;
    original_price?: number;
    label?: string | null;
  }[];
}

export function isSetProduct(product: { product_type?: string }): boolean {
  return product.product_type === "set";
}

/** Coerce API variant sizes (number or string) to a stable number for comparisons. */
export function normalizeSizeMl(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

export function sizesMatch(a: unknown, b: unknown): boolean {
  return normalizeSizeMl(a) === normalizeSizeMl(b);
}

export function getSetDecantVariants(product: SetProductRef) {
  return (product.variants ?? [])
    .filter((v) => !v.is_pack && normalizeSizeMl(v.size_ml) > 0)
    .map((v) => ({ ...v, size_ml: normalizeSizeMl(v.size_ml) }));
}

/** A set size is available when every linked fragrance has enough ml. */
export function isSetInStock(product: SetProductRef, sizeMl: number): boolean {
  const items = product.set_items ?? [];
  if (items.length === 0 || sizeMl <= 0) return false;
  return items.every((item) => (item.stock_ml ?? 0) >= sizeMl);
}
