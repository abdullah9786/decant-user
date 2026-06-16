import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { FolderOpen } from "lucide-react";
import ProductCard from "@/components/ui/ProductCard";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

async function getCategories() {
  try {
    const res = await fetch(`${API_URL}/categories`, {
      next: { revalidate: 600 },
    });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

async function getCategoryProducts(categoryId: string) {
  try {
    const res = await fetch(
      `${API_URL}/products?category_id=${encodeURIComponent(categoryId)}`,
      { next: { revalidate: 600 } },
    );
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const categories = await getCategories();
  const category = categories.find((c: { slug?: string }) => c.slug === slug);

  if (!category) {
    return { title: "Category Not Found" };
  }

  return {
    title: category.name,
    description:
      category.description ||
      `Browse ${category.name} — authentic perfume decants at Decume.`,
    alternates: {
      canonical: `https://decume.in/categories/${slug}`,
    },
  };
}

export default async function CategoryDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const categories = await getCategories();
  const category = categories.find((c: { slug?: string }) => c.slug === slug);

  if (!category) {
    return (
      <div className="py-32 text-center">
        <h1 className="text-2xl font-serif text-gray-400">Category not found</h1>
        <Link
          href="/categories"
          className="mt-6 inline-block text-xs uppercase tracking-widest font-bold text-emerald-600 border-b border-emerald-600"
        >
          View All Categories
        </Link>
      </div>
    );
  }

  const categoryId = String(category._id || category.id);
  const products = await getCategoryProducts(categoryId);

  return (
    <div className="bg-white min-h-screen">
      <div className="relative h-72 md:h-72 overflow-hidden">
        {category.image_url ? (
          <Image
            src={category.image_url}
            alt={category.name}
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-100 to-slate-50 flex items-center justify-center">
            <FolderOpen size={64} className="text-emerald-200" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 max-w-7xl mx-auto">
          <nav className="text-[10px] uppercase tracking-widest text-white/60 mb-3">
            <Link href="/">Home</Link> /{" "}
            <Link href="/categories">Categories</Link> /{" "}
            <span className="text-white">{category.name}</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-serif text-white">
            {category.name}
          </h1>
          {category.description && (
            <p className="text-white/80 text-sm mt-2 max-w-lg">
              {category.description}
            </p>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {products.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4 -mx-4 px-2 md:-mx-7 md:px-4">
            {products.map((product: any) => (
              <ProductCard key={product._id || product.id} {...product} />
            ))}
          </div>
        ) : (
          <div className="py-32 text-center">
            <p className="font-serif italic text-gray-400 text-xl">
              No products in this category yet.
            </p>
            <Link
              href="/products"
              className="mt-6 inline-block text-xs uppercase tracking-widest font-bold text-emerald-600 border-b border-emerald-600"
            >
              Browse All Products
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
