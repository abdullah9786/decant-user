import { cache } from "react";
import sanitizeHtml from "sanitize-html";
import type { MatchedVariant } from "@/lib/product/productSeo";
import { isVariantInStock } from "@/lib/product/stock";
import { DAILY_DEAL_CACHE_TAG, productReviewsTag } from "@/lib/cacheTags";
import { CACHE_REVALIDATE_SECONDS, cacheFetchOptions } from "@/lib/cacheConfig";

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

/** Same tag as layout/home deal fetches so admin deal saves invalidate PDP data. */
const productDealFetchOptions = cacheFetchOptions([DAILY_DEAL_CACHE_TAG]);

/**
 * Shared by both the primary PDP (`[id]/page.tsx`) and the dedicated sealed-
 * bottle landing page (`[id]/sealed-bottle/page.tsx`) so they render from the
 * same product record without double-fetching within a request.
 */
export const getProduct = cache(async (id: string) => {
  try {
    const res = await fetch(`${API_URL}/products/${id}`, productDealFetchOptions);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
});

export async function getBottles() {
  try {
    const res = await fetch(`${API_URL}/bottles`, cacheFetchOptions());
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export async function getReviewSummary(productId: string) {
  try {
    const res = await fetch(`${API_URL}/reviews/product/${productId}/summary`, {
      next: {
        revalidate: CACHE_REVALIDATE_SECONDS,
        tags: [productReviewsTag(productId)],
      },
    });
    if (!res.ok) return { average_rating: 0, review_count: 0, rating_breakdown: {} };
    return await res.json();
  } catch {
    return { average_rating: 0, review_count: 0, rating_breakdown: {} };
  }
}

/**
 * Sanitize the rich-text product description on the server so it ships inside
 * the static/ISR HTML (visible in view-source and to crawlers) instead of being
 * injected client-side after hydration.
 *
 * Uses `sanitize-html` (pure JS) instead of DOMPurify so the server bundle
 * doesn't pull in `jsdom`, whose transitive ESM deps crash the Vercel
 * serverless runtime (ERR_REQUIRE_ESM) when a non-prebuilt product renders
 * on-demand.
 */
export function sanitizeDescription(raw: unknown): string {
  if (!raw || typeof raw !== "string") return "";
  const cleaned = raw.replace(/&nbsp;|\u00A0/g, " ");
  return sanitizeHtml(cleaned, {
    allowedTags: [
      "p", "br", "span", "div", "b", "strong", "i", "em", "u", "s", "mark",
      "small", "sub", "sup", "a", "ul", "ol", "li", "blockquote", "pre",
      "code", "hr", "h1", "h2", "h3", "h4", "h5", "h6", "img", "figure",
      "figcaption", "table", "thead", "tbody", "tr", "th", "td",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel", "name"],
      img: ["src", "alt", "title", "width", "height"],
      "*": ["class", "style"],
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowedSchemesByTag: { img: ["http", "https", "data"] },
  });
}

export function seoInput(product: any, matchedVariant: MatchedVariant | null) {
  return {
    name: product.name,
    brand: product.brand,
    variants: product.variants,
    matchedVariant,
    productType: product.product_type,
    setItemCount: product.set_items?.length ?? 0,
  };
}

/** First in-stock variant among `variants` (all of them, or a pre-filtered subset), else the first one. */
export function pickDefaultVariant(variants: any[] | undefined, stockMl: number) {
  const list = variants ?? [];
  const firstInStock = list.find((v: any) => isVariantInStock(v, stockMl));
  return firstInStock ?? list[0] ?? null;
}
