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
  productType?: string;
  setItemCount?: number;
}): {
  title: string;
  description: string;
  formatLabel: string;
  imageAlt: string;
  jsonLdName: string;
} {
  const { name, brand, variants, matchedVariant, productType, setItemCount } = input;

  if (productType === "set") {
    const count = setItemCount ?? 0;
    if (matchedVariant) {
      const title = `${name} ${matchedVariant.size_ml}ml Decant Set`;
      const description = `Buy the ${name} ${matchedVariant.size_ml}ml curated decant set at ₹${matchedVariant.price}. ${count} fragrances included. Authentic, hand-filled, pan-India delivery.`;
      return {
        title,
        description,
        formatLabel: `${matchedVariant.size_ml}ml Set · ${count} fragrances`,
        imageAlt: `${name} ${matchedVariant.size_ml}ml decant set`,
        jsonLdName: title,
      };
    }
    const title = `${name} Decant Set`;
    const description = `Buy the ${name} curated decant set. ${count} fragrances included. ${startingPrice(variants)}Authentic, hand-filled, pan-India delivery.`;
    return {
      title,
      description,
      formatLabel: `${count}-Fragrance Set`,
      imageAlt: `${name} decant set`,
      jsonLdName: title,
    };
  }

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

  // Decant takes priority as the *default* page's title/description whenever
  // it's available — even for products that also sell a sealed bottle. A
  // product offering both used to get one diluted title ("X by Brand —
  // Decants & Sealed Bottles") that targeted neither search intent well.
  // Sealed-bottle intent now gets its own dedicated, crisply-titled page at
  // `/products/{slug}/sealed-bottle` (see that route's `generateMetadata`),
  // so the default page can stay focused on decant — the more common intent
  // — while still mentioning sealed-bottle availability in the description
  // as a secondary signal.
  if (format.hasDecant) {
    const sizes = sortedSizes(variants ?? [], false);
    const title = `${name} Decant by ${brand}`;
    const alsoPack = format.hasPack ? " Also available as a sealed bottle." : "";
    const description = `Buy ${name} perfume decant by ${brand}.${sizes ? ` Available in ${sizes}.` : ""} ${priceText}${deliverySuffix(false)}${alsoPack}`;
    return {
      title,
      description,
      formatLabel,
      imageAlt: `${name} decant by ${brand}`,
      jsonLdName: `${name} Decant by ${brand}`,
    };
  }

  if (format.hasPack) {
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

  // No variants at all — shouldn't normally happen, but keep a sane fallback.
  const title = `${name} by ${brand}`;
  const description = `${name} by ${brand}. ${priceText}Authentic fragrance, pan-India delivery.`;
  return {
    title,
    description,
    formatLabel,
    imageAlt: `${name} by ${brand}`,
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

/**
 * Canonical for the dedicated sealed-bottle landing page — a real path (not
 * a query param) so it's independently indexable and crawlable, unlike
 * `?pack=true` on the main PDP which intentionally collapses to the base URL.
 */
export function buildSealedBottleCanonicalUrl(slug: string): string {
  return `${BASE_URL}/products/${slug}/sealed-bottle`;
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

export interface ProductReviewJsonLdInput {
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
  is_verified_purchase?: boolean;
}

export interface ProductReviewSummaryJsonLdInput {
  average_rating: number;
  review_count: number;
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
  reviews?: ProductReviewJsonLdInput[];
  reviewSummary?: ProductReviewSummaryJsonLdInput;
  /** Overrides the computed offer URL — used by the sealed-bottle landing page so its JSON-LD points at its own canonical instead of the base PDP's `?pack=true` deep link. */
  canonicalUrlOverride?: string;
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
    reviews = [],
    reviewSummary,
    canonicalUrlOverride,
  } = input;

  // Helper function to generate SKU for variants
  const generateSku = (variant: ProductVariant): string => {
    const sizePart = `${variant.size_ml}ml`;
    const typePart = variant.is_pack ? 'pack' : 'decant';
    const slugPart = slug.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    return `${slugPart}-${sizePart}-${typePart}`;
  };

  // Helper function to create variant Product object
  const createVariantProduct = (variant: ProductVariant) => {
    const variantName = `${name} ${variant.size_ml}ml ${getVariantTypeLabel(!!variant.is_pack)}`;
    const variantSlug = `${variant.size_ml}ml-${variant.is_pack ? 'pack' : 'decant'}`;
    const variantUrl = `${BASE_URL}/products/${slug}?size=${variant.size_ml}${variant.is_pack ? '&pack=true' : ''}`;
    
    return {
      "@type": "Product",
      name: variantName,
      size: `${variant.size_ml}ml`,
      sku: generateSku(variant),
      url: variantUrl,
      description: description?.replace(/<[^>]*>/g, "").slice(0, 300),
      brand: { "@type": "Brand", name: brand },
      ...(imageUrl && { image: imageUrl }),
      offers: {
        "@type": "Offer",
        priceCurrency: "INR",
        price: variant.price,
        availability: variantAvailability(
          {
            size_ml: variant.size_ml,
            price: variant.price,
            is_pack: !!variant.is_pack,
            stock: variant.stock,
          },
          stockMl
        ),
        itemCondition: "https://schema.org/NewCondition",
        url: variantUrl,
        name: variantName,
      },
    };
  };

  // Separate decant and pack variants
  const decantVariants = variants?.filter((v) => !v.is_pack) || [];
  const packVariants = variants?.filter((v) => v.is_pack) || [];

  // Determine if we should use ProductGroup or single Product
  const hasMultipleVariants = decantVariants.length > 1 || (decantVariants.length > 0 && packVariants.length > 0);
  
  let jsonLd: Record<string, unknown>;

  if (hasMultipleVariants && !matchedVariant) {
    // Use ProductGroup for products with multiple size variants
    const variantProducts = decantVariants.map(createVariantProduct);
    
    jsonLd = {
      "@context": "https://schema.org",
      "@type": "ProductGroup",
      name: jsonLdName || name,
      description: description?.replace(/<[^>]*>/g, "").slice(0, 300),
      brand: { "@type": "Brand", name: brand },
      ...(imageUrl && { image: imageUrl }),
      variesBy: "https://schema.org/size",
      hasVariant: variantProducts,
      // Include aggregate offer for the group
      offers: {
        "@type": "AggregateOffer",
        priceCurrency: "INR",
        lowPrice: Math.min(...decantVariants.map((v) => v.price)),
        highPrice: Math.max(...decantVariants.map((v) => v.price)),
        availability:
          stockMl > 0 || decantVariants.some((v) => v.is_pack && (v.stock ?? 0) > 0)
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
        offerCount: decantVariants.length,
        url: canonicalUrlOverride ?? `${BASE_URL}/products/${slug}`,
      },
    };
  } else if (matchedVariant) {
    // Single variant selected - use individual Product
    const variantProduct = createVariantProduct({
      size_ml: matchedVariant.size_ml,
      price: matchedVariant.price,
      is_pack: matchedVariant.is_pack,
      stock: matchedVariant.stock,
    });
    
    jsonLd = {
      "@context": "https://schema.org",
      "@type": "Product",
      name: jsonLdName || name,
      description: description?.replace(/<[^>]*>/g, "").slice(0, 300),
      brand: { "@type": "Brand", name: brand },
      ...(imageUrl && { image: imageUrl }),
      ...variantProduct,
    };
  } else if (decantVariants.length === 1) {
    // Single decant variant - use individual Product
    const singleVariant = decantVariants[0];
    const variantProduct = createVariantProduct(singleVariant);
    
    jsonLd = {
      "@context": "https://schema.org",
      "@type": "Product",
      name: jsonLdName || name,
      description: description?.replace(/<[^>]*>/g, "").slice(0, 300),
      brand: { "@type": "Brand", name: brand },
      ...(imageUrl && { image: imageUrl }),
      ...variantProduct,
    };
  } else if (packVariants.length > 0) {
    // Only pack variants (sealed bottles) - treat as separate products
    const variantProducts = packVariants.map(createVariantProduct);
    
    jsonLd = {
      "@context": "https://schema.org",
      "@type": "ProductGroup",
      name: jsonLdName || name,
      description: description?.replace(/<[^>]*>/g, "").slice(0, 300),
      brand: { "@type": "Brand", name: brand },
      ...(imageUrl && { image: imageUrl }),
      variesBy: "https://schema.org/size",
      hasVariant: variantProducts,
      offers: {
        "@type": "AggregateOffer",
        priceCurrency: "INR",
        lowPrice: Math.min(...packVariants.map((v) => v.price)),
        highPrice: Math.max(...packVariants.map((v) => v.price)),
        availability:
          packVariants.some((v) => (v.stock ?? 0) > 0)
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
        offerCount: packVariants.length,
        url: canonicalUrlOverride ?? `${BASE_URL}/products/${slug}`,
      },
    };
  } else {
    // Fallback - no variants
    jsonLd = {
      "@context": "https://schema.org",
      "@type": "Product",
      name: jsonLdName || name,
      description: description?.replace(/<[^>]*>/g, "").slice(0, 300),
      brand: { "@type": "Brand", name: brand },
      ...(imageUrl && { image: imageUrl }),
    };
  }

  // Add aggregate rating if available
  const count = reviewSummary?.review_count ?? 0;
  if (count > 0 && reviewSummary) {
    jsonLd.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: reviewSummary.average_rating,
      reviewCount: count,
      bestRating: 5,
      worstRating: 1,
    };
  }

  // Add reviews if available
  if (reviews.length > 0) {
    jsonLd.review = reviews.map((review) => ({
      "@type": "Review",
      author: { "@type": "Person", name: review.user_name },
      reviewRating: {
        "@type": "Rating",
        ratingValue: review.rating,
        bestRating: 5,
        worstRating: 1,
      },
      reviewBody: review.comment.slice(0, 5000),
      datePublished: review.created_at,
      ...(review.is_verified_purchase && {
        itemReviewed: { "@type": "Product", name: jsonLdName || name },
      }),
    }));
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
