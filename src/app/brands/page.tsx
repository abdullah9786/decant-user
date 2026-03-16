"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { productApi } from '@/lib/api';
import { Loader2 } from 'lucide-react';

export default function BrandsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await productApi.getAll();
        setProducts(response.data);
      } catch (err) {
        console.error("Error fetching brands", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBrands();
  }, []);

  const brands = useMemo(() => {
    return Array.from(new Set(products.map(p => p.brand))).sort();
  }, [products]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
      </div>
    );
  }

  return (
    <div className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-serif text-indigo-950 mb-4 text-center">Our Fragrance Brands</h1>
        <p className="text-gray-500 text-center uppercase tracking-[0.2em] text-xs mb-16">Curated from the world's most prestigious houses</p>

        {brands.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {brands.map((brand) => (
              <Link 
                key={brand}
                href={`/products?brand=${brand}`}
                className="aspect-square flex flex-col items-center justify-center p-8 bg-gray-50 border border-gray-100 transition-all hover:bg-indigo-950 hover:text-white group"
              >
                <span className="font-serif text-xl text-indigo-950 border-b border-transparent group-hover:text-white group-hover:border-white transition-all text-center">
                  {brand}
                </span>
                <span className="mt-4 text-[10px] uppercase tracking-widest text-gray-400 group-hover:text-white/60">
                  {products.filter(p => p.brand === brand).length} Fragrances
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
             <p className="text-gray-400 italic">No brands found in our vault yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
