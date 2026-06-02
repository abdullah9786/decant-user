export interface VariantLabelInput {
  size_ml: number;
  is_pack?: boolean;
  label?: string | null;
}

/** Default storefront button text when no custom label is set. */
export function defaultVariantButtonLabel(v: VariantLabelInput): string {
  const ml = Number(v.size_ml);
  if (!ml) return v.is_pack ? "ML Pack" : "ML";
  return v.is_pack ? `${ml}ML Pack` : `${ml}ML`;
}

/** Custom admin label, or the default size-based text. */
export function variantButtonLabel(v: VariantLabelInput): string {
  const custom = v.label?.trim();
  if (custom) return custom;
  return defaultVariantButtonLabel(v);
}
