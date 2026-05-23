'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Flame, Sparkles, ShoppingBag } from 'lucide-react';
import DealCountdown from '@/components/deal/DealCountdown';
import { deepenAccent, formatDealEnd, lightenAccent } from '@/components/deal/constants';
import type { DealDoc, DealProduct, DealVariant } from '@/components/deal/ActiveDealProvider';

interface DailyDealRailProps {
  deal: DealDoc;
  products: DealProduct[];
}

function cheapestVariant(p: DealProduct): DealVariant | null {
  const variants = p.variants || [];
  if (variants.length === 0) return null;
  // Prefer a variant the backend actually annotated with deal pricing.
  // Otherwise we'd surface the absolute cheapest variant (which may sit
  // outside the deal's apply_to scope) and the card would render without a
  // discount pill — exactly the "only first card shows -X%" bug.
  const dealVariants = variants.filter((v) => (v.discount_percent ?? 0) > 0);
  const pool = dealVariants.length > 0 ? dealVariants : variants;
  return pool.reduce((min, v) =>
    (v.sale_price ?? v.price) < (min.sale_price ?? min.price) ? v : min,
  );
}

function inr(n?: number | null): string {
  if (typeof n !== 'number' || !isFinite(n)) return '';
  return `₹${Math.round(n).toLocaleString('en-IN')}`;
}

/**
 * Homepage "Today's Daily Deal" rail. Deliberately styled to NOT look like
 * the surrounding product rails — full-width accent background, ribbon
 * cards, countdown header — so it reads as a *promotion*, not another shelf.
 *
 * Driven entirely by the active deal's `display.accent_color`, so a single
 * config flip in admin re-themes the whole strip.
 */
