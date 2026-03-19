"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import ProductCard from '@/components/ui/ProductCard';
import { ChevronDown, Filter, X, Loader2 } from 'lucide-react';
import { categoryApi, productApi } from '@/lib/api';
import { useRouter, useSearchParams } from 'next/navigation';

export default function ProductListingPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [sortBy, setSortBy] = useState('custom');
  const [filterBrands, setFilterBrands] = useState<string[]>([]);
  const [filterCategories, setFilterCategories] = useState<string[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [fetchingCategories, setFetchingCategories] = useState(true);
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
        setFilterCategories(categoryParam ? [categoryParam] : []);
        setFilterBrands(brandParam ? [brandParam] : []);

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

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryApi.getAll();
        setCategories(response.data || []);
      } catch (err) {
        console.error("Error fetching categories", err);
      } finally {
        setFetchingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  const brands = useMemo(() => {
    return Array.from(new Set(products.map(p => p.brand)));
  }, [products]);

  const filteredAndSortedProducts = useMemo(() => {
    let result = [...products];

    // Filter by brand
    if (filterBrands.length > 0) {
      result = result.filter(p => filterBrands.includes(p.brand));
    }
    if (filterCategories.length > 0) {
      result = result.filter(p => filterCategories.includes(p.category));
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
  }, [products, filterBrands, filterCategories, sortBy]);

  const toggleBrand = (brand: string) => {
    setFilterBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  const toggleCategory = (category: string) => {
    setFilterCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  const clearAllFilters = () => {
    setFilterBrands([]);
    setFilterCategories([]);
    router.replace('/products');
  };

  const sortOptions = [
    { label: 'Recommended', value: 'custom' },
    { label: 'Featured', value: 'featured' },
    { label: 'Price: Low to High', value: 'price-asc' },
    { label: 'Price: High to Low', value: 'price-desc' },
  ];

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="animate-spin text-emerald-600" size={40} />
        <p className="text-sm text-gray-400 uppercase tracking-widest">Entering the fragrance vault...</p>
      </div>
    );
  }

  return (
    <div className="py-20 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12">
          <div>
            <nav className="text-[10px] uppercase tracking-widest text-gray-400 mb-4">
              <Link href="/">Home</Link> / <span className="text-emerald-600">Shop All</span>
            </nav>
            <h1 className="text-4xl font-serif text-emerald-950">Fragrance Collection</h1>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-6 md:mt-0 relative">
             {/* Filter Trigger */}
             <div className="relative">
                <div className="flex items-center space-x-1">
                  <button 
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                    className={`flex items-center space-x-2 px-4 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all border ${
                      filterBrands.length > 0 || filterCategories.length > 0
                        ? 'bg-emerald-950 text-white border-emerald-950 shadow-lg shadow-emerald-900/10'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-emerald-300 hover:text-emerald-700'
                    }`}
                  >
                    <Filter size={14} />
                    <span>
                      {filterBrands.length || filterCategories.length
                        ? `Filter (${filterBrands.length + filterCategories.length})`
                        : 'Filter'}
                    </span>
                    <ChevronDown size={14} />
                  </button>
                  {(filterBrands.length > 0 || filterCategories.length > 0) && (
                    <button 
                      onClick={clearAllFilters}
                      className="ml-1 text-[10px] uppercase tracking-widest font-bold text-emerald-900 bg-emerald-50 border border-emerald-100 px-3 py-2 rounded-full hover:bg-emerald-100 transition-colors"
                      title="Clear filter"
                    >
                      Clear
                    </button>
                  )}
                </div>
                
                {isFilterOpen && (
                  <>
                    <button
                      type="button"
                      onClick={() => setIsFilterOpen(false)}
                      className="fixed inset-0 z-10 cursor-default"
                      aria-label="Close filters"
                    />
                  <div className="absolute top-full right-0 left-0 sm:left-auto mt-3 w-72 sm:w-72 bg-white border border-emerald-100 shadow-2xl z-20 p-5 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex justify-between items-center mb-4 pb-2 border-b border-emerald-50">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-700">Brands</span>
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFilterBrands([]);
                          setIsFilterOpen(false);
                        }}
                        className="p-1 hover:bg-emerald-50 rounded-full transition-colors"
                        title="Clear and close"
                      >
                        <X size={16} className="text-emerald-500 hover:text-emerald-700" />
                      </button>
                    </div>
                    <div className="max-h-60 overflow-y-auto space-y-2">
                       <button 
                        onClick={() => { setFilterBrands([]); setIsFilterOpen(false); }}
                        className={`block w-full text-left text-[11px] uppercase tracking-widest ${
                          filterBrands.length === 0 ? 'text-emerald-700 font-bold' : 'text-gray-600 hover:text-emerald-600'
                        }`}
                       >
                        All Brands
                       </button>
                       {brands.map(brand => (
                         <label
                           key={brand}
                           className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-gray-600 hover:text-emerald-600 cursor-pointer"
                         >
                           <input
                             type="checkbox"
                             checked={filterBrands.includes(brand)}
                             onChange={() => toggleBrand(brand)}
                             className="h-3.5 w-3.5 accent-emerald-700"
                           />
                           <span className={filterBrands.includes(brand) ? 'text-emerald-700 font-bold' : ''}>{brand}</span>
                         </label>
                       ))}
                    </div>

                    <div className="mt-6 flex justify-between items-center mb-4 pb-2 border-b border-emerald-50">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-700">Families</span>
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFilterCategories([]);
                          setIsFilterOpen(false);
                        }}
                        className="p-1 hover:bg-emerald-50 rounded-full transition-colors"
                        title="Clear and close"
                      >
                        <X size={16} className="text-emerald-500 hover:text-emerald-700" />
                      </button>
                    </div>
                    <div className="max-h-60 overflow-y-auto space-y-2">
                      <button 
                        onClick={() => { setFilterCategories([]); setIsFilterOpen(false); }}
                        className={`block w-full text-left text-[11px] uppercase tracking-widest ${
                          filterCategories.length === 0 ? 'text-emerald-700 font-bold' : 'text-gray-600 hover:text-emerald-600'
                        }`}
                      >
                        All Families
                      </button>
                      {fetchingCategories ? (
                        <div className="text-[11px] uppercase tracking-widest text-gray-400">Loading families...</div>
                      ) : (
                        categories.map((cat: any) => (
                          <label
                            key={cat._id || cat.name}
                            className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-gray-600 hover:text-emerald-600 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={filterCategories.includes(cat.name)}
                              onChange={() => toggleCategory(cat.name)}
                              className="h-3.5 w-3.5 accent-emerald-700"
                            />
                            <span className={filterCategories.includes(cat.name) ? 'text-emerald-700 font-bold' : ''}>{cat.name}</span>
                          </label>
                        ))
                      )}
                    </div>
                  </div>
                  </>
                )}
             </div>

             {/* Sort Trigger */}
             <div className="relative">
                <button 
                  onClick={() => setIsSortOpen(!isSortOpen)}
                  className="flex items-center space-x-2 px-4 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest bg-white text-gray-600 border border-gray-200 hover:border-emerald-300 hover:text-emerald-700 transition-all"
                >
                  <span>Sort: {sortOptions.find(o => o.value === sortBy)?.label}</span>
                  <ChevronDown size={14} />
                </button>

                {isSortOpen && (
                  <>
                  <button
                    type="button"
                    onClick={() => setIsSortOpen(false)}
                    className="fixed inset-0 z-10 cursor-default"
                    aria-label="Close sorting"
                  />
                  <div className="absolute top-full right-0 left-0 sm:left-auto mt-3 w-56 sm:w-56 bg-white border border-emerald-100 shadow-2xl z-20 p-2 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-200">
                    {sortOptions.map(option => (
                      <button
                        key={option.value}
                        onClick={() => { setSortBy(option.value); setIsSortOpen(false); }}
                        className={`block w-full text-left px-4 py-2 text-[11px] uppercase tracking-widest hover:bg-emerald-50 transition-colors ${
                          sortBy === option.value ? 'text-emerald-700 font-bold' : 'text-gray-600'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                  </>
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
              onClick={() => { setFilterBrands([]); setFilterCategories([]); setSortBy('custom'); }}
              className="mt-6 text-xs font-bold uppercase tracking-widest text-emerald-600 border-b border-emerald-600"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
