'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search as SearchIcon, X as XIcon, Loader2, ArrowRight } from 'lucide-react';
import { productApi } from '@/lib/api';

interface Variant {
  size_ml: number;
  price: number;
  is_pack?: boolean;
  sale_price?: number | null;
  original_price?: number | null;
  discount_percent?: number | null;
}

interface ProductHit {
  _id?: string;
  id?: string;
  slug?: string;
  name: string;
  brand?: string;
  image_url?: string;
  variants?: Variant[];
}

interface SearchBarProps {
  /**
   * When true the input takes focus on mount. Used by the navbar's mobile
   * slide-down — the user has already tapped the icon, so we open the
   * keyboard immediately.
   */
  autoFocus?: boolean;
  /** Called whenever the user navigates somewhere (suggestion click, submit,
   *  "See all"). Lets the parent close the slide-down / drawer. */
  onNavigate?: () => void;
  /** Optional className passthrough for the outer container. */
  className?: string;
  /** Initial query value (e.g. pre-fill from URL on /search). */
  initialQuery?: string;
  /** Compact variant: smaller padding/font, for tight desktop navbars. */
  compact?: boolean;
}

const DEBOUNCE_MS = 250;
const AUTOSUGGEST_LIMIT = 6;

function cheapestVariant(p: ProductHit): Variant | null {
  const variants = p.variants || [];
  if (variants.length === 0) return null;
  return variants.reduce((min, v) =>
    (v.sale_price ?? v.price) < (min.sale_price ?? min.price) ? v : min,
  );
}

function inr(n?: number | null): string {
  if (typeof n !== 'number' || !isFinite(n)) return '';
  return `₹${Math.round(n).toLocaleString('en-IN')}`;
}

/**
 * Reusable search bar with live product autosuggest. Wired to
 * `productApi.search()` (the new GET /products/search backend route).
 *
 * Behavior:
 *  - Debounced 250ms after each keystroke
 *  - Dropdown shows up to 6 product hits + a "See all results for X" footer
 *  - Submit (Enter or icon click) routes to `/search?q=...` for the full page
 *  - ArrowUp / ArrowDown navigate hits; Enter follows; Escape dismisses
 *  - Outside click + Escape dismiss the dropdown
 *  - Requests are de-duped via a sequence id so a slow earlier response
 *    can't overwrite a faster later one (typical autocomplete bug)
 */
