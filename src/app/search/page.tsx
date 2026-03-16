"use client";

import React, { useState, useEffect } from 'react';
import { Search as SearchIcon, X, SlidersHorizontal } from 'lucide-react';
import ProductCard from '@/components/ui/ProductCard';
import { productApi } from '@/lib/api';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    const timer = setTimeout(async () => {
      if (query.length < 3) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const response = await productApi.getAll({ q: query });
        if (active) setResults(response.data || []);
      } catch (err) {
        console.error("Search error", err);
      } finally {
        if (active) setLoading(false);
      }
    }, 300);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [query]);

  return (
    <div className="py-20 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto mb-20 text-center">
           <h1 className="text-4xl font-serif text-indigo-950 mb-10">Find Your Scent</h1>
           <div className="relative group">
             <input 
               type="text" 
               value={query}
               onChange={(e) => setQuery(e.target.value)}
               placeholder="Search brands, notes, or perfumes..."
               className="w-full bg-gray-50 border-b-2 border-gray-100 p-6 text-xl focus:outline-none focus:border-indigo-600 transition-all font-light"
             />
             <SearchIcon size={24} className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-600" />
           </div>
        </div>

        {query.length > 0 && (
          <div>
            <div className="flex justify-between items-end mb-12 border-b border-gray-100 pb-8">
              <p className="text-xs uppercase tracking-[0.2em] text-gray-400">
                Found <span className="text-indigo-950 font-bold">{results.length}</span> results for &ldquo;{query}&rdquo;
              </p>
              <button className="flex items-center space-x-2 text-xs font-bold uppercase tracking-widest text-indigo-950">
                <SlidersHorizontal size={14} />
                <span>Filters</span>
              </button>
            </div>

            {loading ? (
              <div className="py-20 text-center">
                <p className="text-gray-400 font-serif italic text-lg">Searching...</p>
              </div>
            ) : results.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {results.map((product) => (
                  <ProductCard key={product.id} {...product} />
                ))}
              </div>
            ) : (
              <div className="py-20 text-center">
                <p className="text-gray-400 font-serif italic text-lg">No matches found for this search.</p>
              </div>
            )}
          </div>
        )}

        {query.length === 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-indigo-950 mb-6">Trending Searches</h4>
              <div className="flex flex-wrap gap-3">
                {['Creed', 'Vanilla', 'Summer Scents', 'Niche', 'Baccarat'].map(t => (
                  <button key={t} onClick={() => setQuery(t)} className="px-4 py-2 bg-gray-50 text-[10px] font-bold uppercase tracking-widest hover:bg-indigo-100 transition-colors border border-gray-100">{t}</button>
                ))}
              </div>
            </div>
            <div className="md:col-span-2">
               <h4 className="text-xs font-bold uppercase tracking-widest text-indigo-950 mb-6">Browse Families</h4>
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 {['Woody', 'Floral', 'Fresh', 'Oriental'].map(f => (
                   <div key={f} className="aspect-square bg-gray-50 flex items-center justify-center border border-gray-100 hover:border-indigo-600 cursor-pointer transition-colors group">
                     <span className="text-[10px] font-bold uppercase tracking-widest group-hover:text-indigo-600 transition-colors">{f}</span>
                   </div>
                 ))}
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
