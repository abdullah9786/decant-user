'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Sparkles, ArrowRight } from 'lucide-react';
import DealCountdown from '@/components/deal/DealCountdown';
import { deepenAccent, formatDealEnd } from '@/components/deal/constants';
import { areAllProductsOutOfStock, isProductOutOfStock } from '@/lib/product/stock';
import type { DealDoc, DealProduct, DealVariant } from '@/components/deal/ActiveDealProvider';

function inr(n?: number | null): string {
  if (typeof n !== 'number' || !isFinite(n)) return '';
  return `₹${Math.round(n).toLocaleString('en-IN')}`;
}

interface DailyDealHeroProps {
  deal: DealDoc;
  products: DealProduct[];
}

function cheapestVariant(p: DealProduct): DealVariant | null {
  const variants = p.variants || [];
  if (variants.length === 0) return null;
  // The backend only annotates `discount_percent`/`sale_price` on variants
  // that match the deal's apply_to scope (e.g. only packs, or only decants).
  // We prefer one of those so the collage shows the deal price AND the
  // "-X% OFF" pill. Falls back to the absolute cheapest variant only if no
  // variant on this product was matched by the deal (defensive — shouldn't
  // happen for a product that's in the deal's product list).
  const dealVariants = variants.filter((v) => (v.discount_percent ?? 0) > 0);
  const pool = dealVariants.length > 0 ? dealVariants : variants;
  return pool.reduce((min, v) =>
    (v.sale_price ?? v.price) < (min.sale_price ?? min.price) ? v : min,
  );
}

/**
 * Daily-deal homepage hero. Same overall grid shape as `DefaultHero`,
 * but content is driven entirely by the admin-configured deal: brand
 * mark, subheadline, countdown, accent palette, and a small collage of
 * up to three deal products with strike-through pricing.
 *
 * Falls back gracefully when the admin hasn't supplied a hero image:
 * the first deal product's image is used.
 */