export default function DailyDealRail({ deal, products }: DailyDealRailProps) {
  const accent = deal.display?.accent_color || '#dc2626';
  // Foreground-safe accent for text and CTAs that sit on the white product
  // cards. Without this, pastel accents render unreadable sale prices and
  // washed-out "Grab Deal" buttons (white text on light pink).
  const deepAccent = deepenAccent(accent);
  // Mirror of deepAccent for text that sits on the rail's *dark* canvas.
  // Without this, a dark admin-picked accent (e.g. navy, maroon) becomes
  // invisible when used as text/icons on top of the near-black background.
  const lightAccent = lightenAccent(accent);
  const headline = deal.display?.headline || 'Decume Daily';
  const subheadline =
    deal.display?.subheadline ||
    `${deal.config?.discount_percent || 0}% OFF — today only`;
  const discountPercent = deal.config?.discount_percent || 0;

  return (
    <section
      className="relative overflow-hidden py-14 md:py-20"
      // Themed canvas: the base is the *deepened* accent (always dark enough
      // to read white text on, never pure black) and two raw-accent radials
      // sit on top as corner highlights. Keeps the rail visually distinct
      // from the off-white product sections above and below it, while
      // actually reflecting the offer theme instead of looking near-black.
      style={{
        backgroundColor: deepAccent,
        backgroundImage: `
          radial-gradient(circle at 0% 0%, ${accent}66 0%, transparent 55%),
          radial-gradient(circle at 100% 100%, ${accent}55 0%, transparent 60%),
          linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.25) 100%)
        `,
        color: '#ffffff',
      }}
    >
      {/* Decorative diagonal "stripe" overlay so the section feels designed
          rather than a flat panel. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: `repeating-linear-gradient(45deg, ${accent} 0px, ${accent} 2px, transparent 2px, transparent 22px)`,
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10 md:mb-14">
          <div className="space-y-3">
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.35em]"
              style={{
                backgroundColor: `${accent}1f`,
                // Text/icon use the *lightened* accent so they stay readable
                // even when the admin picks a dark accent (navy, maroon, …).
                color: lightAccent,
                border: `1px solid ${accent}66`,
              }}
            >
              <Flame size={12} className="motion-reduce:animate-none animate-pulse" />
              <span>{headline} · Today Only</span>
            </div>

            <h2 className="text-3xl md:text-5xl font-serif leading-[1.05]">
              <span style={{ color: lightAccent }}>{discountPercent}% OFF</span>{' '}
              <span className="text-white/90">on Today's Picks</span>
            </h2>

            <p className="text-sm md:text-base text-white/60 max-w-xl">
              {subheadline}. Hand-filled from verified retail bottles, ends{' '}
              {formatDealEnd(deal.ends_at)}.
            </p>
          </div>

          {/* Right cluster (countdown + "view all" link). On mobile this
              cluster gets centered for emphasis; on tablet+ it returns to
              its natural right-aligned position next to the headline. */}
          <div className="flex flex-col items-center md:items-end gap-3 shrink-0">
            <div
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-black/60 backdrop-blur border"
              style={{ borderColor: `${accent}66` }}
            >
              <DealCountdown
                endsAt={deal.ends_at}
                boxed
                label="Ends in"
                tileBg="#000000"
                tileFg="#ffffff"
              />
            </div>
            <Link
              href="/deals/today"
              className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest border-b border-current pb-0.5 hover:opacity-80 transition-opacity"
              style={{ color: lightAccent }}
            >
              View all deal products <ArrowRight size={12} />
            </Link>
          </div>
        </div>

        {/* Product grid — adaptive layout.
            Most daily deals will only ship 1–2 products at a time, so a fixed
            4-column grid leaves big empty cells. We always render a "Spotlight"
            cell first (a richer accent-themed promo block) and then product
            cards, picking grid columns based on the total cell count so the
            row stays balanced.

            Cap the visible products at 3 — overflow is reachable via the
            header / footer "View all" links. */}
        {(() => {
          const visibleProducts = products.slice(0, 3);
          // total cells = 1 spotlight + visible products
          const cellCount = visibleProducts.length + 1;
          // Static class literals so Tailwind's content scanner keeps them.
          //
          // The product card's aspect-square image dictates the row height.
          // With fewer cells, full-width 7xl would make each card hundreds of
          // pixels wide, stretching the row vertically (which is what the
          // user noticed). Cap the row width so each card lands at ~325px —
          // the same width as a card in the 3-cell layout that already
          // looked good.
          const gridClass =
            cellCount === 2
              ? 'grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 max-w-2xl mx-auto'
              : cellCount === 3
              ? 'grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 max-w-5xl mx-auto'
              : 'grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6';
          return (
            <div className={gridClass}>
              {/* Spotlight cell — a non-product card that doubles as the
                  promo's poster. Always present, so a 1-product deal still
                  fills the row visually. */}
              <Link
                href="/deals/today"
                className="group relative flex flex-col justify-between rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 hover:-translate-y-1 p-5 md:p-6 min-h-[280px] md:min-h-0"
                style={{
                  // Spotlight has to stand *out* from the section canvas
                  // (which now uses deepAccent itself). So we run a brighter
                  // gradient — lightAccent → accent → deepAccent — and pin
                  // an inset white ring for guaranteed edge definition even
                  // when the section's corner radial sits behind the card.
                  background: `linear-gradient(160deg, ${lightAccent} 0%, ${accent} 50%, ${deepAccent} 100%)`,
                  boxShadow: `0 25px 50px -15px ${accent}cc, inset 0 0 0 1px rgba(255,255,255,0.18)`,
                }}
              >
                {/* Subtle stripe overlay — same DNA as the section bg */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 opacity-[0.12]"
                  style={{
                    backgroundImage: `repeating-linear-gradient(45deg, #ffffff 0px, #ffffff 2px, transparent 2px, transparent 16px)`,
                  }}
                />
                <div className="relative">
                  <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[9px] font-bold uppercase tracking-[0.3em] text-white bg-white/15 backdrop-blur">
                    <Flame size={10} />
                    Deal of the day
                  </span>
                  <p className="mt-4 text-[10px] uppercase tracking-[0.3em] text-white/70 font-bold">
                    {headline}
                  </p>
                  <p className="mt-1 font-serif text-7xl md:text-8xl text-white leading-none font-bold">
                    {discountPercent}
                    <span className="text-3xl md:text-4xl align-top ml-1">%</span>
                  </p>
                  <p className="text-white text-sm md:text-base font-bold uppercase tracking-[0.25em] mt-1">
                    Off Today
                  </p>
                </div>
                <div className="relative mt-4">
                  <p className="text-[11px] text-white/75 mb-3 line-clamp-2">
                    {subheadline}. Ends {formatDealEnd(deal.ends_at)}.
                  </p>
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-white border-b border-white/40 pb-0.5 group-hover:border-white transition-colors">
                    Shop today's deal <ArrowRight size={12} />
                  </span>
                </div>
              </Link>

              {visibleProducts.map((product) => {
            const variant = cheapestVariant(product);
            const original = variant?.original_price ?? variant?.price ?? 0;
            const sale = variant?.sale_price ?? variant?.price ?? 0;
            const productSlug = product.slug || product._id || product.id;
            return (
              <Link
                key={(product._id || product.id) as string}
                href={`/products/${productSlug}`}
                className="group relative flex flex-col bg-white text-emerald-950 rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 hover:-translate-y-1"
                style={{ boxShadow: `0 20px 40px -20px ${accent}66` }}
              >
                {/* Corner discount ribbon */}
                <div
                  className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-lg"
                  style={{ backgroundColor: deepAccent }}
                >
                  -{discountPercent}%
                </div>

                {/* Image */}
                <div className="relative aspect-square bg-gradient-to-br from-emerald-50 to-white overflow-hidden">
                  {product.image_url && (
                    <Image
                      src={product.image_url}
                      alt={product.name}
                      fill
                      sizes="(max-width: 1024px) 50vw, 25vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  )}
                  {/* Accent ring on hover */}
                  <div
                    className="absolute inset-0 ring-0 group-hover:ring-2 transition-all duration-300 pointer-events-none"
                    style={{ boxShadow: `inset 0 0 0 0 ${accent}` }}
                  />
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col p-4">
                  <p className="text-[9px] uppercase tracking-[0.25em] text-slate-500 font-bold truncate">
                    {product.brand}
                  </p>
                  <h3 className="mt-1 font-serif text-base md:text-lg leading-tight line-clamp-2 text-emerald-950">
                    {product.name}
                  </h3>

                  {/* Price */}
                  <div className="mt-3 flex items-baseline gap-2 flex-wrap">
                    <span
                      className="text-lg md:text-xl font-extrabold tabular-nums"
                      style={{ color: deepAccent }}
                    >
                      {inr(sale)}
                    </span>
                    {original > sale && (
                      <span className="text-sm text-slate-400 line-through tabular-nums">
                        {inr(original)}
                      </span>
                    )}
                    {variant?.size_ml ? (
                      <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold ml-auto">
                        from {variant.size_ml}ml
                      </span>
                    ) : null}
                  </div>

                  {/* CTA — visible on hover at desktop, always at mobile so
                      the buy intent is obvious without depending on hover. */}
                  <div
                    className="mt-4 inline-flex items-center justify-center gap-2 py-2.5 text-[10px] font-bold uppercase tracking-widest text-white rounded-md transition-all md:opacity-0 md:group-hover:opacity-100 md:-mt-1 md:group-hover:mt-4"
                    style={{ backgroundColor: deepAccent }}
                  >
                    <ShoppingBag size={12} />
                    <span>Grab Deal</span>
                  </div>
                </div>
              </Link>
            );
          })}
            </div>
          );
        })()}

        {/* Footer CTA — sticky reassurance for the conversion. */}
        <div className="mt-10 md:mt-14 flex flex-col sm:flex-row items-center justify-between gap-4 px-5 py-4 rounded-2xl bg-black/40 backdrop-blur border" style={{ borderColor: `${accent}33` }}>
          <div className="flex items-center gap-3 text-sm text-white/80">
            <Sparkles size={16} style={{ color: lightAccent }} />
            <span>
              <span className="font-bold text-white">Limited window.</span>{' '}
              These prices vanish {formatDealEnd(deal.ends_at)}.
            </span>
          </div>
          <Link
            href="/deals/today"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-[11px] font-bold uppercase tracking-widest text-white shadow-lg hover:-translate-y-0.5 transition-transform"
            style={{ backgroundColor: deepAccent }}
          >
            Shop today's deal
            <ArrowRight size={12} />
          </Link>
        </div>
      </div>
    </section>
  );
}
