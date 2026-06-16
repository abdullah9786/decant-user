"use client";

import Link from "next/link";
import { useRef, useCallback, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import ProductCard from "@/components/ui/ProductCard";

interface SuggestedProductsProps {
  products: any[];
}

function getGap(el: HTMLDivElement): number {
  return parseFloat(getComputedStyle(el).columnGap || getComputedStyle(el).gap || "0") || 12;
}

/** Scroll positions for each dot — last position is always maxScrollLeft. */
function getScrollSnapPositions(el: HTMLDivElement): number[] {
  const maxScroll = Math.max(0, el.scrollWidth - el.clientWidth);
  if (maxScroll <= 1) return [0];

  const firstCard = el.querySelector<HTMLElement>("[data-carousel-item]");
  if (!firstCard) return [0];

  const gap = getGap(el);
  const cardStep = firstCard.offsetWidth + gap;
  const visibleCount = Math.max(1, Math.floor((el.clientWidth + gap) / cardStep));
  const stride = cardStep * visibleCount;

  const positions: number[] = [0];
  let pos = 0;
  while (pos + stride < maxScroll - 2) {
    pos += stride;
    positions.push(pos);
  }
  if (positions[positions.length - 1] < maxScroll - 1) {
    positions.push(maxScroll);
  }
  return positions;
}

function getActiveSnapIndex(positions: number[], scrollLeft: number): number {
  let index = 0;
  let minDistance = Infinity;
  for (let i = 0; i < positions.length; i++) {
    const distance = Math.abs(positions[i] - scrollLeft);
    if (distance < minDistance) {
      minDistance = distance;
      index = i;
    }
  }
  return index;
}

function getCarouselMetrics(el: HTMLDivElement) {
  const positions = getScrollSnapPositions(el);
  return {
    pageCount: positions.length,
    activePage: getActiveSnapIndex(positions, el.scrollLeft),
    positions,
  };
}

export default function SuggestedProducts({
  products,
}: SuggestedProductsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [pageCount, setPageCount] = useState(1);
  const [activePage, setActivePage] = useState(0);

  const syncCarouselState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { pageCount: pages, activePage: page } = getCarouselMetrics(el);
    setPageCount(pages);
    setActivePage(page);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    syncCarouselState();
    el.addEventListener("scroll", syncCarouselState, { passive: true });
    window.addEventListener("resize", syncCarouselState);

    const observer = new ResizeObserver(syncCarouselState);
    observer.observe(el);

    return () => {
      el.removeEventListener("scroll", syncCarouselState);
      window.removeEventListener("resize", syncCarouselState);
      observer.disconnect();
    };
  }, [products.length, syncCarouselState]);

  const scrollByPage = useCallback((direction: -1 | 1) => {
    const el = scrollRef.current;
    if (!el) return;
    const { positions, activePage: current } = getCarouselMetrics(el);
    const next = Math.max(0, Math.min(positions.length - 1, current + direction));
    el.scrollTo({ left: positions[next], behavior: "smooth" });
  }, []);

  const goToPage = useCallback((pageIndex: number) => {
    const el = scrollRef.current;
    if (!el) return;
    const { positions } = getCarouselMetrics(el);
    const target = positions[Math.max(0, Math.min(pageIndex, positions.length - 1))];
    el.scrollTo({ left: target, behavior: "smooth" });
  }, []);

  if (!products?.length) return null;

  return (
    <section className="border-t border-emerald-100 bg-white py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className="rounded-xl border overflow-hidden"
          style={{
            borderColor: "var(--section-shell-border)",
            background: "var(--section-shell-bg)",
          }}
        >
          <div
            className="flex items-end justify-between gap-4 px-4 py-5 md:px-6 md:py-6 border-b"
            style={{
              background: "var(--section-header-bg)",
              borderBottomColor: "var(--section-header-border)",
            }}
          >
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-[0.35em] text-emerald-700 font-bold">
                Curated for you
              </div>
              <h2 className="text-3xl md:text-4xl font-serif text-emerald-950 mt-1">
                You may also like
              </h2>
            </div>
            <Link
              href="/products"
              className="hidden sm:inline-flex items-center gap-1 shrink-0 text-[10px] font-bold uppercase tracking-widest text-emerald-800 border-b border-emerald-600/50 pb-0.5 hover:text-emerald-950 hover:border-emerald-800 transition-colors"
            >
              View all <ArrowRight size={12} />
            </Link>
          </div>

          <div className="relative px-4 md:px-6 py-5 md:py-6">
            <button
              type="button"
              onClick={() => scrollByPage(-1)}
              aria-label="Scroll suggested products left"
              className="hidden md:flex absolute left-4 md:left-6 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-10 h-10 items-center justify-center rounded-full border border-emerald-100 bg-white text-emerald-800 shadow-md hover:bg-emerald-50 transition-colors"
            >
              <ChevronLeft size={18} />
            </button>

            <div className="carousel-clip w-full overflow-hidden">
              <div
                ref={scrollRef}
                className="carousel-scroll flex gap-3 md:gap-4 snap-x snap-mandatory"
              >
                {products.map((product) => (
                  <div
                    key={product._id || product.id}
                    data-carousel-item
                    className="flex-shrink-0 snap-start w-[calc((100%-0.75rem)/1.75)] sm:w-[calc((100%-1rem)/2.5)] md:w-[220px] lg:w-[240px]"
                  >
                    <ProductCard {...product} compact />
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => scrollByPage(1)}
              aria-label="Scroll suggested products right"
              className="hidden md:flex absolute right-4 md:right-6 top-1/2 translate-x-1/2 -translate-y-1/2 z-20 w-10 h-10 items-center justify-center rounded-full border border-emerald-100 bg-white text-emerald-800 shadow-md hover:bg-emerald-50 transition-colors"
            >
              <ChevronRight size={18} />
            </button>

            {pageCount > 1 && (
              <div
                className="hidden md:flex justify-center items-center gap-2 mt-6"
                role="tablist"
                aria-label="Suggested products carousel pages"
              >
                {Array.from({ length: pageCount }).map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    role="tab"
                    aria-selected={index === activePage}
                    aria-label={`Go to page ${index + 1} of ${pageCount}`}
                    onClick={() => goToPage(index)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === activePage
                        ? "w-6 bg-emerald-600"
                        : "w-2 bg-emerald-200 hover:bg-emerald-300"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
