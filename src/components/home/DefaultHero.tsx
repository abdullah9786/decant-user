import Link from 'next/link';
import Image from 'next/image';
import { Sparkles, Star, ArrowRight } from 'lucide-react';

/**
 * Default homepage hero, rendered when no daily deal is active.
 * Pulled out of `app/page.tsx` so it can be swapped with `DailyDealHero`.
 */
export default function DefaultHero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.18),_transparent_55%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(15,118,110,0.14),_transparent_55%)]"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 md:py-32 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center space-x-2 text-[10px] uppercase tracking-[0.4em] text-[color:var(--hero-accent)] font-bold">
              <Sparkles size={14} />
              <span>Decanted Luxury, India</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-serif text-[color:var(--hero-text)] leading-[1.05]">
              Perfume as an <span className="italic">art</span>,<br />
              discovery as a ritual.
            </h1>
            <p className="text-lg text-[color:var(--hero-muted)] max-w-xl">
              Explore authentic designer and niche fragrances in curated
              decant sizes. Beautifully packaged, instantly shippable, and
              crafted for first impressions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/products"
                className="bg-[color:var(--hero-cta-bg)] text-[color:var(--hero-cta-text)] px-10 py-4 text-xs font-bold uppercase tracking-widest hover:bg-[color:var(--hero-cta-bg-hover)] transition-all flex items-center justify-center space-x-3"
              >
                <span>Shop Collection</span>
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/search"
                className="border border-[color:var(--hero-cta-alt-border)] text-[color:var(--hero-cta-alt-text)] px-10 py-4 text-xs font-bold uppercase tracking-widest hover:bg-[color:var(--hero-cta-alt-hover)] transition-all flex items-center justify-center"
              >
                Find Your Scent
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-6 pt-6">
              {[
                { label: 'Verified Originals', value: '100%' },
                { label: 'Pan‑India Delivery', value: '48‑72h' },
                { label: 'Trial Sizes', value: '2/5/10ml' },
              ].map((item) => (
                <div
                  key={item.label}
                  className="border-t border-[color:var(--hero-border)] pt-4"
                >
                  <div className="text-lg font-bold text-[color:var(--hero-text)]">
                    {item.value}
                  </div>
                  <div className="text-[10px] uppercase tracking-widest text-[color:var(--hero-muted)]">
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="aspect-[4/5] rounded-[32px] bg-white border border-white/80 shadow-xl overflow-hidden relative">
              <Image
                src="https://ik.imagekit.io/smhon4suw/ChatGPT%20Image%20May%2023,%202026,%2002_07_04%20PM.png"
                alt="Elegant perfume bottles"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
                className="object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 bg-white shadow-xl rounded-2xl p-5 border border-emerald-50">
              <div className="text-[10px] uppercase tracking-widest text-emerald-700 font-bold mb-2">
                Top Rated
              </div>
              <div className="flex items-center space-x-2">
                <Star size={16} className="text-emerald-600" />
                <span className="text-sm font-bold text-emerald-950">4.9</span>
                <span className="text-xs text-slate-500">/ 5</span>
              </div>
            </div>
            <div className="absolute -top-6 -right-6 bg-emerald-900 text-white rounded-2xl px-5 py-4 shadow-xl">
              <div className="text-[10px] uppercase tracking-widest text-emerald-200">
                New Drop
              </div>
              <div className="text-sm font-bold">Santal & Amber</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
