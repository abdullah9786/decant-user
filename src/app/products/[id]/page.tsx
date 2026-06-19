import Link from "next/link";
import type { Metadata } from "next";
import { cache } from "react";
import ProductDetailClient from "./ProductDetailClient";
import SetDetailClient from "./SetDetailClient";
import {
  buildProductBreadcrumbJsonLd,
  buildProductCanonicalUrl,
  buildProductJsonLd,
  buildProductSeoCopy,
  type MatchedVariant,
} from "@/lib/product/productSeo";
import { DAILY_DEAL_CACHE_TAG, productReviewsTag } from "@/lib/cacheTags";
import { CACHE_REVALIDATE_SECONDS, cacheFetchOptions } from "@/lib/cacheConfig";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

/** Same tag as layout/home deal fetches so admin deal saves invalidate PDP data. */
const productDealFetchOptions = cacheFetchOptions([DAILY_DEAL_CACHE_TAG]);

/**
 * ISR window for the statically-rendered PDP. The route no longer reads
 * `searchParams` (variant selection moved client-side), so Next can prerender
 * + edge-cache the HTML and serve it instantly. Variant deep links (`?size=`)
 * are applied on the client after hydration without de-opting to SSR.
 */
export const revalidate = 86400;
export const dynamicParams = true;

const getProduct = cache(async (id: string) => {
  try {
    const res = await fetch(`${API_URL}/products/${id}`, productDealFetchOptions);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
});

async function getBottles() {
  try {
    const res = await fetch(`${API_URL}/bottles`, cacheFetchOptions());
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

async function getReviewSummary(productId: string) {
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

function seoInput(product: any, matchedVariant: MatchedVariant | null) {
  return {
    name: product.name,
    brand: product.brand,
    variants: product.variants,
    matchedVariant,
    productType: product.product_type,
    setItemCount: product.set_items?.length ?? 0,
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) return { title: "Product Not Found | Decume" };

  const slug = product.slug || product._id || product.id;
  // Canonical is the clean product URL. Variant query params (?size=, ?pack=)
  // are client-side UI state, not distinct indexable pages — pointing canonical
  // at the base URL avoids duplicate-content dilution across variants.
  const seo = buildProductSeoCopy(seoInput(product, null));
  const canonicalUrl = buildProductCanonicalUrl(slug);

  return {
    title: seo.title,
    description: seo.description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: seo.title,
      description: seo.description,
      url: canonicalUrl,
      type: "website",
      ...(product.image_url && {
        images: [{ url: product.image_url, alt: seo.imageAlt }],
      }),
    },
    twitter: {
      card: "summary_large_image",
      title: seo.title,
      description: seo.description,
      ...(product.image_url && { images: [product.image_url] }),
    },
  };
}

/**
 * Pre-render active products at build so popular PDPs ship as static HTML.
 * Anything not listed here is rendered on first request, then ISR-cached
 * (`dynamicParams = true`), so the catalog stays fully covered.
 */
export async function generateStaticParams() {
  try {
    const res = await fetch(`${API_URL}/products`, cacheFetchOptions());
    if (!res.ok) return [];
    const products = await res.json();
    return (Array.isArray(products) ? products : [])
      .map((p: any) => ({ id: String(p.slug || p._id || p.id || "") }))
      .filter((p: { id: string }) => p.id);
  } catch {
    return [];
  }
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  // Related products + the full review list are loaded client-side (below the
  // fold, not SEO-critical) so they stay off the static render's critical path.
  const [product, bottles] = await Promise.all([
    getProduct(id),
    getBottles(),
  ]);

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <p className="text-gray-400 font-serif italic text-xl">
          Fragrance not found.
        </p>
        <Link
          href="/products"
          className="text-xs font-bold uppercase tracking-widest text-emerald-600 border-b border-emerald-600"
        >
          Back to Collection
        </Link>
      </div>
    );
  }

  const slug = product.slug || product._id || product.id;
  const isSet = product.product_type === "set";
  const productId = String(product._id || product.id);
  // Only the lightweight summary is fetched server-side — it powers the
  // aggregateRating rich snippet (stars) and the rating header. The full
  // review list is loaded client-side.
  const reviewSummary = await getReviewSummary(productId);

  const seo = buildProductSeoCopy(seoInput(product, null));
  const canonicalUrl = buildProductCanonicalUrl(slug);

  const productJsonLd = buildProductJsonLd({
    name: product.name,
    brand: product.brand,
    description: product.description,
    imageUrl: product.image_url,
    slug,
    stockMl: product.stock_ml,
    variants: product.variants,
    matchedVariant: null,
    jsonLdName: seo.jsonLdName,
    reviewSummary:
      reviewSummary.review_count > 0
        ? {
            average_rating: reviewSummary.average_rating,
            review_count: reviewSummary.review_count,
          }
        : undefined,
  });

  const breadcrumbJsonLd = buildProductBreadcrumbJsonLd({
    productName: product.name,
    canonicalUrl,
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {isSet ? (
        <SetDetailClient
          product={product}
          bottles={bottles}
          reviewSummary={reviewSummary}
        />
      ) : (
        <ProductDetailClient
          product={product}
          bottles={bottles}
          reviewSummary={reviewSummary}
        />
      )}
    </>
  );
}
