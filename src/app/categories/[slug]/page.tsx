"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { categoryApi, productApi } from '@/lib/api';
import ProductCard from '@/components/ui/ProductCard';
import { Loader2, ArrowLeft, FolderOpen } from 'lucide-react';

export default function CategoryDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [category, setCategory] = useState<any>(null);
  const [allCategories, setAllCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          categoryApi.getAll(),
          productApi.getAll(),
        ]);
        const cats = catRes.data || [];
        setAllCategories(cats);
        const found = cats.find((c: any) => c.slug === slug);
        setCategory(found || null);

        if (found) {
          const catId = found._id;
          const allProds = prodRes.data || [];
          setProducts(allProds.filter((p: any) => (p.category_ids || []).includes(catId)));
        }
      } catch (err) {
        console.error("Error loading category", err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-emerald-600" size={32} />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="py-32 text-center">
        <h1 className="text-2xl font-serif text-gray-400">Category not found</h1>
        <Link href="/categories" className="mt-6 inline-block text-xs uppercase tracking-widest font-bold text-emerald-600 border-b border-emerald-600">
          View All Categories
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Hero */}
      <div className="relative h-56 md:h-72 overflow-hidden">
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
            <Link href="/">Home</Link> / <Link href="/categories">Categories</Link> / <span className="text-white">{category.name}</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-serif text-white">{category.name}</h1>
          {category.description && (
            <p className="text-white/80 text-sm mt-2 max-w-lg">{category.description}</p>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {products.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-8 lg:gap-12">
            {products.map((product) => (
              <ProductCard key={product._id || product.id} {...product} />
            ))}
          </div>
        ) : (
          <div className="py-32 text-center">
            <p className="font-serif italic text-gray-400 text-xl">No products in this category yet.</p>
            <Link href="/products" className="mt-6 inline-block text-xs uppercase tracking-widest font-bold text-emerald-600 border-b border-emerald-600">
              Browse All Products
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
