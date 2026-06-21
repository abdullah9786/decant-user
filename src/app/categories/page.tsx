import Link from "next/link";
import Image from "next/image";
import { FolderOpen } from "lucide-react";
import { cacheFetchOptions } from "@/lib/cacheConfig";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

const SITE_URL = "https://decume.in";

// ISR: render category list at build time, refresh daily (on-demand
// revalidation via `revalidate_category` keeps it fresh on admin edits).
export const revalidate = 86400;

async function getCategories() {
  try {
    const res = await fetch(`${API_URL}/categories`, cacheFetchOptions());
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export default async function CategoriesPage() {
  const categories = await getCategories();

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Shop by Category",
    numberOfItems: categories.length,
    itemListElement: categories.map((cat: any, index: number) => ({
      "@type": "ListItem",
      position: index + 1,
      name: cat.name,
      url: `${SITE_URL}/categories/${cat.slug}`,
    })),
  };

  return (
    <div className="py-20 bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-serif text-emerald-950 mb-4 text-center">Shop by Category</h1>
        <p className="text-gray-500 text-center uppercase tracking-[0.2em] text-xs mb-16">Curated collections for every preference</p>

        {categories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat: any) => (
              <Link
                key={cat._id || cat.slug}
                href={`/categories/${cat.slug}`}
                className="group relative overflow-hidden rounded-3xl border border-emerald-50 bg-white shadow-lg h-64 md:h-72"
              >
                {cat.image_url ? (
                  <Image
                    src={cat.image_url}
                    alt={cat.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-slate-100 flex items-center justify-center">
                    <FolderOpen size={48} className="text-emerald-200" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <div className="relative p-6 h-full flex flex-col justify-end">
                  <h3 className="text-white text-2xl font-serif">{cat.name}</h3>
                  {cat.description && (
                    <p className="text-white/70 text-sm mt-2 line-clamp-2">{cat.description}</p>
                  )}
                  <span className="mt-4 inline-flex items-center text-[10px] uppercase tracking-widest text-white/80 group-hover:tracking-[0.3em] transition-all">
                    Browse Collection →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-400 italic">No categories available yet. Check back soon.</p>
          </div>
        )}
      </div>
    </div>
  );
}
