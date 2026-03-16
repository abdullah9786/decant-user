"use client";

import React, { useState, useEffect } from 'react';
import ProductCard from '@/components/ui/ProductCard';
import { productApi } from '@/lib/api';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function NewArrivalsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNewArrivals = async () => {
      try {
        const response = await productApi.getAll({ is_new_arrival: true });
        setProducts(response.data || []);
      } catch (err) {
        console.error("Error fetching arrivals", err);
      } finally {
        setLoading(false);
      }
    };
    fetchNewArrivals();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
      </div>
    );
  }

  return (
    <div className="py-20 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <nav className="text-[10px] uppercase tracking-widest text-gray-400 mb-6">
            <Link href="/">Home</Link> / <span className="text-indigo-600">New Arrivals</span>
          </nav>
          <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-[0.3em] mb-4 inline-block">FRESHLY CURATED</span>
          <h1 className="text-4xl md:text-5xl font-serif text-indigo-950">New Arrivals</h1>
          <p className="mt-4 text-gray-500 italic">The latest additions to our exclusive fragrance vault.</p>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {products.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
             <p className="text-gray-400 italic font-serif">Awaiting the next great masterpiece...</p>
             <Link href="/products" className="mt-8 inline-block text-xs font-bold uppercase tracking-widest text-indigo-600 border-b border-indigo-600">
                Browse Collection
             </Link>
          </div>
        )}
      </div>
    </div>
  );
}