export default function SearchBar({
  autoFocus = false,
  onNavigate,
  className,
  initialQuery = '',
  compact = false,
}: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery);
  const [hits, setHits] = useState<ProductHit[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);

  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const seqRef = useRef(0);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Sync external prefill (e.g. /search page hydrating from URL).
  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      // Slight delay so the slide-down animation has settled before the
      // keyboard pops up on mobile — avoids visual jitter.
      //
      // `preventScroll: true` is critical here: the search input lives
      // inside a `position: sticky` navbar via an `absolute` panel. When
      // the user has scrolled the page down and we focus the input
      // without this flag, browsers (Chrome on Android especially) call
      // scrollIntoView using the *natural* DOM position of the sticky
      // navbar — which is at page y=0 — and yank the document back to
      // the top before our scroll-lock takes effect. With preventScroll
      // the cursor lands without moving the viewport.
      const t = setTimeout(
        () => inputRef.current?.focus({ preventScroll: true }),
        80,
      );
      return () => clearTimeout(t);
    }
  }, [autoFocus]);

  // Outside-click dismiss.
  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setActiveIdx(-1);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  // Debounced fetch.
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const trimmed = query.trim();
    if (trimmed.length === 0) {
      setHits([]);
      setLoading(false);
      setActiveIdx(-1);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      const mySeq = ++seqRef.current;
      setLoading(true);
      try {
        const res = await productApi.search(trimmed, { limit: AUTOSUGGEST_LIMIT });
        if (mySeq !== seqRef.current) return; // outdated
        setHits(res.data?.items || []);
      } catch {
        if (mySeq !== seqRef.current) return;
        setHits([]);
      } finally {
        if (mySeq === seqRef.current) setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const goToResults = useCallback(
    (term: string) => {
      const t = term.trim();
      if (!t) return;
      setOpen(false);
      setActiveIdx(-1);
      onNavigate?.();
      router.push(`/search?q=${encodeURIComponent(t)}`);
    },
    [router, onNavigate],
  );

  const goToProduct = useCallback(
    (p: ProductHit) => {
      const slug = p.slug || p._id || p.id;
      if (!slug) return;
      setOpen(false);
      setActiveIdx(-1);
      onNavigate?.();
      router.push(`/products/${slug}`);
    },
    [router, onNavigate],
  );

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setOpen(false);
      setActiveIdx(-1);
      return;
    }
    if (!open && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      setOpen(true);
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx((idx) => Math.min(hits.length - 1, idx + 1));
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx((idx) => Math.max(-1, idx - 1));
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIdx >= 0 && hits[activeIdx]) {
        goToProduct(hits[activeIdx]);
      } else {
        goToResults(query);
      }
    }
  };

  const showDropdown = open && query.trim().length > 0;

  const sizeClasses = useMemo(() => {
    if (compact) {
      return {
        wrapper: 'h-10',
        input: 'pl-10 pr-9 text-sm',
        icon: 'left-3',
        clearBtn: 'right-2',
      } as const;
    }
    return {
      wrapper: 'h-11 md:h-12',
      input: 'pl-11 pr-10 text-base',
      icon: 'left-3.5',
      clearBtn: 'right-2.5',
    } as const;
  }, [compact]);

  return (
    <div ref={containerRef} className={`relative w-full ${className ?? ''}`}>
      <div className={`relative ${sizeClasses.wrapper}`}>
        <SearchIcon
          size={compact ? 16 : 18}
          className={`absolute top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none ${sizeClasses.icon}`}
        />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => {
            if (query.trim().length > 0) setOpen(true);
          }}
          onKeyDown={onKeyDown}
          placeholder="Search perfumes, brands, notes..."
          className={`w-full h-full ${sizeClasses.input} rounded-full bg-gray-50 border border-gray-200 text-emerald-950 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:bg-white focus:border-emerald-300 transition`}
          aria-label="Search products"
          aria-autocomplete="list"
          aria-expanded={showDropdown}
          aria-controls="search-suggestions"
          autoComplete="off"
        />
        {query.length > 0 && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => {
              setQuery('');
              setHits([]);
              setActiveIdx(-1);
              inputRef.current?.focus();
            }}
            className={`absolute top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 rounded-full ${sizeClasses.clearBtn}`}
          >
            <XIcon size={compact ? 14 : 16} />
          </button>
        )}
      </div>

      {showDropdown && (
        <div
          id="search-suggestions"
          role="listbox"
          // `data-overlay-scrollable` opts this element out of the navbar's
          // body-scroll-lock so a long result list can still be scrolled
          // even while the page underneath is frozen.
          data-overlay-scrollable
          className="absolute left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-2xl overflow-hidden z-50 max-h-[70vh] overflow-y-auto"
        >
          {/* Header strip: loading state or hit count summary */}
          {loading && hits.length === 0 ? (
            <div className="flex items-center gap-2 px-4 py-3 text-xs text-gray-500">
              <Loader2 size={14} className="animate-spin" />
              Searching…
            </div>
          ) : null}

          {!loading && hits.length === 0 && (
            <div className="px-4 py-6 text-sm text-gray-500 text-center">
              No matches for <span className="font-bold text-gray-700">{query.trim()}</span>.
              <br />
              <button
                type="button"
                onClick={() => goToResults(query)}
                className="mt-2 inline-block text-emerald-700 font-bold text-xs uppercase tracking-widest hover:underline"
              >
                Browse all products
              </button>
            </div>
          )}

          {hits.length > 0 && (
            <>
              <ul className="divide-y divide-gray-50">
                {hits.map((p, i) => {
                  const variant = cheapestVariant(p);
                  const sale = variant?.sale_price ?? variant?.price;
                  const original = variant?.original_price ?? variant?.price;
                  const isOnSale =
                    typeof sale === 'number' &&
                    typeof original === 'number' &&
                    sale < original;
                  const isActive = i === activeIdx;
                  return (
                    <li key={(p._id || p.id || p.slug || p.name) as string}>
                      <button
                        type="button"
                        onMouseEnter={() => setActiveIdx(i)}
                        onClick={() => goToProduct(p)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                          isActive ? 'bg-emerald-50/70' : 'hover:bg-emerald-50/40'
                        }`}
                        role="option"
                        aria-selected={isActive}
                      >
                        <div className="relative w-12 h-12 shrink-0 rounded-lg bg-gray-50 overflow-hidden">
                          {p.image_url ? (
                            <Image
                              src={p.image_url}
                              alt={p.name}
                              fill
                              sizes="48px"
                              className="object-cover"
                            />
                          ) : null}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold truncate">
                            {p.brand}
                          </p>
                          <p className="text-sm font-bold text-emerald-950 truncate">
                            {p.name}
                          </p>
                        </div>
                        <div className="shrink-0 text-right">
                          {typeof sale === 'number' && (
                            <p className="text-sm font-extrabold text-emerald-950 tabular-nums">
                              {inr(sale)}
                            </p>
                          )}
                          {isOnSale && (
                            <p className="text-[10px] text-gray-400 line-through tabular-nums">
                              {inr(original)}
                            </p>
                          )}
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
              {/* Footer: see-all link */}
              <Link
                href={`/search?q=${encodeURIComponent(query.trim())}`}
                onClick={() => {
                  setOpen(false);
                  onNavigate?.();
                }}
                className="flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors border-t border-gray-100"
              >
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-700">
                  See all results for &ldquo;{query.trim()}&rdquo;
                </span>
                <ArrowRight size={14} className="text-emerald-700" />
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}
