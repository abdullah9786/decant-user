"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import ProductCard from '@/components/ui/ProductCard';
import { ChevronDown, X } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

interface ProductListingClientProps {
  initialProducts: any[];
  initialFragranceFamilies: any[];
}

export default function ProductListingClient({
  initialProducts,
  initialFragranceFamilies,
}: ProductListingClientProps) {
  const [sortBy, setSortBy] = useState('custom');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBrands, setFilterBrands] = useState<string[]>([]);
  const [filterFamilies, setFilterFamilies] = useState<string[]>([]);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isFilterBrandOpen, setIsFilterBrandOpen] = useState(false);
  const [isFilterFamilyOpen, setIsFilterFamilyOpen] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState<null | 'filter' | 'sort'>(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  React.useEffect(() => {
    const familyParam = searchParams.get('fragrance_family');
    const brandParam = searchParams.get('brand');
    if (familyParam) {
      setFilterFamilies(prev => prev.includes(familyParam) ? prev : [familyParam]);
    }
    if (brandParam) {
      setFilterBrands(prev => prev.includes(brandParam) ? prev : [brandParam]);
    }
  }, [searchParams]);

  const brands = useMemo(() => {
    return Array.from(new Set(initialProducts.map(p => p.brand)));
  }, [initialProducts]);

  const filteredAndSortedProducts = useMemo(() => {
    let result = [...initialProducts];

    if (searchTerm.trim().length > 0) {
      const term = searchTerm.trim().toLowerCase();
      result = result.filter((p) =>
        `${p.name || ''} ${p.brand || ''}`.toLowerCase().includes(term)
      );
    }

    if (filterBrands.length > 0) {
      result = result.filter(p => filterBrands.includes(p.brand));
    }
    if (filterFamilies.length > 0) {
      result = result.filter(p => filterFamilies.includes(p.fragrance_family));
    }

    if (sortBy === 'price-asc') {
      result.sort((a, b) => (a.variants?.[0]?.price || 0) - (b.variants?.[0]?.price || 0));
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => (b.variants?.[0]?.price || 0) - (a.variants?.[0]?.price || 0));
    } else if (sortBy === 'featured') {
      result.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));
    }

    return result;
  }, [initialProducts, filterBrands, filterFamilies, sortBy, searchTerm]);

  const toggleBrand = (brand: string) => {
    setFilterBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  const toggleFamily = (family: string) => {
    setFilterFamilies((prev) =>
      prev.includes(family) ? prev.filter((c) => c !== family) : [...prev, family]
    );
  };

  const clearAllFilters = () => {
    setFilterBrands([]);
    setFilterFamilies([]);
    router.replace('/products');
  };

  const sortOptions = [
    { label: 'Recommended', value: 'custom' },
    { label: 'Featured', value: 'featured' },
    { label: 'Price: Low to High', value: 'price-asc' },
    { label: 'Price: High to Low', value: 'price-desc' },
  ];

  return (
    <div className="pt-6 pb-12 md:py-20 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 md:mb-12">
          <div>
            <nav className="text-[10px] uppercase tracking-widest text-gray-400 mb-4">
              <Link href="/">Home</Link> / <span className="text-emerald-600">Shop All</span>
            </nav>
            <h1 className="text-4xl font-serif text-emerald-950">Fragrance Collection</h1>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-6 md:mt-0 w-full md:w-auto">
             <div className="relative w-full sm:w-64">
               <input
                 type="text"
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 onKeyDown={(e) => {
                   if (e.key === 'Enter') {
                     e.preventDefault();
                     e.currentTarget.blur();
                   }
                 }}
                 placeholder="Search fragrances..."
                 className="w-full px-4 py-2.5 pr-10 rounded-none border-b border-gray-200 text-base font-serif text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-emerald-600 bg-transparent"
               />
               {searchTerm && (
                 <button
                   onClick={() => setSearchTerm('')}
                   className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-600 p-1 transition-colors"
                   aria-label="Clear search"
                 >
                   <X size={16} />
                 </button>
               )}
             </div>
          </div>
        </div>

        {/* Filter / Sort Bar */}
        <div className="w-full border-t border-b border-gray-200 py-3 mb-8 flex justify-between items-center relative z-40">
          
          {/* Desktop Filter Dropdowns */}
          <div className="hidden md:flex items-center space-x-8">
            <div className="relative">
              <button 
                onClick={() => { setIsFilterBrandOpen(!isFilterBrandOpen); setIsFilterFamilyOpen(false); setIsSortOpen(false); }}
                className={`font-serif text-lg flex items-center transition-colors ${filterBrands.length > 0 ? 'text-emerald-700' : 'hover:text-emerald-700'}`}
              >
                Brand {filterBrands.length > 0 && `(${filterBrands.length})`} <ChevronDown size={14} className="ml-1 opacity-60" />
              </button>
              {isFilterBrandOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setIsFilterBrandOpen(false)} />
                  <div className="absolute top-full left-0 mt-3 w-64 bg-white border border-[#E2E2E2] shadow-sm z-50 p-4 animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="max-h-60 overflow-y-auto space-y-2">
                       <button onClick={() => { setFilterBrands([]); setIsFilterBrandOpen(false); }} className={`block w-full text-left text-sm font-serif ${filterBrands.length === 0 ? 'text-emerald-700' : 'text-gray-600 hover:text-emerald-600'}`}>All Brands</button>
                       {brands.map(brand => (
                         <label key={brand} className="flex items-center gap-2 text-sm font-serif text-gray-600 hover:text-emerald-600 cursor-pointer py-1">
                           <input type="checkbox" checked={filterBrands.includes(brand)} onChange={() => toggleBrand(brand)} className="h-3.5 w-3.5 accent-emerald-700" />
                           <span className={filterBrands.includes(brand) ? 'text-emerald-700' : ''}>{brand}</span>
                         </label>
                       ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="relative">
              <button 
                onClick={() => { setIsFilterFamilyOpen(!isFilterFamilyOpen); setIsFilterBrandOpen(false); setIsSortOpen(false); }}
                className={`font-serif text-lg flex items-center transition-colors ${filterFamilies.length > 0 ? 'text-emerald-700' : 'hover:text-emerald-700'}`}
              >
                Fragrance Family {filterFamilies.length > 0 && `(${filterFamilies.length})`} <ChevronDown size={14} className="ml-1 opacity-60" />
              </button>
              {isFilterFamilyOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setIsFilterFamilyOpen(false)} />
                  <div className="absolute top-full left-0 mt-3 w-64 bg-white border border-[#E2E2E2] shadow-sm z-50 p-4 animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="max-h-60 overflow-y-auto space-y-2">
                      <button onClick={() => { setFilterFamilies([]); setIsFilterFamilyOpen(false); }} className={`block w-full text-left text-sm font-serif ${filterFamilies.length === 0 ? 'text-emerald-700' : 'text-gray-600 hover:text-emerald-600'}`}>All Families</button>
                      {initialFragranceFamilies.map((fam: any) => (
                        <label key={fam._id || fam.name} className="flex items-center gap-2 text-sm font-serif text-gray-600 hover:text-emerald-600 cursor-pointer py-1">
                          <input type="checkbox" checked={filterFamilies.includes(fam.name)} onChange={() => toggleFamily(fam.name)} className="h-3.5 w-3.5 accent-emerald-700" />
                          <span className={filterFamilies.includes(fam.name) ? 'text-emerald-700' : ''}>{fam.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
            
            {(filterBrands.length > 0 || filterFamilies.length > 0) && (
              <button onClick={clearAllFilters} className="text-[10px] uppercase font-bold tracking-widest text-emerald-700 border-b border-emerald-700">
                Clear Filters
              </button>
            )}
          </div>

          {/* Desktop Sort Dropdown */}
          <div className="hidden md:flex relative ml-auto">
            <button 
              onClick={() => { setIsSortOpen(!isSortOpen); setIsFilterBrandOpen(false); setIsFilterFamilyOpen(false); }}
              className="font-serif text-lg flex items-center hover:text-emerald-700 transition-colors"
            >
              Sort by: {sortOptions.find(o => o.value === sortBy)?.label} <ChevronDown size={14} className="ml-1 opacity-60" />
            </button>
            {isSortOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setIsSortOpen(false)} />
                <div className="absolute top-full right-0 mt-3 w-56 bg-white border border-[#E2E2E2] shadow-sm z-50 p-2 animate-in fade-in slide-in-from-top-1 duration-200">
                  {sortOptions.map(option => (
                    <button
                      key={option.value}
                      onClick={() => { setSortBy(option.value); setIsSortOpen(false); }}
                      className={`block w-full text-left px-4 py-2 font-serif text-base transition-colors ${sortBy === option.value ? 'bg-slate-50 text-emerald-950 font-bold' : 'text-gray-600 hover:bg-slate-50 hover:text-emerald-950'}`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Mobile Buttons */}
          <div className="flex md:hidden w-full divide-x divide-gray-200">
            <button onClick={() => setMobileDrawerOpen('filter')} className="flex-1 py-1 text-center font-serif text-lg flex items-center justify-center">
              Filter {(filterBrands.length > 0 || filterFamilies.length > 0) && `(${filterBrands.length + filterFamilies.length})`}
            </button>
            <button onClick={() => setMobileDrawerOpen('sort')} className="flex-1 py-1 text-center font-serif text-lg flex items-center justify-center">
              Sort
            </button>
          </div>
        </div>

        {/* Mobile Filter Slide-Over Drawer */}
        {mobileDrawerOpen === 'filter' && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setMobileDrawerOpen(null)} />
            <div className="relative w-full max-w-sm bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <button onClick={() => setMobileDrawerOpen(null)} className="p-2 -ml-2"><X size={20} /></button>
                <span className="font-serif text-xl">Filter by</span>
                <div className="w-8"></div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                <div>
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-emerald-950 mb-4 border-b border-gray-100 pb-2">Brand</h3>
                  <div className="space-y-3">
                    {brands.map(brand => (
                      <label key={brand} className="flex items-center gap-3 font-serif text-lg cursor-pointer">
                        <input type="checkbox" checked={filterBrands.includes(brand)} onChange={() => toggleBrand(brand)} className="h-4 w-4 accent-[#4B4136]" />
                        <span className={filterBrands.includes(brand) ? 'text-[#4B4136] font-bold' : 'text-gray-700'}>{brand}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-emerald-950 mb-4 border-b border-gray-100 pb-2">Fragrance Family</h3>
                  <div className="space-y-3">
                    {initialFragranceFamilies.map((fam: any) => (
                      <label key={fam._id || fam.name} className="flex items-center gap-3 font-serif text-lg cursor-pointer">
                        <input type="checkbox" checked={filterFamilies.includes(fam.name)} onChange={() => toggleFamily(fam.name)} className="h-4 w-4 accent-[#4B4136]" />
                        <span className={filterFamilies.includes(fam.name) ? 'text-[#4B4136] font-bold' : 'text-gray-700'}>{fam.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-gray-100 bg-white grid grid-cols-2 gap-3">
                <button onClick={clearAllFilters} className="py-4 font-serif text-lg text-gray-600 border border-gray-200">Clear</button>
                <button onClick={() => setMobileDrawerOpen(null)} className="py-4 font-serif text-lg text-white bg-[#4B4136]">Apply</button>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Sort Slide-Over Drawer */}
        {mobileDrawerOpen === 'sort' && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setMobileDrawerOpen(null)} />
            <div className="relative w-full max-w-sm bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <button onClick={() => setMobileDrawerOpen(null)} className="p-2 -ml-2"><X size={20} /></button>
                <span className="font-serif text-xl">Sort by</span>
                <div className="w-8"></div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {sortOptions.map(option => (
                  <label key={option.value} className="flex items-center gap-3 font-serif text-lg cursor-pointer py-1">
                    <input 
                      type="radio" 
                      name="mobile_sort" 
                      checked={sortBy === option.value} 
                      onChange={() => setSortBy(option.value)} 
                      className="h-4 w-4 accent-[#4B4136]" 
                    />
                    <span className={sortBy === option.value ? 'text-[#4B4136] font-bold' : 'text-gray-700'}>{option.label}</span>
                  </label>
                ))}
              </div>

              <div className="p-4 border-t border-gray-100 bg-white">
                <button onClick={() => setMobileDrawerOpen(null)} className="w-full py-4 font-serif text-lg text-white bg-[#4B4136]">Apply</button>
              </div>
            </div>
          </div>
        )}

        {filteredAndSortedProducts.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-8 lg:gap-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {filteredAndSortedProducts.map((product) => (
              <ProductCard key={product._id || product.id} {...product} />
            ))}
          </div>
        ) : (
          <div className="py-40 text-center">
            <p className="font-serif italic text-gray-400 text-xl">No products match your selection.</p>
            <button 
              onClick={() => { setFilterBrands([]); setFilterFamilies([]); setSortBy('custom'); }}
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
