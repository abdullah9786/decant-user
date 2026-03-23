import Link from "next/link";
import type { Metadata } from "next";
import ProductDetailClient from "./ProductDetailClient";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

async function getProduct(id: string) {
  try {
    const res = await fetch(`${API_URL}/products/${id}`, {
      next: { revalidate: 120 },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) return { title: "Product Not Found | Decume" };

  const title = `${product.name} by ${product.brand} — Perfume Decant`;
  const description = `Buy ${product.name} by ${product.brand} perfume decant. ${product.variants?.[0] ? `Starting at ₹${product.variants[0].price}.` : ""} Authentic, hand-filled, pan-India delivery.`;
  const url = `https://decume.in/products/${product._id || product.id}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "website",
      ...(product.image_url && {
        images: [{ url: product.image_url, alt: product.name }],
      }),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(product.image_url && { images: [product.image_url] }),
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProduct(id);

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

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description?.replace(/<[^>]*>/g, "").slice(0, 300),
    brand: { "@type": "Brand", name: product.brand },
    ...(product.image_url && { image: product.image_url }),
    ...(product.variants?.length > 0 && {
      offers: {
        "@type": "AggregateOffer",
        priceCurrency: "INR",
        lowPrice: Math.min(...product.variants.map((v: any) => v.price)),
        highPrice: Math.max(...product.variants.map((v: any) => v.price)),
        availability:
          (product.stock_ml ?? 0) > 0
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
        offerCount: product.variants.length,
      },
    }),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <ProductDetailClient product={product} />
    </>
  );
}
