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
  return {
    title: `${product.name} by ${product.brand} | Decume`,
    description: `Buy ${product.name} by ${product.brand} perfume decant. ${product.variants?.[0] ? `Starting at ₹${product.variants[0].price}.` : ""} Authentic, hand-filled, pan-India delivery.`,
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

  return <ProductDetailClient product={product} />;
}
