"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Search as SearchIcon } from 'lucide-react';
import ProductCard from '@/components/ui/ProductCard';
import { brandApi, categoryApi, productApi } from '@/lib/api';

const normalize = (value: string) => value.trim().toLowerCase();

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [brands, setBrands] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  const [notesTop, setNotesTop] = useState<string[]>([]);
  const [notesMiddle, setNotesMiddle] = useState<string[]>([]);
  const [notesBase, setNotesBase] = useState<string[]>([]);
  const [notesLoading, setNotesLoading] = useState(true);

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedFamilies, setSelectedFamilies] = useState<string[]>([]);
  const [selectedNotes, setSelectedNotes] = useState<string[]>([]);

  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const [brandResponse, categoryResponse, productResponse] = await Promise.all([
          brandApi.getAll(),
          categoryApi.getAll(),
          productApi.getAll(),
        ]);
        setBrands(brandResponse.data || []);
        setCategories(categoryResponse.data || []);

        const products = productResponse.data || [];
        const collect = (key: string): string[] =>
          Array.from(
            new Set<string>(
              products
                .flatMap((p: any) => (p[key] || []))
                .map((v: string) => v.trim())
                .filter(Boolean)
            )
          ).sort();
        setNotesTop(collect('notes_top'));
        setNotesMiddle(collect('notes_middle'));
        setNotesBase(collect('notes_base'));
      } catch (err) {
        console.error("Search page meta fetch error", err);
      } finally {
        setNotesLoading(false);
      }
    };
    fetchMeta();
  }, []);

  const runSearch = async (term: string) => {
    const next = term.trim();
    setSubmittedQuery(next);
    if (!next) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const response = await productApi.getAll({ q: next });
      setResults(response.data || []);
    } catch (err) {
      console.error("Search error", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await runSearch(query);
  };

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setSubmittedQuery('');
      setResults([]);
      return;
    }
    const timer = setTimeout(() => {
      if (trimmed !== submittedQuery) {
        runSearch(trimmed);
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [query, submittedQuery]);

  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  const toggleFamily = (family: string) => {
    setSelectedFamilies((prev) =>
      prev.includes(family) ? prev.filter((f) => f !== family) : [...prev, family]
    );
  };

  const toggleNote = (note: string) => {
    setSelectedNotes((prev) =>
      prev.includes(note) ? prev.filter((n) => n !== note) : [...prev, note]
    );
  };

  const clearAllFilters = () => {
    setSelectedBrands([]);
    setSelectedFamilies([]);
    setSelectedNotes([]);
  };

  const filteredResults = useMemo(() => {
    const brandSet = new Set(selectedBrands.map(normalize));
    const familySet = new Set(selectedFamilies.map(normalize));
    const noteSet = new Set(selectedNotes.map(normalize));

    return results.filter((product) => {
      if (brandSet.size > 0 && !brandSet.has(normalize(String(product.brand || '')))) {
        return false;
      }
      if (familySet.size > 0 && !familySet.has(normalize(String(product.category || '')))) {
        return false;
      }
      if (noteSet.size > 0) {
        const allNotes = [
          ...(product.notes_top || []),
          ...(product.notes_middle || []),
          ...(product.notes_base || []),
        ].map((n: string) => normalize(n));
        const hasNote = allNotes.some((n) => noteSet.has(n));
        if (!hasNote) return false;
      }
      return true;
    });
  }, [results, selectedBrands, selectedFamilies, selectedNotes]);

  const trendingNotes = notesTop.slice(0, 8);
  const popularBrands = brands.slice(0, 8);
  const allNotes = useMemo(() => {
    return Array.from(
      new Set(
        [...notesTop, ...notesMiddle, ...notesBase]
          .map((note) => note.trim())
          .filter(Boolean)
      )
    );
  }, [notesTop, notesMiddle, notesBase]);

  return (
    <div className="py-16 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <section className="rounded-[40px] border border-emerald-100 bg-[image:var(--accent-gradient)] text-[color:var(--accent-text)] p-10 md:p-16 shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.18),_transparent_55%)]" />
          <div className="relative max-w-4xl">
            <div className="text-[10px] uppercase tracking-[0.35em] text-[color:var(--accent-muted)] font-bold">
              Search by brand, note, or perfume
            </div>
            <h1 className="text-3xl md:text-5xl font-serif mt-4">
              Find the fragrance you already love.
            </h1>
            <p className="mt-4 text-[color:var(--accent-muted)] text-base md:text-lg max-w-2xl">
              Your scent is here. Start typing and press Enter to reveal curated decants that match exactly what you had in mind.
            </p>
            <form onSubmit={handleSubmit} className="mt-8">
              <div className="relative">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Try: Dior Sauvage, Oud, Creed Aventus..."
                  className="w-full bg-white/95 text-emerald-950 placeholder:text-slate-400 rounded-full pl-12 pr-6 py-4 md:py-5 text-base md:text-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
                <SearchIcon size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-emerald-700" />
              </div>
              {query.length > 0 && query.trim() !== submittedQuery && (
                <div className="mt-3 text-[10px] uppercase tracking-[0.3em] text-[color:var(--accent-muted)]">
                  Searching as you type
                </div>
              )}
            </form>
          </div>
        </section>

        <div className="mt-12 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-10">
          <aside className="lg:sticky lg:top-24 h-fit">
            <div className="flex items-center justify-between lg:hidden">
              <div className="text-xs font-bold uppercase tracking-widest text-emerald-900">Filters</div>
              <button
                type="button"
                onClick={() => setFiltersOpen(!filtersOpen)}
                className="text-xs font-bold uppercase tracking-widest text-emerald-700 border-b border-emerald-600"
              >
                {filtersOpen ? 'Hide' : 'Show'}
              </button>
            </div>

            <div className={`mt-4 lg:mt-0 ${filtersOpen ? 'block' : 'hidden'} lg:block`}>
              <div className="bg-white/90 border border-emerald-100 rounded-3xl p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="text-[10px] uppercase tracking-[0.3em] text-emerald-700 font-bold">Filters</div>
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="text-[10px] uppercase tracking-[0.3em] text-emerald-700 hover:text-emerald-900"
                  >
                    Clear all
                  </button>
                </div>

                <div className="mt-6">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-emerald-950">Brands</h4>
                    <button
                      type="button"
                      onClick={() => setSelectedBrands([])}
                      className="text-[10px] uppercase tracking-widest text-gray-400"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {brands.length > 0 ? (
                      brands.map((brand: any) => (
                        <label key={brand._id} className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-gray-600 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedBrands.includes(brand.name)}
                            onChange={() => toggleBrand(brand.name)}
                            className="h-3.5 w-3.5 accent-emerald-700"
                          />
                          <span className={selectedBrands.includes(brand.name) ? 'text-emerald-700 font-bold' : ''}>{brand.name}</span>
                        </label>
                      ))
                    ) : (
                      <div className="text-xs text-gray-400">No brands yet.</div>
                    )}
                  </div>
                </div>

                <div className="mt-6">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-emerald-950">Families</h4>
                    <button
                      type="button"
                      onClick={() => setSelectedFamilies([])}
                      className="text-[10px] uppercase tracking-widest text-gray-400"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {categories.length > 0 ? (
                      categories.map((cat: any) => (
                        <label key={cat._id || cat.name} className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-gray-600 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedFamilies.includes(cat.name)}
                            onChange={() => toggleFamily(cat.name)}
                            className="h-3.5 w-3.5 accent-emerald-700"
                          />
                          <span className={selectedFamilies.includes(cat.name) ? 'text-emerald-700 font-bold' : ''}>{cat.name}</span>
                        </label>
                      ))
                    ) : (
                      <div className="text-xs text-gray-400">No families yet.</div>
                    )}
                  </div>
                </div>

                <div className="mt-6">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-emerald-950">Notes</h4>
                    <button
                      type="button"
                      onClick={() => setSelectedNotes([])}
                      className="text-[10px] uppercase tracking-widest text-gray-400"
                    >
                      Clear
                    </button>
                  </div>
                  {notesLoading ? (
                    <div className="text-xs text-gray-400">Loading notes...</div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {allNotes.slice(0, 24).map((note) => (
                        <button
                          key={note}
                          type="button"
                          onClick={() => toggleNote(note)}
                          className={`px-3 py-1 text-[10px] uppercase tracking-widest border transition-colors ${
                            selectedNotes.includes(note)
                              ? 'bg-emerald-950 text-white border-emerald-950'
                              : 'bg-white border-emerald-100 text-emerald-700 hover:border-emerald-500'
                          }`}
                        >
                          {note}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </aside>

          <div>
            {submittedQuery.length === 0 ? (
              <div className="space-y-10">
                <div>
                  <div className="text-xs font-bold uppercase tracking-widest text-emerald-950 mb-4">Trending Notes</div>
                  <div className="flex flex-wrap gap-3">
                    {(trendingNotes.length ? trendingNotes : ['Amber', 'Citrus', 'Rose', 'Musk', 'Vanilla', 'Sandalwood']).map((note) => (
                      <button
                        key={note}
                        type="button"
                        onClick={() => { setQuery(note); runSearch(note); }}
                        className="px-4 py-2 bg-emerald-50 text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-100 transition-colors border border-emerald-100"
                      >
                        {note}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-widest text-emerald-950 mb-4">Popular Brands</div>
                  <div className="flex flex-wrap gap-3">
                    {(popularBrands.length ? popularBrands : [{ name: 'Creed' }, { name: 'Dior' }, { name: 'Chanel' }]).map((brand: any) => (
                      <button
                        key={brand.name}
                        type="button"
                        onClick={() => { setQuery(brand.name); runSearch(brand.name); }}
                        className="px-4 py-2 bg-white text-[10px] font-bold uppercase tracking-widest border border-emerald-100 hover:border-emerald-500 hover:text-emerald-700 transition-colors"
                      >
                        {brand.name}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="bg-white/80 border border-emerald-100 rounded-3xl p-8">
                  <div className="text-xs font-bold uppercase tracking-widest text-emerald-950 mb-4">Browse Notes</div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                      { title: 'Top Notes', items: notesTop },
                      { title: 'Middle Notes', items: notesMiddle },
                      { title: 'Base Notes', items: notesBase },
                    ].map((group) => (
                      <div key={group.title} className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-2xl">
                        <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-900 mb-3">{group.title}</div>
                        {notesLoading ? (
                          <div className="text-gray-400 text-xs italic">Loading...</div>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {group.items.length > 0 ? group.items.map((n) => (
                              <button
                                key={`${group.title}-${n}`}
                                onClick={() => { setQuery(n); runSearch(n); }}
                                className="px-3 py-1 bg-white text-[10px] font-bold uppercase tracking-widest border border-emerald-100 hover:border-emerald-600 hover:text-emerald-700 transition-colors"
                              >
                                {n}
                              </button>
                            )) : (
                              <span className="text-gray-400 text-xs italic">No notes yet</span>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                  <div className="text-xs uppercase tracking-[0.2em] text-gray-400">
                    Found <span className="text-emerald-950 font-bold">{filteredResults.length}</span> results for “{submittedQuery}”
                  </div>
                  <div className="text-[10px] uppercase tracking-[0.3em] text-emerald-700">
                    Refine with filters
                  </div>
                </div>

                {loading ? (
                  <div className="py-20 text-center">
                    <p className="text-gray-400 font-serif italic text-lg">Searching...</p>
                  </div>
                ) : filteredResults.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {filteredResults.map((product) => (
                      <ProductCard key={product.id} {...product} />
                    ))}
                  </div>
                ) : (
                  <div className="py-20 text-center space-y-4">
                    <p className="text-gray-400 font-serif italic text-lg">No matches found for this search.</p>
                    <div className="flex flex-wrap gap-3 justify-center">
                      {(trendingNotes.length ? trendingNotes.slice(0, 6) : ['Amber', 'Citrus', 'Rose']).map((note) => (
                        <button
                          key={note}
                          type="button"
                          onClick={() => { setQuery(note); runSearch(note); }}
                          className="px-4 py-2 bg-emerald-50 text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-100 transition-colors border border-emerald-100"
                        >
                          {note}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
