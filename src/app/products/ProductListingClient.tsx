"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import ProductCard from '@/components/ui/ProductCard';
import { ChevronDown, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

interface ProductListingClientProps {
  initialProducts: any[];
  initialFragranceFamilies: any[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
}

export default function ProductListingClient({
  initialProducts,
  initialFragranceFamilies,
  currentPage,
  totalPages,
  totalItems
}: ProductListingClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'custom');
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [filterBrands, setFilterBrands] = useState<string[]>(searchParams.getAll('brand'));
  const [filterFamilies, setFilterFamilies] = useState<string[]>(searchParams.getAll('fragrance_family'));
  const [filterType, setFilterType] = useState(searchParams.get('type') || 'all');
  
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isFilterBrandOpen, setIsFilterBrandOpen] = useState(false);
  const [isFilterFamilyOpen, setIsFilterFamilyOpen] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState<null | 'filter' | 'sort'>(null);

  const brands = Array.from(new Set(initialProducts.map(p => p.brand))).filter(Boolean);

  const updateUrl = (
    newBrands: string[], 
    newFamilies: string[], 
    newType: string, 
    newSort: string, 
    newSearch: string,
    newPage: number
  ) => {
    const params = new URLSearchParams();
    newBrands.forEach(b => params.append('brand', b));
    newFamilies.forEach(f => params.append('fragrance_family', f));
    if (newType !== 'all') params.set('type', newType);
    if (newSort !== 'custom') params.set('sort', newSort);
    if (newSearch.trim()) params.set('q', newSearch.trim());
    if (newPage > 1) params.set('page', newPage.toString());

    const qs = params.toString();
    router.replace(qs ? `/products?${qs}` : '/products', { scroll: false });
  };

  const toggleBrand = (brand: string) => {
    const next = filterBrands.includes(brand) ? filterBrands.filter((b) => b !== brand) : [...filterBrands, brand];
    setFilterBrands(next);
    updateUrl(next, filterFamilies, filterType, sortBy, searchTerm, 1);
  };

  const toggleFamily = (family: string) => {
    const next = filterFamilies.includes(family) ? filterFamilies.filter((c) => c !== family) : [...filterFamilies, family];
    setFilterFamilies(next);
    updateUrl(filterBrands, next, filterType, sortBy, searchTerm, 1);
  };

  const handleTypeChange = (type: string) => {
    setFilterType(type);
    updateUrl(filterBrands, filterFamilies, type, sortBy, searchTerm, 1);
  };

  const handleSortChange = (sort: string) => {
    setSortBy(sort);
    updateUrl(filterBrands, filterFamilies, filterType, sort, searchTerm, 1);
  };

  const handleSearchSubmit = () => {
    updateUrl(filterBrands, filterFamilies, filterType, sortBy, searchTerm, 1);
  };

  const clearAllFilters = () => {
    setFilterBrands([]);
    setFilterFamilies([]);
    setFilterType('all');
    setSortBy('custom');
    setSearchTerm('');
    router.replace('/products', { scroll: false });
  };

  const sortOptions = [
    { label: 'Recommended', value: 'custom' },
    { label: 'Featured', value: 'featured' },
    { label: 'Price: Low to High', value: 'price-asc' },
    { label: 'Price: High to Low', value: 'price-desc' },
  ];

  const createPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (page > 1) {
      params.set('page', page.toString());
    } else {
      params.delete('page');
    }
    const qs = params.toString();
    return qs ? `/products?${qs}` : '/products';
  };

  return (
    <div className="pt-6 pb-12 md:py-20 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 md:mb-12">
          <div>
            <nav className="text-[10px] uppercase tracking-widest text-gray-400 mb-4">
              <Link href="/">Home</Link> / <span className="text-emerald-600">Shop All</span>
            </nav>
            <h1 className="text-4xl font-serif text-emerald-950">Fragrance Collection</h1>
            <p className="mt-2 text-sm text-gray-500 font-serif">Showing {initialProducts.length} of {totalItems} results</p>
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
                     handleSearchSubmit();
                   }
                 }}
                 placeholder="Search fragrances..."
                 className="w-full px-4 py-2.5 pr-10 rounded-none border-b border-gray-200 text-base font-serif text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-emerald-600 bg-transparent"
               />
               {searchTerm && (
                 <button
                   onClick={() => {
                     setSearchTerm('');
                     updateUrl(filterBrands, filterFamilies, filterType, sortBy, '', 1);
                   }}
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
        <div className="w-full border-t border-b border-gray-200 py-3 mb-8 flex justify-between items-center relative z-10">
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
                       <button onClick={() => { setFilterBrands([]); updateUrl([], filterFamilies, filterType, sortBy, searchTerm, 1); setIsFilterBrandOpen(false); }} className={`block w-full text-left text-sm font-serif ${filterBrands.length === 0 ? 'text-emerald-700' : 'text-gray-600 hover:text-emerald-600'}`}>All Brands</button>
                       {brands.map(brand => (
                         <label key={brand as string} className="flex items-center gap-2 text-sm font-serif text-gray-600 hover:text-emerald-600 cursor-pointer py-1">
                           <input type="checkbox" checked={filterBrands.includes(brand as string)} onChange={() => toggleBrand(brand as string)} className="h-3.5 w-3.5 accent-emerald-700" />
                           <span className={filterBrands.includes(brand as string) ? 'text-emerald-700' : ''}>{brand as string}</span>
                         </label>
                       ))}
                       {filterBrands.filter(b => !brands.includes(b)).map(brand => (
                         <label key={brand} className="flex items-center gap-2 text-sm font-serif text-gray-600 hover:text-emerald-600 cursor-pointer py-1">
                           <input type="checkbox" checked={true} onChange={() => toggleBrand(brand)} className="h-3.5 w-3.5 accent-emerald-700" />
                           <span className="text-emerald-700">{brand}</span>
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
                      <button onClick={() => { setFilterFamilies([]); updateUrl(filterBrands, [], filterType, sortBy, searchTerm, 1); setIsFilterFamilyOpen(false); }} className={`block w-full text-left text-sm font-serif ${filterFamilies.length === 0 ? 'text-emerald-700' : 'text-gray-600 hover:text-emerald-600'}`}>All Families</button>
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
            
            <div className="flex items-center space-x-1 border border-gray-200 rounded-lg overflow-hidden">
              {([['all', 'All'], ['set', 'Sets'], ['decant', 'Decants'], ['full-bottle', 'Full Bottles']] as const).map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => handleTypeChange(value)}
                  className={`px-4 py-1.5 text-sm font-serif transition-colors ${filterType === value ? 'bg-emerald-700 text-white' : 'text-gray-600 hover:bg-emerald-50'}`}
                >
                  {label}
                </button>
              ))}
            </div>

            {(filterBrands.length > 0 || filterFamilies.length > 0 || filterType !== 'all' || sortBy !== 'custom' || searchTerm !== '') && (
              <button onClick={clearAllFilters} className="text-[10px] uppercase font-bold tracking-widest text-emerald-700 border-b border-emerald-700">
                Clear Filters
              </button>
            )}
          </div>

          <div className="hidden md:flex relative ml-auto">
            <button 
              onClick={() => { setIsSortOpen(!isSortOpen); setIsFilterBrandOpen(false); setIsFilterFamilyOpen(false); }}
              className="font-serif text-lg flex items-center hover:text-emerald-700 transition-colors"
            >
              Sort by: {sortOptions.find(o => o.value === sortBy)?.label || 'Recommended'} <ChevronDown size={14} className="ml-1 opacity-60" />
            </button>
            {isSortOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setIsSortOpen(false)} />
                <div className="absolute top-full right-0 mt-3 w-56 bg-white border border-[#E2E2E2] shadow-sm z-50 p-2 animate-in fade-in slide-in-from-top-1 duration-200">
                  {sortOptions.map(option => (
                    <button
                      key={option.value}
                      onClick={() => { handleSortChange(option.value); setIsSortOpen(false); }}
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
              Filter {(filterBrands.length > 0 || filterFamilies.length > 0 || filterType !== 'all') && `(${filterBrands.length + filterFamilies.length + (filterType !== 'all' ? 1 : 0)})`}
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
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-emerald-950 mb-4 border-b border-gray-100 pb-2">Type</h3>
                  <div className="space-y-3">
                    {([['all', 'All Products'], ['set', 'Sets'], ['decant', 'Decants'], ['full-bottle', 'Full Bottles']] as const).map(([value, label]) => (
                      <label key={value} className="flex items-center gap-3 font-serif text-lg cursor-pointer">
                        <input type="radio" name="mobile_type" checked={filterType === value} onChange={() => handleTypeChange(value)} className="h-4 w-4 accent-[#4B4136]" />
                        <span className={filterType === value ? 'text-[#4B4136] font-bold' : 'text-gray-700'}>{label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-emerald-950 mb-4 border-b border-gray-100 pb-2">Brand</h3>
                  <div className="space-y-3">
                    {brands.map(brand => (
                      <label key={brand as string} className="flex items-center gap-3 font-serif text-lg cursor-pointer">
                        <input type="checkbox" checked={filterBrands.includes(brand as string)} onChange={() => toggleBrand(brand as string)} className="h-4 w-4 accent-[#4B4136]" />
                        <span className={filterBrands.includes(brand as string) ? 'text-[#4B4136] font-bold' : 'text-gray-700'}>{brand as string}</span>
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
                      onChange={() => handleSortChange(option.value)} 
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

        {initialProducts.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4 -mx-4 px-2 md:-mx-7 md:px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {initialProducts.map((product) => (
              <ProductCard key={product._id || product.id} {...product} />
            ))}
          </div>
        ) : (
          <div className="py-40 text-center">
            <p className="font-serif italic text-gray-400 text-xl">No products match your selection.</p>
            <button 
              onClick={clearAllFilters}
              className="mt-6 text-xs font-bold uppercase tracking-widest text-emerald-600 border-b border-emerald-600"
            >
              Clear All Filters
            </button>
          </div>
        )}

        {/* Pagination Links (SEO Friendly & Modern) */}
        {totalPages > 1 && (
          <div className="mt-16 flex flex-col md:flex-row items-center justify-between border-t border-gray-100 pt-8 gap-6 md:gap-0">
            <div className="text-sm font-serif text-gray-500">
              Showing <span className="font-bold text-gray-900">{initialProducts.length}</span> of <span className="font-bold text-gray-900">{totalItems}</span> results
            </div>

            <div className="flex items-center space-x-2">
              {currentPage > 1 ? (
                <Link 
                  href={createPageUrl(currentPage - 1)}
                  className="p-2 border border-gray-200 rounded-md hover:bg-emerald-50 text-emerald-900 transition-colors"
                  aria-label="Previous page"
                >
                  <ChevronLeft size={20} />
                </Link>
              ) : (
                <div className="p-2 border border-gray-100 rounded-md text-gray-300">
                  <ChevronLeft size={20} />
                </div>
              )}
              
              <div className="flex items-center space-x-1">
                {(() => {
                  const getVisiblePages = () => {
                    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
                    if (currentPage <= 3) return [1, 2, 3, 4, '...', totalPages];
                    if (currentPage >= totalPages - 2) return [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
                    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
                  };

                  return getVisiblePages().map((page, idx) => (
                    page === '...' ? (
                      <span key={`dots-${idx}`} className="px-2 text-gray-400">...</span>
                    ) : (
                      <Link
                        key={page}
                        href={createPageUrl(page as number)}
                        className={`w-9 h-9 flex items-center justify-center rounded-md font-serif text-sm transition-colors ${
                          page === currentPage 
                            ? 'bg-emerald-700 text-white' 
                            : 'text-gray-600 hover:bg-emerald-50 hover:text-emerald-900'
                        }`}
                      >
                        {page}
                      </Link>
                    )
                  ));
                })()}
              </div>

              {currentPage < totalPages ? (
                <Link 
                  href={createPageUrl(currentPage + 1)}
                  className="p-2 border border-gray-200 rounded-md hover:bg-emerald-50 text-emerald-900 transition-colors"
                  aria-label="Next page"
                >
                  <ChevronRight size={20} />
                </Link>
              ) : (
                <div className="p-2 border border-gray-100 rounded-md text-gray-300">
                  <ChevronRight size={20} />
                </div>
              )}
            </div>

            <form 
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const input = form.elements.namedItem('page') as HTMLInputElement;
                const pageNum = parseInt(input.value);
                if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
                  router.push(createPageUrl(pageNum));
                  input.value = '';
                }
              }}
              className="flex items-center gap-2"
            >
              <label htmlFor="page-jump" className="text-sm font-serif text-gray-500">Go to page:</label>
              <input 
                id="page-jump"
                name="page"
                type="number" 
                min={1} 
                max={totalPages}
                placeholder={currentPage.toString()}
                className="w-16 px-2 py-1.5 text-center text-sm border border-gray-200 rounded-md focus:outline-none focus:border-emerald-600 font-serif"
              />
              <button type="submit" className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md font-serif transition-colors">
                Go
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
