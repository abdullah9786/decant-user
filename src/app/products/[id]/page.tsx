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

async function getRelatedProducts(idOrSlug: string) {
  try {
    const res = await fetch(
      `${API_URL}/products/${encodeURIComponent(idOrSlug)}/related?limit=10`,
      productDealFetchOptions,
    );
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

async function getProductReviews(productId: string) {
  try {
    const res = await fetch(`${API_URL}/reviews/product/${productId}?limit=20`, {
      next: {
        revalidate: CACHE_REVALIDATE_SECONDS,
        tags: [productReviewsTag(productId)],
      },
    });
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

function resolveMatchedVariant(
  product: any,
  sizeParam: number | null,
  isPack: boolean,
): MatchedVariant | null {
  if (sizeParam == null) return null;
  if (product.product_type === "set") {
    const variant = product.variants?.find(
      (v: any) =>
        Number(v.size_ml) === sizeParam && !v.is_pack,
    );
    if (!variant) return null;
    return {
      size_ml: variant.size_ml,
      price: variant.price,
      is_pack: false,
      stock: variant.stock,
    };
  }
  const variant = product.variants?.find(
    (v: any) => v.size_ml === sizeParam && !!v.is_pack === isPack,
  );
  if (!variant) return null;
  return {
    size_ml: variant.size_ml,
    price: variant.price,
    is_pack: !!variant.is_pack,
    stock: variant.stock,
  };
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
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ size?: string; pack?: string; bottle?: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const sp = await searchParams;
  const product = await getProduct(id);
  if (!product) return { title: "Product Not Found | Decume" };

  const slug = product.slug || product._id || product.id;
  const sizeParam = sp.size ? parseInt(sp.size, 10) : null;
  const isPack = sp.pack === "true";
  const matchedVariant = resolveMatchedVariant(product, sizeParam, isPack);

  const seo = buildProductSeoCopy(seoInput(product, matchedVariant));
  const canonicalUrl = buildProductCanonicalUrl(slug, matchedVariant, sp.bottle);

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

export default async function ProductDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ size?: string; pack?: string; bottle?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  // Related API accepts the same id/slug as the product route — run in parallel
  // with product + bottles so we don't wait for product before starting /related.
  const [product, bottles, relatedProducts] = await Promise.all([
    getProduct(id),
    getBottles(),
    getRelatedProducts(id),
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
  const sizeParam = sp.size ? parseInt(sp.size, 10) : null;
  const isPack = sp.pack === "true";
  const matchedVariant = resolveMatchedVariant(product, sizeParam, isPack);
  const isSet = product.product_type === "set";
  const productId = String(product._id || product.id);
  const [reviews, reviewSummary] = await Promise.all([
    getProductReviews(productId),
    getReviewSummary(productId),
  ]);

  const seo = buildProductSeoCopy(seoInput(product, matchedVariant));
  const canonicalUrl = buildProductCanonicalUrl(slug, matchedVariant, sp.bottle);

  const productJsonLd = buildProductJsonLd({
    name: product.name,
    brand: product.brand,
    description: product.description,
    imageUrl: product.image_url,
    slug,
    stockMl: product.stock_ml,
    variants: product.variants,
    matchedVariant,
    jsonLdName: seo.jsonLdName,
    reviews: reviews.map((r: { user_name: string; rating: number; comment: string; created_at: string; is_verified_purchase?: boolean }) => ({
      user_name: r.user_name,
      rating: r.rating,
      comment: r.comment,
      created_at: r.created_at,
      is_verified_purchase: r.is_verified_purchase,
    })),
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
          initialSize={sizeParam}
          initialBottleId={sp.bottle || null}
          relatedProducts={relatedProducts}
          reviews={reviews}
          reviewSummary={reviewSummary}
        />
      ) : (
        <ProductDetailClient
          product={product}
          bottles={bottles}
          initialSize={sizeParam}
          initialIsPack={isPack}
          initialBottleId={sp.bottle || null}
          relatedProducts={relatedProducts}
          reviews={reviews}
          reviewSummary={reviewSummary}
        />
      )}
    </>
  );
}
