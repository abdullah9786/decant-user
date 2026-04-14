import { Suspense } from "react";
import type { Metadata } from "next";
import ProductListingClient from "./ProductListingClient";

export const metadata: Metadata = {
  title: "Shop All Fragrances | Decume",
  description:
    "Browse our curated collection of authentic perfume decants. Filter by brand, fragrance family, and more.",
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

async function getAllProducts() {
  try {
    const res = await fetch(`${API_URL}/products`, {
      next: { revalidate: 120 },
    });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

async function getAllFragranceFamilies() {
  try {
    const res = await fetch(`${API_URL}/fragrance-families`, {
      next: { revalidate: 120 },
    });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export default async function ProductListingPage() {
  const [products, fragranceFamilies] = await Promise.all([
    getAllProducts(),
    getAllFragranceFamilies(),
  ]);

  return (
    <Suspense
      fallback={
        <div className="py-32 text-center text-gray-300 font-serif italic">
          Loading...
        </div>
      }
    >
      <ProductListingClient
        initialProducts={products}
        initialFragranceFamilies={fragranceFamilies}
      />
    </Suspense>
  );
}
