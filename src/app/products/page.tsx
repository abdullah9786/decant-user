"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import ProductCard from '@/components/ui/ProductCard';
import { ChevronDown, Filter, X, Loader2 } from 'lucide-react';
import { productApi } from '@/lib/api';
import { useRouter, useSearchParams } from 'next/navigation';

export default function ProductListingPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [sortBy, setSortBy] = useState('featured');
  const [filterBrand, setFilterBrand] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const categoryParam = searchParams.get('category');
        const brandParam = searchParams.get('brand');
        if (categoryParam) setFilterCategory(categoryParam);
        if (brandParam) setFilterBrand(brandParam);

        const response = await productApi.getAll({
          category: categoryParam || undefined,
          brand: brandParam || undefined,
        });
        setProducts(response.data);
      } catch (err: any) {
        setError("Failed to load fragrances. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [searchParams]);

  const brands = useMemo(() => {
    return Array.from(new Set(products.map(p => p.brand)));
  }, [products]);

  const filteredAndSortedProducts = useMemo(() => {
    let result = [...products];

    // Filter by brand
    if (filterBrand) {
      result = result.filter(p => p.brand === filterBrand);
    }
    if (filterCategory) {
      result = result.filter(p => p.category === filterCategory);
    }

    // Sort
    if (sortBy === 'price-asc') {
      result.sort((a, b) => {
        const aPrice = a.variants?.[0]?.price || 0;
        const bPrice = b.variants?.[0]?.price || 0;
        return aPrice - bPrice;
      });
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => {
        const aPrice = a.variants?.[0]?.price || 0;
        const bPrice = b.variants?.[0]?.price || 0;
        return bPrice - aPrice;
      });
    } else if (sortBy === 'featured') {
      result.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));
    }

    return result;
  }, [products, filterBrand, sortBy]);

  const sortOptions = [
    { label: 'Featured', value: 'featured' },
    { label: 'Price: Low to High', value: 'price-asc' },
    { label: 'Price: High to Low', value: 'price-desc' },
  ];

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
        <p className="text-sm text-gray-400 uppercase tracking-widest">Entering the fragrance vault...</p>
      </div>
    );
  }

  return (
    <div className="py-20 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12">
          <div>
            <nav className="text-[10px] uppercase tracking-widest text-gray-400 mb-4">
              <Link href="/">Home</Link> / <span className="text-indigo-600">Shop All</span>
            </nav>
            <h1 className="text-4xl font-serif text-indigo-950">Fragrance Collection</h1>
          </div>
          
          <div className="flex space-x-6 mt-6 md:mt-0 relative">
             {/* Filter Trigger */}
             <div className="relative">
                <div className="flex items-center space-x-1">
                  <button 
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                    className={`flex items-center space-x-2 text-xs font-bold uppercase tracking-widest pb-1 border-b-2 transition-colors ${filterBrand ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-400 hover:text-indigo-600'}`}
                  >
                    <Filter size={14} />
                    <span>{filterBrand || 'Filter'}</span>
                  </button>
                  {(filterBrand || filterCategory) && (
                    <button 
                      onClick={() => {
                        setFilterBrand(null);
                        setFilterCategory(null);
                        router.replace('/products');
                      }}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                      title="Clear filter"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
                
                {isFilterOpen && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-100 shadow-2xl z-20 p-4 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-50">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Brands</span>
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFilterBrand(null);
                          setIsFilterOpen(false);
                        }}
                        className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                        title="Clear and close"
                      >
                        <X size={16} className="text-gray-400 hover:text-indigo-600" />
                      </button>
                    </div>
                    <div className="max-h-60 overflow-y-auto space-y-2">
                       <button 
                        onClick={() => { setFilterBrand(null); setIsFilterOpen(false); }}
                        className={`block w-full text-left text-xs uppercase tracking-widest hover:text-indigo-600 ${!filterBrand ? 'text-indigo-600 font-bold' : 'text-gray-600'}`}
                       >
                        All Brands
                       </button>
                       {brands.map(brand => (
                         <button 
                          key={brand}
                          onClick={() => { setFilterBrand(brand); setIsFilterOpen(false); }}
                          className={`block w-full text-left text-xs uppercase tracking-widest hover:text-indigo-600 ${filterBrand === brand ? 'text-indigo-600 font-bold' : 'text-gray-600'}`}
                         >
                          {brand}
                         </button>
                       ))}
                    </div>
                  </div>
                )}
             </div>

             {/* Sort Trigger */}
             <div className="relative">
                <button 
                  onClick={() => setIsSortOpen(!isSortOpen)}
                  className="flex items-center space-x-2 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-indigo-600 transition-colors pb-1 border-b-2 border-transparent"
                >
                  <span>Sort: {sortOptions.find(o => o.value === sortBy)?.label}</span>
                  <ChevronDown size={14} />
                </button>

                {isSortOpen && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-100 shadow-2xl z-20 p-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    {sortOptions.map(option => (
                      <button
                        key={option.value}
                        onClick={() => { setSortBy(option.value); setIsSortOpen(false); }}
                        className={`block w-full text-left px-4 py-2 text-xs uppercase tracking-widest hover:bg-gray-50 transition-colors ${sortBy === option.value ? 'text-indigo-600 font-bold' : 'text-gray-600'}`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
             </div>
          </div>
        </div>

        {error ? (
          <div className="py-40 text-center">
            <p className="text-red-400 font-serif italic text-xl">{error}</p>
          </div>
        ) : filteredAndSortedProducts.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {filteredAndSortedProducts.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        ) : (
          <div className="py-40 text-center">
            <p className="font-serif italic text-gray-400 text-xl">No products match your selection.</p>
            <button 
              onClick={() => { setFilterBrand(null); setSortBy('featured'); }}
              className="mt-6 text-xs font-bold uppercase tracking-widest text-indigo-600 border-b border-indigo-600"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
