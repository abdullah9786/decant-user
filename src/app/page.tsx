"use client";

import React, { useState, useEffect } from 'react';
import Hero from '@/components/home/Hero';
import Link from 'next/link';
import ProductCard from '@/components/ui/ProductCard';
import { productApi, categoryApi } from '@/lib/api';
import { Loader2 } from 'lucide-react';

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [featuredCategories, setFeaturedCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [catsLoading, setCatsLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const response = await productApi.getAll({ is_featured: true });
        const featured = response.data.filter((p: any) => p.is_featured).slice(0, 4);
        setFeaturedProducts(featured);
      } catch (err) {
        console.error("Error fetching featured products", err);
      } finally {
        setLoading(false);
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await categoryApi.getAll();
        // Filter featured categories
        const featured = response.data.filter((c: any) => c.is_featured).slice(0, 3);
        setFeaturedCategories(featured);
      } catch (err) {
        console.error("Error fetching categories", err);
      } finally {
        setCatsLoading(false);
      }
    };

    fetchFeatured();
    fetchCategories();
  }, []);

  return (
    <div>
      <Hero />
      
      {/* Dynamic Curated Collections */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-serif text-indigo-950 mb-4">Curated Collections</h2>
            <div className="h-1 w-20 bg-indigo-600 mx-auto"></div>
          </div>
          
          {catsLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin text-indigo-200" size={32} />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredCategories.length > 0 ? (
                featuredCategories.map((cat) => (
                  <Link key={cat._id} href={`/products?category=${cat.name}`} className="group relative h-96 overflow-hidden bg-gray-100 shadow-xl shadow-slate-200/50">
                    {cat.image_url ? (
                      <img 
                        src={cat.image_url} 
                        alt={cat.name} 
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                      />
                    ) : (
                      <div className="absolute inset-0 bg-indigo-50 flex items-center justify-center text-4xl">{cat.icon || '✨'}</div>
                    )}
                    <div className="absolute inset-0 bg-black/60 md:bg-black/40 md:group-hover:bg-black/60 transition-all z-10 duration-500"></div>
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-20 p-6 text-center">
                      <span className="text-white/80 text-[10px] font-bold uppercase tracking-[0.3em] mb-4 md:opacity-0 md:group-hover:opacity-100 transition-all transform md:translate-y-4 md:group-hover:translate-y-0 duration-500">Fragrance Essence</span>
                      <h3 className="text-white text-3xl font-serif mb-6 transform md:translate-y-2 md:group-hover:translate-y-0 transition-all duration-500 uppercase tracking-widest leading-tight">{cat.name}</h3>
                      <span className="bg-white/20 backdrop-blur-md text-white px-6 py-2 text-[10px] font-bold uppercase tracking-widest border border-white/30 md:opacity-0 md:group-hover:opacity-100 transition-all duration-500 transform md:translate-y-4 md:group-hover:translate-y-0 hover:bg-white hover:text-indigo-950">Explore Collection</span>
                    </div>
                  </Link>
                ))
              ) : (
                // Fallback if no featured categories exist
                [
                  { name: 'Designer Favorites', query: 'category=Designer', icon: '🎩' },
                  { name: 'Niche Exclusives', query: 'category=Niche', icon: '🧪' },
                  { name: 'Discovery Sets', query: 'featured=true', icon: '🎁' }
                ].map((cat) => (
                  <Link key={cat.name} href={`/products?${cat.query}`} className="group relative h-80 overflow-hidden bg-gray-50 flex items-center justify-center border border-slate-100">
                    <span className="text-4xl grayscale group-hover:grayscale-0 transition-all">{cat.icon}</span>
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
                      <h3 className="text-slate-900 text-xl font-serif mb-2 group-hover:text-indigo-600 transition-colors uppercase tracking-widest">{cat.name}</h3>
                    </div>
                  </Link>
                ))
              )}
            </div>
          )}
        </div>
      </section>

      {/* Featured Perfumes */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-[0.3em] mb-4 inline-block">THE EDIT</span>
            <h2 className="text-3xl font-serif text-indigo-950">Featured Fragrances</h2>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
               <Loader2 className="animate-spin text-indigo-200" size={32} />
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {featuredProducts.map((product) => (
                <ProductCard key={product._id || product.id} {...product} />
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-400 italic py-12">
              Browse our collection to see all perfumes.
            </div>
          )}

          <div className="mt-16 text-center">
             <Link href="/products" className="inline-block border-b-2 border-indigo-950 pb-1 text-sm font-bold uppercase tracking-widest text-indigo-950 hover:text-indigo-600 hover:border-indigo-600 transition-all">
                View Full Collection
             </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
