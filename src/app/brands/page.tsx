"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { brandApi, productApi } from '@/lib/api';
import { Loader2 } from 'lucide-react';

export default function BrandsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const [brandResponse, productResponse] = await Promise.all([
          brandApi.getAll(),
          productApi.getAll()
        ]);
        setBrands(brandResponse.data || []);
        setProducts(productResponse.data || []);
      } catch (err) {
        console.error("Error fetching brands", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBrands();
  }, []);

  const brandCounts = useMemo(() => {
    const normalize = (value: string) => value.trim().toLowerCase();
    const counts = new Map<string, number>();
    products.forEach((product) => {
      if (!product.brand) return;
      const key = normalize(String(product.brand));
      counts.set(key, (counts.get(key) || 0) + 1);
    });
    return counts;
  }, [products]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-emerald-600" size={32} />
      </div>
    );
  }

  return (
    <div className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-serif text-emerald-950 mb-4 text-center">Our Fragrance Brands</h1>
        <p className="text-gray-500 text-center uppercase tracking-[0.2em] text-xs mb-16">Curated from the world's most prestigious houses</p>

        {brands.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {brands.map((brand) => {
              const count = brandCounts.get(brand.name.trim().toLowerCase()) || 0;
              return (
                <Link 
                  key={brand._id}
                  href={`/products?brand=${brand.name}`}
                  className="group rounded-3xl border border-emerald-100 bg-white/80 shadow-sm hover:shadow-xl transition-all overflow-hidden"
                >
                  <div className="relative aspect-[16/9] bg-emerald-50/60">
                    {brand.image_url ? (
                      <img
                        src={brand.image_url}
                        alt={brand.name}
                        className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-950 flex items-center justify-center p-8 text-center select-none overflow-hidden group-hover:brightness-110 transition-all duration-500">
                        {/* Luxury Texture/Glow Overlay */}
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.08),_transparent)] opacity-60" />
                        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-10 mix-blend-overlay" />
                        
                        <div className="relative">
                          <div className="text-emerald-50/5 text-7xl font-serif absolute inset-0 -top-6 -left-4 scale-150 blur-[1px] opacity-20 whitespace-nowrap uppercase tracking-widest leading-none">
                            {brand.name}
                          </div>
                          <h2 className="relative text-2xl md:text-3xl font-serif text-emerald-50/90 uppercase tracking-[0.3em] leading-tight drop-shadow-lg [text-shadow:6px_2px_3px_black]">
                            {brand.name}
                          </h2>
                        </div>
                      </div>
                    )}
                    <div className="absolute top-4 left-4 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] uppercase tracking-widest text-emerald-800 font-bold">
                      {count} Fragrances
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-serif text-2xl text-emerald-950 group-hover:text-emerald-900 transition-colors">
                      {brand.name}
                    </h3>
                    <p className="mt-3 text-sm text-slate-600 line-clamp-2">
                      {brand.description || 'Discover signature scents from this iconic house.'}
                    </p>
                    <div className="mt-6 text-[10px] uppercase tracking-[0.3em] text-emerald-700 font-bold">
                      Shop this brand
                    </div>
                  </div>
                </Link>
              );
            })}
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
