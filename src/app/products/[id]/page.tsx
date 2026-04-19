import Link from "next/link";
import type { Metadata } from "next";
import ProductDetailClient from "./ProductDetailClient";

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

  const matchedVariant =
    sizeParam != null
      ? product.variants?.find(
          (v: any) => v.size_ml === sizeParam && !!v.is_pack === isPack
        )
      : null;

  let title: string;
  let description: string;
  let canonicalUrl = `https://decume.in/products/${slug}`;

  if (matchedVariant) {
    const typeLabel = isPack ? "Sealed Bottle" : "Decant";
    title = `${product.name} ${matchedVariant.size_ml}ml ${typeLabel} by ${product.brand}`;
    description = `Buy ${product.name} ${matchedVariant.size_ml}ml ${typeLabel.toLowerCase()} by ${product.brand} at ₹${matchedVariant.price}. Authentic, hand-filled, pan-India delivery.`;
    const qp = new URLSearchParams();
    qp.set("size", String(matchedVariant.size_ml));
    if (isPack) qp.set("pack", "true");
    if (sp.bottle) qp.set("bottle", sp.bottle);
    canonicalUrl += `?${qp.toString()}`;
  } else {
    title = `${product.name} by ${product.brand} — Perfume Decant`;
    description = `Buy ${product.name} by ${product.brand} perfume decant. ${product.variants?.[0] ? `Starting at ₹${product.variants[0].price}.` : ""} Authentic, hand-filled, pan-India delivery.`;
  }

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
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
  const matchedVariant =
    sizeParam != null
      ? product.variants?.find(
          (v: any) => v.size_ml === sizeParam && !!v.is_pack === isPack
        )
      : null;

  const productJsonLd: Record<string, any> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description?.replace(/<[^>]*>/g, "").slice(0, 300),
    brand: { "@type": "Brand", name: product.brand },
    ...(product.image_url && { image: product.image_url }),
  };

  if (matchedVariant) {
    productJsonLd.offers = {
      "@type": "Offer",
      priceCurrency: "INR",
      price: matchedVariant.price,
      url: `https://decume.in/products/${slug}?size=${matchedVariant.size_ml}${isPack ? "&pack=true" : ""}`,
      availability:
        isPack
          ? (matchedVariant.stock ?? 0) >= 1
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock"
          : (product.stock_ml ?? 0) >= matchedVariant.size_ml
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
    };
  } else if (product.variants?.length > 0) {
    productJsonLd.offers = {
      "@type": "AggregateOffer",
      priceCurrency: "INR",
      lowPrice: Math.min(...product.variants.map((v: any) => v.price)),
      highPrice: Math.max(...product.variants.map((v: any) => v.price)),
      availability:
        (product.stock_ml ?? 0) > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      offerCount: product.variants.length,
    };
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <ProductDetailClient
        product={product}
        bottles={bottles}
        initialSize={sizeParam}
        initialIsPack={isPack}
        initialBottleId={sp.bottle || null}
      />
    </>
  );
}
