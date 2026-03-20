"use client";

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

type FairPricingProps = {
  bottlePrice: number;
  ourPrice: number;
  sizeLabel: string;
  othersLow: number;
  othersHigh: number;
  introText: string;
};

const formatPrice = (value: number) => `₹${value.toLocaleString('en-IN')}`;

const FairPricing = ({
  bottlePrice,
  ourPrice,
  sizeLabel,
  othersLow,
  othersHigh,
  introText,
}: FairPricingProps) => {
  return (
    <section className="py-12 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[32px] border border-emerald-100 bg-[image:var(--accent-gradient)] text-[color:var(--accent-text)] p-6 md:p-14">
          {/* <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,_rgba(255,255,255,0.22)_0%,_transparent_65%)] pointer-events-none" /> */}
          {/* <div className="absolute -right-10 -bottom-10 w-48 h-48 rounded-full bg-emerald-800" /> */}
          <div className="text-center">
            <div className="text-[10px] uppercase tracking-[0.35em] text-[color:var(--accent-muted)] font-bold">Fair Pricing</div>
            <h3 className="text-2xl md:text-4xl font-serif mt-4">
              Pay the true cost of a decant.
            </h3>
            <p className="text-[color:var(--accent-muted)] mt-3">{introText}</p>
          </div>

          <div className="relative mt-10 rounded-2xl border border-white/20 bg-black/10 p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-6 text-center">
              <div className="space-y-1">
                <div className="text-[10px] uppercase tracking-widest text-[color:var(--accent-muted)] font-bold">Bottle</div>
                <div className="text-2xl font-serif">{formatPrice(bottlePrice)}</div>
                <div className="text-xs text-[color:var(--accent-muted)]">100ml retail</div>
              </div>

              <div className="text-white/60 text-xl font-serif hidden md:block">→</div>

              <div className="space-y-1">
                <div className="text-[10px] uppercase tracking-widest text-[color:var(--accent-muted)] font-bold">Others</div>
                <div className="text-2xl font-serif line-through decoration-white/50">
                  {formatPrice(othersLow)}–{formatPrice(othersHigh)}
                </div>
                <div className="text-xs text-[color:var(--accent-muted)]">{sizeLabel} decant</div>
              </div>

              <div className="text-white/60 text-xl font-serif hidden md:block">→</div>

              <div className="space-y-1">
                <div className="text-[10px] uppercase tracking-widest text-white font-bold">Our Price</div>
                <div className="text-3xl font-serif">{formatPrice(ourPrice)}</div>
                <div className="text-xs text-[color:var(--accent-muted)]">{sizeLabel} fair‑price</div>
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="text-sm text-[color:var(--accent-muted)]">
              Transparent pricing so you can explore more scents without paying inflated margins.
            </div>
            <Link href="/products" className="inline-flex items-center text-xs font-bold uppercase tracking-widest text-white border-b border-white/60">
              Explore fair‑price decants <ArrowRight size={14} className="ml-2" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FairPricing;