export default function DailyDealHero({ deal, products }: DailyDealHeroProps) {
  // When every product in the deal is sold out we flip the entire hero
  // into a "regret + wait" register: same accent palette, same countdown
  // component, but the eyebrow, headline, sub, and CTA all reframe the
  // experience as "you missed today's drop — the next one is coming".
  // The collage products still render (with their sold-out badges, see
  // the per-card logic below) so users can see exactly what they missed.
  const soldOut = areAllProductsOutOfStock(products);
  const accent = deal.display?.accent_color || '#dc2626';
  // Darkened version of the accent — used whenever the accent has to act as
  // a foreground (text on white) or CTA background (white text on top). For
  // already-dark accents this is a no-op; for pastel ones it prevents the
  // washed-out "white on light pink" failure mode.
  const deepAccent = deepenAccent(accent);
  const heroImage = deal.display?.hero_image || products[0]?.image_url || '';
  const discountPercent = deal.config?.discount_percent || 0;

  const adminHeadline = deal.display?.headline || 'Decume Daily';
  const adminSubheadline =
    deal.display?.subheadline || `${deal.config?.discount_percent || 0}% OFF today`;
  const adminCtaLabel = deal.display?.cta_label || "Shop Today's Deal";
  const adminCtaHref = deal.display?.cta_href || '/deals/today';

  // Copy bundle. Branching all the text decisions here keeps the JSX
  // below readable and makes the "what changes when sold out" question
  // answerable by reading one block instead of scanning the whole file.
  const copy = soldOut
    ? {
        eyebrow: `Sold Out · You Missed It`,
        headlineLead: 'Vanished.',
        headlineTail: `Today's ${discountPercent}% picks are gone.`,
        body:
          'Decants at this price empty fast. The next drop is loaded and ' +
          "waiting — be on the page when the clock hits zero, or you'll " +
          'watch it disappear again.',
        timerLabel: 'Next deal in',
        primaryCtaLabel: 'See What You Missed',
        primaryCtaHref: '/deals/today',
        secondaryCtaLabel: 'Browse All',
      }
    : {
        eyebrow: `${adminHeadline} · Today Only`,
        headlineLead: `${discountPercent}% OFF`,
        headlineTail: adminSubheadline,
        body:
          `Ends ${formatDealEnd(deal.ends_at)}. Hand-filled from verified ` +
          "retail bottles — same authenticity promise, just today's price.",
        timerLabel: 'Ends in',
        primaryCtaLabel: adminCtaLabel,
        primaryCtaHref: adminCtaHref,
        secondaryCtaLabel: 'Browse All',
      };

  const collage = products.slice(0, 3);

  return (
    <section className="relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.18]"
        style={{ background: `radial-gradient(circle at top, ${accent}, transparent 55%)` }}
      />
      <div
        className="absolute inset-0 opacity-[0.14]"
        style={{ background: `radial-gradient(circle at bottom, ${accent}, transparent 55%)` }}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 md:py-28 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-7">
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] uppercase tracking-[0.35em] font-bold"
              style={{ backgroundColor: `${accent}1a`, color: deepAccent, border: `1px solid ${accent}40` }}
            >
              <Sparkles size={12} />
              <span>{copy.eyebrow}</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-serif text-[color:var(--hero-text)] leading-[1.05]">
              <span style={{ color: deepAccent }}>{copy.headlineLead}</span>
              <br />
              <span className="italic text-3xl md:text-5xl text-[color:var(--hero-muted)]">{copy.headlineTail}</span>
            </h1>

            <p className="text-base md:text-lg text-[color:var(--hero-muted)] max-w-xl">
              {copy.body}
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href={copy.primaryCtaHref}
                className="px-10 py-4 text-xs font-bold uppercase tracking-widest text-white transition-all flex items-center justify-center gap-3"
                style={{ backgroundColor: deepAccent }}
              >
                <span>{copy.primaryCtaLabel}</span>
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/products"
                className="border border-[color:var(--hero-cta-alt-border)] text-[color:var(--hero-cta-alt-text)] px-10 py-4 text-xs font-bold uppercase tracking-widest hover:bg-[color:var(--hero-cta-alt-hover)] transition-all flex items-center justify-center"
              >
                {copy.secondaryCtaLabel}
              </Link>
            </div>

            {/* Segmented countdown — same component / accent treatment in
                both states, only the label changes. When the deal sells
                out we count to the same `ends_at` (the moment the next
                window opens), so users see the natural rollover.
                `w-fit mx-auto md:mx-0` keeps the pill sized to its content
                but centers it within the column on mobile (where the rest
                of the text reads left-aligned but the timer benefits from
                being centered for emphasis) and snaps back to the left on
                tablet+ to match the rest of the column. */}
            <div
              className="flex w-fit mx-auto md:mx-0 items-center gap-4 px-5 py-3 rounded-2xl bg-white/90 border shadow-lg"
              style={{ borderColor: `${accent}33`, color: deepAccent }}
            >
              <DealCountdown
                endsAt={deal.ends_at}
                boxed
                label={copy.timerLabel}
                // Themed tiles — use the deepened accent so the timer stays
                // on-brand (matches the banner above) and still reads with
                // white digits on any admin-picked accent (pastel or dark).
                tileBg={deepAccent}
                tileFg="#ffffff"
              />
            </div>
          </div>

          <div className="relative">
            {collage.length === 0 ? (
              heroImage ? (
                <div className="aspect-[4/5] rounded-[32px] bg-white border border-white/80 shadow-xl overflow-hidden relative">
                  <Image
                    src={heroImage}
                    alt={copy.headlineTail}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    priority
                    className="object-cover"
                  />
                </div>
              ) : null
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {collage.map((p, i) => {
                  const v = cheapestVariant(p);
                  const outOfStock = isProductOutOfStock(p);
                  return (
                    <Link
                      key={(p._id || p.id || i) as string}
                      href={`/products/${p.slug || p._id || p.id}`}
                      className={`group relative overflow-hidden rounded-2xl bg-white border border-emerald-50 shadow-lg ${i === 0 ? 'col-span-2 aspect-[16/9]' : 'aspect-square'}`}
                    >
                      {p.image_url && (
                        <Image
                          src={p.image_url}
                          alt={p.name}
                          fill
                          sizes="(max-width: 768px) 50vw, 25vw"
                          className={`object-contain transition-transform duration-700 group-hover:scale-105 ${outOfStock ? 'opacity-60 grayscale' : ''}`}
                        />
                      )}
                      {/* Top-right pill: Out of Stock takes precedence over
                          the discount % so we never advertise a deal on a
                          product the user can't actually buy. */}
                      {outOfStock ? (
                        <span className="absolute top-2 right-2 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest text-white shadow-md bg-rose-600">
                          Out of Stock
                        </span>
                      ) : v && (v.discount_percent ?? 0) > 0 ? (
                        <span
                          className="absolute top-2 right-2 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest text-white shadow-md"
                          style={{ backgroundColor: deepAccent }}
                        >
                          -{v.discount_percent}%
                        </span>
                      ) : null}
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-3">
                        <p className="text-[9px] uppercase tracking-widest text-white/70 font-bold">
                          {p.brand}
                        </p>
                        <p className="text-sm text-white font-bold truncate">{p.name}</p>
                        {v && (
                          <div className="mt-1 flex items-baseline gap-2 flex-wrap">
                            <span className="text-sm font-extrabold text-white tabular-nums">
                              {inr(v.sale_price ?? v.price)}
                            </span>
                            {(v.original_price ?? 0) > (v.sale_price ?? v.price) && (
                              <span className="text-[11px] text-white/55 line-through tabular-nums">
                                {inr(v.original_price)}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
