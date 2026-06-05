export interface ProductVariant {
  size_ml: number;
  price: number;
  is_pack?: boolean;
  stock?: number;
}

export interface MatchedVariant {
  size_ml: number;
  price: number;
  is_pack: boolean;
  stock?: number;
}

export interface ProductFormat {
  hasDecant: boolean;
  hasPack: boolean;
}

const BASE_URL = "https://decume.in";

export function getProductFormat(
  variants: ProductVariant[] | undefined,
): ProductFormat {
  const list = variants ?? [];
  return {
    hasDecant: list.some((v) => !v.is_pack),
    hasPack: list.some((v) => v.is_pack),
  };
}

export function getFormatLabel(format: ProductFormat): string {
  if (format.hasDecant && format.hasPack) return "Decants & Sealed Bottles";
  if (format.hasDecant) return "Decant";
  if (format.hasPack) return "Sealed Bottle";
  return "Perfume";
}

export function getVariantTypeLabel(isPack: boolean): string {
  return isPack ? "Sealed Bottle" : "Decant";
}

function sortedSizes(variants: ProductVariant[], isPack: boolean): string {
  return variants
    .filter((v) => !!v.is_pack === isPack)
    .map((v) => v.size_ml)
    .sort((a, b) => a - b)
    .map((ml) => `${ml}ml`)
    .join(", ");
}

function startingPrice(variants: ProductVariant[] | undefined): string {
  if (!variants?.length) return "";
  const min = Math.min(...variants.map((v) => v.price));
  return `Starting at ₹${min}. `;
}

function deliverySuffix(isPack: boolean): string {
  return isPack
    ? "Authentic fragrance, pan-India delivery."
    : "Authentic, hand-filled, pan-India delivery.";
}

export function buildProductSeoCopy(input: {
  name: string;
  brand: string;
  variants?: ProductVariant[];
  matchedVariant?: MatchedVariant | null;
}): {
  title: string;
  description: string;
  formatLabel: string;
  imageAlt: string;
  jsonLdName: string;
} {
  const { name, brand, variants, matchedVariant } = input;
  const format = getProductFormat(variants);

  if (matchedVariant) {
    const typeLabel = getVariantTypeLabel(matchedVariant.is_pack);
    const typeLower = typeLabel.toLowerCase();
    const title = `${name} ${matchedVariant.size_ml}ml ${typeLabel} by ${brand}`;
    const description = `Buy ${name} ${matchedVariant.size_ml}ml ${typeLower} by ${brand} at ₹${matchedVariant.price}. ${deliverySuffix(matchedVariant.is_pack)}`;
    return {
      title,
      description,
      formatLabel: `${matchedVariant.size_ml}ml ${typeLabel}`,
      imageAlt: `${name} ${matchedVariant.size_ml}ml ${typeLabel} by ${brand}`,
      jsonLdName: title,
    };
  }

  const priceText = startingPrice(variants);
  const formatLabel = getFormatLabel(format);

  if (format.hasDecant && !format.hasPack) {
    const sizes = sortedSizes(variants ?? [], false);
    const title = `${name} Decant by ${brand}`;
    const description = `Buy ${name} perfume decant by ${brand}.${sizes ? ` Available in ${sizes}.` : ""} ${priceText}${deliverySuffix(false)}`;
    return {
      title,
      description,
      formatLabel,
      imageAlt: `${name} decant by ${brand}`,
      jsonLdName: `${name} Decant by ${brand}`,
    };
  }

  if (format.hasPack && !format.hasDecant) {
    const sizes = sortedSizes(variants ?? [], true);
    const title = `${name} Sealed Bottle by ${brand}`;
    const description = `Buy ${name} sealed bottle by ${brand}.${sizes ? ` Available in ${sizes}.` : ""} ${priceText}${deliverySuffix(true)}`;
    return {
      title,
      description,
      formatLabel,
      imageAlt: `${name} sealed bottle by ${brand}`,
      jsonLdName: `${name} Sealed Bottle by ${brand}`,
    };
  }

  const decantSizes = sortedSizes(variants ?? [], false);
  const packSizes = sortedSizes(variants ?? [], true);
  const availabilityParts = [
    decantSizes ? `decants (${decantSizes})` : null,
    packSizes ? `sealed bottles (${packSizes})` : null,
  ].filter(Boolean);
  const title = `${name} by ${brand} — Decants & Sealed Bottles`;
  const description = `Buy ${name} by ${brand}. Available as ${availabilityParts.join(" and ")}. ${priceText}Authentic fragrance, pan-India delivery.`;
  return {
    title,
    description,
    formatLabel,
    imageAlt: `${name} by ${brand} — decants and sealed bottles`,
    jsonLdName: `${name} by ${brand}`,
  };
}

export function buildProductCanonicalUrl(
  slug: string,
  matchedVariant?: MatchedVariant | null,
  bottle?: string,
): string {
  let url = `${BASE_URL}/products/${slug}`;
  if (!matchedVariant) return url;

  const qp = new URLSearchParams();
  qp.set("size", String(matchedVariant.size_ml));
  if (matchedVariant.is_pack) qp.set("pack", "true");
  if (bottle) qp.set("bottle", bottle);
  return `${url}?${qp.toString()}`;
}

function variantAvailability(
  matchedVariant: MatchedVariant,
  stockMl: number,
): string {
  const inStock = matchedVariant.is_pack
    ? (matchedVariant.stock ?? 0) >= 1
    : stockMl >= matchedVariant.size_ml;
  return inStock
    ? "https://schema.org/InStock"
    : "https://schema.org/OutOfStock";
}

export function buildProductJsonLd(input: {
  name: string;
  brand: string;
  description?: string;
  imageUrl?: string;
  slug: string;
  stockMl?: number;
  variants?: ProductVariant[];
  matchedVariant?: MatchedVariant | null;
  jsonLdName: string;
}): Record<string, unknown> {
  const {
    name,
    brand,
    description,
    imageUrl,
    slug,
    stockMl = 0,
    variants,
    matchedVariant,
    jsonLdName,
  } = input;

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: jsonLdName || name,
    description: description?.replace(/<[^>]*>/g, "").slice(0, 300),
    brand: { "@type": "Brand", name: brand },
    ...(imageUrl && { image: imageUrl }),
  };

  if (matchedVariant) {
    jsonLd.offers = {
      "@type": "Offer",
      priceCurrency: "INR",
      price: matchedVariant.price,
      url: buildProductCanonicalUrl(slug, matchedVariant),
      availability: variantAvailability(matchedVariant, stockMl),
      itemCondition: "https://schema.org/NewCondition",
      name: `${name} ${matchedVariant.size_ml}ml ${getVariantTypeLabel(matchedVariant.is_pack)}`,
    };
  } else if (variants?.length) {
    jsonLd.offers = {
      "@type": "AggregateOffer",
      priceCurrency: "INR",
      lowPrice: Math.min(...variants.map((v) => v.price)),
      highPrice: Math.max(...variants.map((v) => v.price)),
      availability:
        stockMl > 0 || variants.some((v) => v.is_pack && (v.stock ?? 0) > 0)
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      offerCount: variants.length,
      url: `${BASE_URL}/products/${slug}`,
    };
  }

  return jsonLd;
}

export function buildProductBreadcrumbJsonLd(input: {
  productName: string;
  canonicalUrl: string;
}): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: BASE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Shop Fragrances",
        item: `${BASE_URL}/products`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: input.productName,
        item: input.canonicalUrl,
      },
    ],
  };
}
