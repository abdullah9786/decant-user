import Link from "next/link";
import type { Metadata } from "next";
import ProductDetailClient from "./ProductDetailClient";
import SetDetailClient from "./SetDetailClient";
import {
  buildProductBreadcrumbJsonLd,
  buildProductCanonicalUrl,
  buildProductJsonLd,
  buildProductSeoCopy,
  type MatchedVariant,
} from "@/lib/product/productSeo";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

async function getProduct(id: string) {
  try {
    const res = await fetch(`${API_URL}/products/${id}`, {
      next: { revalidate: 600 },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function getBottles() {
  try {
    const res = await fetch(`${API_URL}/bottles`, {
      next: { revalidate: 900 },
    });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
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
      (v: any) => v.size_ml === sizeParam && !v.is_pack,
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
  const [product, bottles] = await Promise.all([getProduct(id), getBottles()]);

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
        />
      ) : (
        <ProductDetailClient
          product={product}
          bottles={bottles}
          initialSize={sizeParam}
          initialIsPack={isPack}
          initialBottleId={sp.bottle || null}
        />
      )}
    </>
  );
}
