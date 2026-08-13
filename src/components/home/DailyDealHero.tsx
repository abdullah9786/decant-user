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
    deal.display?.subheadline || `${deal.config?.discount_percent || 0}% OFF`;
  const adminCtaLabel = deal.display?.cta_label || 'Shop the Deal';
  const adminCtaHref = deal.display?.cta_href || '/deals/today';

  // Copy bundle. Branching all the text decisions here keeps the JSX
  // below readable and makes the "what changes when sold out" question
  // answerable by reading one block instead of scanning the whole file.
  const copy = soldOut
    ? {
        eyebrow: `Sold Out · You Missed It`,
        headlineLead: 'Vanished.',
        headlineTail: `These ${discountPercent}% picks are gone.`,
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
        eyebrow: adminHeadline,
        headlineLead: `${discountPercent}% OFF`,
        headlineTail: adminSubheadline,
        body:
          `Ends ${formatDealEnd(deal.ends_at)}. Hand-filled from verified ` +
          'retail bottles — same authenticity promise, at a limited-time price.',
        timerLabel: 'Ends in',
        primaryCtaLabel: adminCtaLabel,
        primaryCtaHref: adminCtaHref,
        secondaryCtaLabel: 'Browse All',
      };

  // Every product selected in the admin belongs in the hero. The previous
  // three-item cap made larger deals look as though they only applied to the
  // visible products, even though the backend had discounted the full list.
  const collage = products;
  const isCompactCollage = collage.length >= 4;

  const collageGridClass =
    collage.length === 4
      ? 'grid grid-cols-2 gap-2.5 md:gap-3'
      : collage.length >= 5
        ? 'grid grid-cols-2 sm:grid-cols-6 gap-2.5 md:gap-3'
        : 'grid grid-cols-2 gap-4';

  const collageCardClass = (index: number) => {
    const count = collage.length;

    // Keep the established editorial hierarchy for small deals: the first
    // product is the wide feature card and the remaining products are square.
    if (count <= 3) {
      return index === 0 ? 'col-span-2 aspect-[16/9]' : 'aspect-square';
    }

    // Four products form a simple, balanced 2x2 grid.
    if (count === 4) return 'aspect-square';

    // Five or more products use a six-column desktop grid (three cards per
    // full row). A two-card final row expands to equal halves; a one-card final
    // row is centred. On phones the grid becomes two columns and an odd final
    // card spans the row so there is never a misleading empty slot.
    const remainder = count % 3;
    const isLast = index === count - 1;
    const isInTwoCardFinalRow = remainder === 2 && index >= count - 2;
    const mobileOddTail = count % 2 === 1 && isLast
      ? 'col-span-2 aspect-[16/9]'
      : 'col-span-1 aspect-square';

    if (isInTwoCardFinalRow) {
      return `${mobileOddTail} sm:col-span-3 sm:aspect-square`;
    }
    if (remainder === 1 && isLast) {
      return `${mobileOddTail} sm:col-span-2 sm:col-start-3 sm:aspect-square`;
    }
    return `${mobileOddTail} sm:col-span-2 sm:aspect-square`;
  };

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
              <div className={collageGridClass}>
                {collage.map((p, i) => {
                  const v = cheapestVariant(p);
                  const outOfStock = isProductOutOfStock(p);
                  return (
                    <Link
                      key={(p._id || p.id || i) as string}
                      href={`/products/${p.slug || p._id || p.id}`}
                      className={`group relative overflow-hidden rounded-2xl bg-white border border-emerald-50 shadow-lg ${collageCardClass(i)}`}
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
                        <span className={`absolute top-2 right-2 inline-flex items-center px-2 py-0.5 rounded-full font-bold uppercase tracking-widest text-white shadow-md bg-rose-600 ${isCompactCollage ? 'text-[8px] md:text-[9px]' : 'text-[10px]'}`}>
                          Out of Stock
                        </span>
                      ) : v && (v.discount_percent ?? 0) > 0 ? (
                        <span
                          className={`absolute top-2 right-2 inline-flex items-center px-2 py-0.5 rounded-full font-bold uppercase tracking-widest text-white shadow-md ${isCompactCollage ? 'text-[8px] md:text-[9px]' : 'text-[10px]'}`}
                          style={{ backgroundColor: deepAccent }}
                        >
                          -{v.discount_percent}%
                        </span>
                      ) : null}
                      <div className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent ${isCompactCollage ? 'p-2 md:p-2.5' : 'p-3'}`}>
                        <p className={`uppercase tracking-widest text-white/70 font-bold ${isCompactCollage ? 'text-[7px] md:text-[8px]' : 'text-[9px]'}`}>
                          {p.brand}
                        </p>
                        <p className={`text-white font-bold truncate ${isCompactCollage ? 'text-[11px] md:text-xs' : 'text-sm'}`}>{p.name}</p>
                        {v && (
                          <div className={`flex items-baseline flex-wrap ${isCompactCollage ? 'mt-0.5 gap-1.5' : 'mt-1 gap-2'}`}>
                            <span className={`font-extrabold text-white tabular-nums ${isCompactCollage ? 'text-[11px] md:text-xs' : 'text-sm'}`}>
                              {inr(v.sale_price ?? v.price)}
                            </span>
                            {(v.original_price ?? 0) > (v.sale_price ?? v.price) && (
                              <span className={`text-white/55 line-through tabular-nums ${isCompactCollage ? 'text-[8px] md:text-[9px]' : 'text-[11px]'}`}>
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
