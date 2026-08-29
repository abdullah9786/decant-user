import { Suspense } from "react";
import type { Metadata } from "next";
import ProductListingClient from "./ProductListingClient";
import { cacheFetchOptions } from "@/lib/cacheConfig";

export const metadata: Metadata = {
  title: "Shop All Fragrances | Decume",
  description:
    "Browse our curated collection of authentic perfume decants. Filter by brand, fragrance family, and more.",
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

async function getPaginatedProducts(searchParams: { [key: string]: string | string[] | undefined }) {
  try {
    const query = new URLSearchParams();
    query.append("paginated", "true");

    const page = parseInt(searchParams.page as string) || 1;
    const limit = 24;
    const skip = (page - 1) * limit;
    
    query.append("limit", limit.toString());
    query.append("skip", skip.toString());

    if (searchParams.brand) {
      if (Array.isArray(searchParams.brand)) {
        searchParams.brand.forEach(b => query.append("brand", b));
      } else {
        query.append("brand", searchParams.brand);
      }
    }

    if (searchParams.fragrance_family) {
      if (Array.isArray(searchParams.fragrance_family)) {
        searchParams.fragrance_family.forEach(f => query.append("fragrance_family", f));
      } else {
        query.append("fragrance_family", searchParams.fragrance_family);
      }
    }

    const type = searchParams.type as string;
    if (type && type !== "all") {
      query.append("product_type", type);
    }

    const sort = searchParams.sort as string;
    if (sort) {
      if (sort === "featured") {
        query.append("is_featured", "true");
      } else {
        query.append("sort_by", sort);
      }
    }

    const search = searchParams.q as string;
    if (search) {
      query.append("q", search);
    }

    const res = await fetch(`${API_URL}/products?${query.toString()}`, cacheFetchOptions());
    if (!res.ok) return { items: [], total: 0, has_more: false };
    return await res.json();
  } catch (err) {
    console.error(err);
    return { items: [], total: 0, has_more: false };
  }
}

async function getAllFragranceFamilies() {
  try {
    const res = await fetch(`${API_URL}/fragrance-families`, cacheFetchOptions());
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export default async function ProductListingPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  
  const [productsData, fragranceFamilies] = await Promise.all([
    getPaginatedProducts(resolvedParams),
    getAllFragranceFamilies(),
  ]);

  const currentPage = parseInt(resolvedParams.page as string) || 1;
  const totalPages = Math.ceil((productsData.total || 0) / 24);

  return (
    <Suspense
      fallback={
        <div className="py-32 text-center text-gray-300 font-serif italic">
          Loading...
        </div>
      }
    >
      <ProductListingClient
        initialProducts={productsData.items || []}
        initialFragranceFamilies={fragranceFamilies}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={productsData.total || 0}
      />
    </Suspense>
  );
}
