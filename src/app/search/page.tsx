"use client";

import React, { Suspense, useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Loader2, Search as SearchIcon } from 'lucide-react';
import ProductCard from '@/components/ui/ProductCard';
import { brandApi, fragranceFamilyApi, productApi } from '@/lib/api';
import { logCommittedSearch } from '@/lib/searchAnalytics';

const normalize = (value: string) => value.trim().toLowerCase();
const PAGE_SIZE = 12;

function SearchClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const noteParam = searchParams.get('note');
  const qParam = searchParams.get('q') || '';

  // Pre-fill from URL so deep links / Google Sitelinks Searchbox / navbar
  // suggestions all land with the input already populated and results
  // already running.
  const [query, setQuery] = useState(qParam);
  const [submittedQuery, setSubmittedQuery] = useState(qParam);
  // Bulk-fetched products (filter-only browsing path — when there's no text
  // query, the user can still filter by brand/family/note client-side).
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Server-search results — used whenever `submittedQuery` is non-empty.
  // Paginated via Load More; total drives the `has_more` decision.
  const [serverResults, setServerResults] = useState<any[]>([]);
  const [serverTotal, setServerTotal] = useState(0);
  const [serverHasMore, setServerHasMore] = useState(false);
  const [serverLoading, setServerLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  // Sequence id so a slow earlier search response can't overwrite a faster
  // later one. Common autocomplete race-condition guard.
  const searchSeqRef = useRef(0);
  const shouldLogSearchRef = useRef(Boolean(qParam));

  const [brands, setBrands] = useState<any[]>([]);
  const [fragranceFamilies, setFragranceFamilies] = useState<any[]>([]);

  const [notesTop, setNotesTop] = useState<string[]>([]);
  const [notesMiddle, setNotesMiddle] = useState<string[]>([]);
  const [notesBase, setNotesBase] = useState<string[]>([]);
  const [notesLoading, setNotesLoading] = useState(true);

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedFamilies, setSelectedFamilies] = useState<string[]>([]);
  const [selectedNotes, setSelectedNotes] = useState<string[]>(
    noteParam ? [noteParam] : []
  );

  useEffect(() => {
    const fetchMeta = async () => {
      try {
        setLoading(true);
        const [brandResponse, familyResponse, productResponse] = await Promise.all([
          brandApi.getAll(),
          fragranceFamilyApi.getAll(),
          productApi.getAll(),
        ]);
        setBrands(brandResponse.data || []);
        setFragranceFamilies(familyResponse.data || []);

        const products = productResponse.data || [];
        setAllProducts(products);

        const collect = (key: string): string[] =>
          Array.from(
            new Set<string>(
              products
                .flatMap((p: any) => {
                  const val = p[key];
                  return Array.isArray(val) ? val : (val ? [val] : []);
                })
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
        setLoading(false);
      }
    };
    fetchMeta();
  }, []);

  // React to incoming URL `q` changes (e.g. navbar autosuggest pushes a new
  // /search?q=...). Keeps the input synced when the URL is the source of
  // truth.
  useEffect(() => {
    setQuery(qParam);
    setSubmittedQuery(qParam);
    shouldLogSearchRef.current = Boolean(qParam.trim());
  }, [qParam]);

  // Server-side search: refetch whenever `submittedQuery` changes. When the
  // query is empty we fall through to the bulk-fetched `allProducts` and
  // client filters (the original filter-only browse path).
  useEffect(() => {
    const term = submittedQuery.trim();
    if (term.length === 0) {
      setServerResults([]);
      setServerTotal(0);
      setServerHasMore(false);
      setServerLoading(false);
      return;
    }
    const mySeq = ++searchSeqRef.current;
    setServerLoading(true);
    productApi
      .search(term, { limit: PAGE_SIZE, skip: 0 })
      .then((res) => {
        if (mySeq !== searchSeqRef.current) return;
        setServerResults(res.data?.items || []);
        setServerTotal(res.data?.total || 0);
        setServerHasMore(Boolean(res.data?.has_more));
        if (shouldLogSearchRef.current) {
          logCommittedSearch({
            query: term,
            result_count: res.data?.total ?? 0,
            source: 'search_page',
          });
          shouldLogSearchRef.current = false;
        }
      })
      .catch(() => {
        if (mySeq !== searchSeqRef.current) return;
        setServerResults([]);
        setServerTotal(0);
        setServerHasMore(false);
      })
      .finally(() => {
        if (mySeq === searchSeqRef.current) setServerLoading(false);
      });
  }, [submittedQuery]);

  const handleLoadMore = async () => {
    if (!serverHasMore || loadingMore) return;
    const term = submittedQuery.trim();
    if (!term) return;
    const mySeq = ++searchSeqRef.current;
    setLoadingMore(true);
    try {
      const res = await productApi.search(term, {
        limit: PAGE_SIZE,
        skip: serverResults.length,
      });
      if (mySeq !== searchSeqRef.current) return;
      setServerResults((prev) => [...prev, ...(res.data?.items || [])]);
      setServerHasMore(Boolean(res.data?.has_more));
    } finally {
      if (mySeq === searchSeqRef.current) setLoadingMore(false);
    }
  };

  // Keep the URL in sync with the active text query so the page is
  // shareable / refresh-safe / back-button-friendly. Uses `replace` rather
  // than `push` so each keystroke doesn't create a history entry.
  useEffect(() => {
    const term = submittedQuery.trim();
    const params = new URLSearchParams();
    if (term) params.set('q', term);
    if (noteParam) params.set('note', noteParam);
    const next = params.toString();
    const target = next ? `${pathname}?${next}` : pathname;
    // Only navigate if URL would actually change — avoids an infinite loop
    // with the `qParam` watcher above.
    const current = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    if (current !== target) {
      router.replace(target, { scroll: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submittedQuery, noteParam, pathname]);

  const runSearch = (term: string) => {
    setSubmittedQuery(term.trim());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    shouldLogSearchRef.current = true;
    runSearch(query);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      runSearch(query);
    }, 350);
    return () => clearTimeout(timer);
  }, [query]);

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
    setQuery('');
    setSubmittedQuery('');
  };

  // Source-of-truth depends on whether the user has an active text query:
  //   - With `q`: use the paginated server search results so the catalogue
  //     isn't capped at 100 documents.
  //   - Without `q`: stick with bulk-fetched `allProducts` so brand/family/
  //     note checkbox-only browsing still works.
  // Either way, the sidebar filters (brand/family/note) are applied client-
  // side on the current set. For the server-search path that means filters
  // act on the loaded pages; clicking "Load more" brings in more matches
  // which are then re-filtered.
  const filteredResults = useMemo(() => {
    const term = normalize(submittedQuery);
    const brandSet = new Set(selectedBrands.map(normalize));
    const familySet = new Set(selectedFamilies.map(normalize));
    const noteSet = new Set(selectedNotes.map(normalize));

    const source = term ? serverResults : allProducts;

    return source.filter((product) => {
      // 1. Brand Filter (if active)
      if (brandSet.size > 0 && !brandSet.has(normalize(String(product.brand || '')))) {
        return false;
      }

      // 2. Family Filter (if active)
      if (familySet.size > 0 && !familySet.has(normalize(String(product.fragrance_family || '')))) {
        return false;
      }

      // 3. Note Tags Filter (if active)
      if (noteSet.size > 0) {
        const allNotes = [
          ...(product.notes_top || []),
          ...(product.notes_middle || []),
          ...(product.notes_base || []),
        ].map((n: string) => normalize(n));
        const hasNote = allNotes.some((n) => noteSet.has(n));
        if (!hasNote) return false;
      }

      // Text-match filtering is handled by the backend when `term` is set.
      // For the no-query path we don't apply any text filter — the user is
      // browsing by checkboxes.
      return true;
    });
  }, [allProducts, serverResults, submittedQuery, selectedBrands, selectedFamilies, selectedNotes]);

  const isBrowsing = submittedQuery.length > 0 || selectedBrands.length > 0 || selectedFamilies.length > 0 || selectedNotes.length > 0;

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

  // Mobile UX: once the user is actively searching/filtering, the big hero
  // copy pushes results below the fold. Collapse to a compact, search-input-
  // only hero on mobile while keeping the full hero on desktop. On larger
  // screens the hero stays full-size — there's no fold pressure there.
  const isSearchingOrFiltering = query.trim().length > 0 || submittedQuery.trim().length > 0;

  return (
    <div className="py-10 md:py-16 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <section
          className={`rounded-[28px] md:rounded-[40px] border border-emerald-100 bg-[image:var(--accent-gradient)] text-[color:var(--accent-text)] shadow-xl relative overflow-hidden transition-all duration-300 ${
            isSearchingOrFiltering ? 'p-5 md:p-16' : 'p-7 md:p-16'
          }`}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.18),_transparent_55%)]" />
          <div className="relative max-w-4xl">
            <div
              className={`text-[10px] uppercase tracking-[0.35em] text-[color:var(--accent-muted)] font-bold ${
                isSearchingOrFiltering ? 'hidden md:block' : ''
              }`}
            >
              Search by brand, note, or perfume
            </div>
            <h1
              className={`font-serif ${
                isSearchingOrFiltering
                  ? 'hidden md:block text-3xl md:text-5xl md:mt-4'
                  : 'text-2xl md:text-5xl mt-3 md:mt-4'
              }`}
            >
              Find the fragrance you already love.
            </h1>
            <p
              className={`text-[color:var(--accent-muted)] max-w-2xl ${
                isSearchingOrFiltering
                  ? 'hidden md:block md:mt-4 text-base md:text-lg'
                  : 'mt-3 md:mt-4 text-sm md:text-lg'
              }`}
            >
              Your scent is here. Start typing and press Enter to reveal curated decants that match exactly what you had in mind.
            </p>
            <form onSubmit={handleSubmit} className={isSearchingOrFiltering ? 'mt-0 md:mt-8' : 'mt-5 md:mt-8'}>
              <div className="relative">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Try: Dior Sauvage, Oud, Creed Aventus..."
                  className="w-full bg-white/95 text-emerald-950 placeholder:text-slate-400 rounded-full pl-12 pr-6 py-3 md:py-5 text-base md:text-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
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
                    {fragranceFamilies.length > 0 ? (
                      fragranceFamilies.map((fam: any) => (
                        <label key={fam._id || fam.name} className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-gray-600 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedFamilies.includes(fam.name)}
                            onChange={() => toggleFamily(fam.name)}
                            className="h-3.5 w-3.5 accent-emerald-700"
                          />
                          <span className={selectedFamilies.includes(fam.name) ? 'text-emerald-700 font-bold' : ''}>{fam.name}</span>
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
            {!isBrowsing ? (
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
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10 border-b border-gray-100 pb-8">
                  <div className="text-xs uppercase tracking-[0.2em] text-gray-500 font-medium leading-relaxed">
                    {submittedQuery ? (
                      <>
                        Found <span className="text-emerald-950 font-bold">{serverTotal}</span> results
                        <span> for “{submittedQuery}”</span>
                        {(selectedBrands.length > 0 || selectedFamilies.length > 0) && (
                          <span className="text-emerald-800/60 lowercase italic"> in {[...selectedBrands, ...selectedFamilies].join(', ')}</span>
                        )}
                        {selectedNotes.length > 0 && (
                          <span className="text-emerald-800/60 lowercase italic"> with notes: {selectedNotes.join(', ')}</span>
                        )}
                      </>
                    ) : (
                      <>
                        Found <span className="text-emerald-950 font-bold">{filteredResults.length}</span> results
                        {(selectedBrands.length > 0 || selectedFamilies.length > 0) && (
                          <span className="text-emerald-800/60 lowercase italic"> in {[...selectedBrands, ...selectedFamilies].join(', ')}</span>
                        )}
                        {selectedNotes.length > 0 && (
                          <span className="text-emerald-800/60 lowercase italic"> with notes: {selectedNotes.join(', ')}</span>
                        )}
                      </>
                    )}
                  </div>
                  <div className="text-[10px] uppercase tracking-[0.3em] font-bold text-emerald-700">
                    Results updated live
                  </div>
                </div>

                {(submittedQuery ? serverLoading && serverResults.length === 0 : loading) ? (
                  <div className="py-20 text-center">
                    <p className="text-gray-400 font-serif italic text-lg">Searching...</p>
                  </div>
                ) : filteredResults.length > 0 ? (
                  <>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                      {filteredResults.map((product) => (
                        <ProductCard key={product.id || product._id} {...product} />
                      ))}
                    </div>
                    {submittedQuery && serverHasMore && (
                      <div className="mt-12 flex justify-center">
                        <button
                          type="button"
                          onClick={handleLoadMore}
                          disabled={loadingMore}
                          className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-emerald-950 text-white text-[10px] uppercase font-bold tracking-[0.3em] hover:bg-emerald-900 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {loadingMore ? (
                            <>
                              <Loader2 size={14} className="animate-spin" />
                              Loading
                            </>
                          ) : (
                            <>Load more</>
                          )}
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="py-32 text-center max-w-xl mx-auto space-y-6">
                    <p className="text-gray-400 font-serif italic text-xl">
                      No results found for your specific blend of selection.
                    </p>
                    <p className="text-xs text-gray-400 uppercase tracking-widest leading-loose">
                      We have fragrances {submittedQuery && <span>matching “{submittedQuery}”</span>} 
                      {submittedQuery && (selectedBrands.length > 0 || selectedFamilies.length > 0) && <span> and </span>}
                      {(selectedBrands.length > 0 || selectedFamilies.length > 0) && <span>from </span>}
                      {[...selectedBrands, ...selectedFamilies].join(', ')}
                      <span>, but not in this exact combination.</span>
                    </p>
                    <button 
                      onClick={clearAllFilters}
                      className="mt-8 px-8 py-3 bg-emerald-950 text-white text-[10px] uppercase font-bold tracking-[0.3em] hover:bg-emerald-900 transition-colors rounded-full"
                    >
                      Clear Selection & Try Again
                    </button>
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

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center bg-white">
          <Loader2 className="animate-spin text-emerald-700" size={32} />
        </div>
      }
    >
      <SearchClient />
    </Suspense>
  );
}
