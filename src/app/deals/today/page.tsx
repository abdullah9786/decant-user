import type { Metadata } from 'next';
import Link from 'next/link';
import { Sparkles, ArrowLeft } from 'lucide-react';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import DealCountdown from '@/components/deal/DealCountdown';
import { deepenAccent, formatDealEnd } from '@/components/deal/constants';
import { areAllProductsOutOfStock } from '@/lib/product/stock';

export const metadata: Metadata = {
  title: "Today's Daily Deal | Decume",
  description:
    "Decume Daily — a fresh fragrance deal every day. Hand-filled decants and sealed bottles from verified retail stock with limited-time pricing.",
  alternates: { canonical: 'https://decume.in/deals/today' },
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

async function getDailyDeal() {
  try {
    const res = await fetch(`${API_URL}/offers/daily-deal/today`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export default async function DealsTodayPage() {
  const data = await getDailyDeal();
  const deal = data?.deal ?? null;
  const products = data?.products ?? [];

  if (!deal || products.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <Sparkles className="mx-auto mb-4 text-emerald-700" size={32} />
        <h1 className="text-3xl md:text-4xl font-serif text-emerald-950">
          No deal today
        </h1>
        <p className="mt-4 text-slate-500">
          Check back soon for the next Decume Daily, or explore the full
          collection in the meantime.
        </p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 mt-8 px-6 py-3 bg-emerald-950 text-white text-xs font-bold uppercase tracking-widest hover:bg-black transition-all"
        >
          Browse all products
        </Link>
      </div>
    );
  }

  const accent = deal.display?.accent_color || '#dc2626';
  // Foreground-safe deepened accent for text/pills that sit on white.
  const deepAccent = deepenAccent(accent);
  const adminHeadline = deal.display?.headline || 'Decume Daily';
  const adminSubheadline =
    deal.display?.subheadline ||
    `${deal.config?.discount_percent || 0}% OFF`;

  // Reframe the hero when every product on this page is sold out. Same
  // accent palette, same countdown, but the eyebrow / headline / footer
  // copy carry the "you missed it, next drop incoming" tone.
  const soldOut = areAllProductsOutOfStock(products);
  const eyebrowSuffix = soldOut ? 'Sold Out · You Missed It' : 'Today Only';
  const headline = soldOut ? 'Vanished' : adminHeadline;
  const subheadline = soldOut
    ? `Today's ${deal.config?.discount_percent || 0}% picks are gone.`
    : adminSubheadline;
  const timerCaption = soldOut
    ? `Next deal opens ${formatDealEnd(deal.ends_at)}`
    : `Ends ${formatDealEnd(deal.ends_at)}`;

  return (
    <div className="bg-transparent">
      <section
        className="relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${accent}10 0%, transparent 60%)`,
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-bold text-slate-500 hover:text-slate-900 transition-colors mb-8"
          >
            <ArrowLeft size={14} />
            Back home
          </Link>

          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] uppercase tracking-[0.35em] font-bold"
            style={{
              backgroundColor: `${accent}1a`,
              color: deepAccent,
              border: `1px solid ${accent}40`,
              marginLeft: '10px',
            }}
          >
            <Sparkles size={12} />
            <span>{adminHeadline} · {eyebrowSuffix}</span>
          </div>

          <h1 className="mt-6 text-4xl md:text-6xl font-serif text-emerald-950 leading-tight">
            <span style={{ color: soldOut ? deepAccent : undefined }}>
              {headline}
            </span>
            {subheadline && (
              <span className="block italic text-2xl md:text-4xl text-slate-500 mt-3 font-serif">
                {subheadline}
              </span>
            )}
          </h1>

          {soldOut && (
            <p className="mt-6 text-base md:text-lg text-slate-600 max-w-2xl">
              Decants this priced go in hours. The next drop is loaded and
              waiting — be on the page when the clock hits zero, or you'll
              watch it vanish again.
            </p>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border"
              style={{ borderColor: `${accent}55`, color: deepAccent }}
            >
              <DealCountdown endsAt={deal.ends_at} compact className="text-xs" />
            </div>
            <p className="text-xs uppercase tracking-widest font-bold text-slate-500">
              {timerCaption}
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FeaturedProducts products={products} />
        </div>
      </section>
    </div>
  );
}
