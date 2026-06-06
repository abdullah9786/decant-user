import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  ShieldCheck,
  BadgeCheck,
  ArrowRight,
} from "lucide-react";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import FairPricing from "@/components/home/FairPricing";
import DefaultHero from "@/components/home/DefaultHero";
import DailyDealHero from "@/components/home/DailyDealHero";
import DailyDealRail from "@/components/home/DailyDealRail";
import TopCategories from "@/components/home/TopCategories";
import SectionHeader from "@/components/home/SectionHeader";
import HomeSectionShell from "@/components/home/HomeSectionShell";

export const metadata: Metadata = {
  title: "Decume | Premium Perfume Decants India — Authentic Trial Sizes",
  description:
    "Discover authentic designer and niche perfume decants at fair prices. Hand-filled, leak-proof, 48-72h pan-India delivery. Try before you commit to a full bottle.",
  alternates: { canonical: "https://decume.in" },
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

async function getFeaturedProducts() {
  try {
    const res = await fetch(`${API_URL}/products?is_featured=true`, {
      next: { revalidate: 600 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.filter((p: any) => p.is_featured);
  } catch {
    return [];
  }
}

async function getFeaturedSets() {
  try {
    const res = await fetch(`${API_URL}/products?product_type=set&is_featured=true`, {
      next: { revalidate: 600 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.filter((p: any) => p.product_type === 'set' && p.is_featured !== false);
  } catch {
    return [];
  }
}

async function getFeaturedCategories() {
  try {
    const res = await fetch(`${API_URL}/categories?featured=true`, {
      next: { revalidate: 600 },
    });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

async function getFeaturedFamilies() {
  try {
    const res = await fetch(`${API_URL}/fragrance-families`, {
      next: { revalidate: 600 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.filter((c: any) => c.is_featured).slice(0, 4);
  } catch {
    return [];
  }
}

// Pulled at a shorter cadence than other homepage fetches so the daily-deal
// hero/rail flips within ~60s of admin saving or midnight rollover.
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

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Decume",
  url: "https://decume.in",
  description:
    "Authentic perfume decants from designer and niche houses. Trial sizes, fair pricing, pan-India delivery.",
  potentialAction: {
    "@type": "SearchAction",
    target: "https://decume.in/search?q={search_term_string}",
    "query-input": "required name=search_term_string",
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Decume",
  url: "https://decume.in",
  description:
    "Premium perfume decanting service in India. Authentic fragrances in trial sizes.",
};

export default async function HomePage() {
  const [featuredProducts, featuredSets, featuredFamilies, featuredCategories, dealResp] = await Promise.all([
    getFeaturedProducts(),
    getFeaturedSets(),
    getFeaturedFamilies(),
    getFeaturedCategories(),
    getDailyDeal(),
  ]);

  const dailyDeal = dealResp?.deal ?? null;
  const dealProducts = dealResp?.products ?? [];

  // Sets have their own section — exclude them from decant / full-bottle rails.
  const decantProducts = featuredProducts.filter((p: any) =>
    p.product_type !== 'set' && p.variants?.some((v: any) => !v.is_pack),
  );
  const fullBottleProducts = featuredProducts.filter((p: any) =>
    p.product_type !== 'set' && p.variants?.some((v: any) => v.is_pack),
  );

  return (
    <div className="bg-transparent">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      {/* Hero — swaps to a deal-centric layout when a daily deal is live */}
      {dailyDeal && dealProducts.length > 0 ? (
        <DailyDealHero deal={dailyDeal} products={dealProducts} />
      ) : (
        <DefaultHero />
      )}

      <TopCategories categories={featuredCategories} />

      {/* Shop for Him & Her */}
      <section className="pt-12 pb-6 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="text-[10px] uppercase tracking-[0.35em] text-emerald-700 font-bold">
              Gift a Fragrance
            </div>
            <h2 className="text-3xl md:text-4xl font-serif text-emerald-950 mt-1">
              A Scent They&#39;ll Never Forget
            </h2>
            <p className="text-sm text-slate-500 mt-3 max-w-md mx-auto">
              Not sure what to pick? Shop by who it&#39;s for and surprise someone special.
            </p>
          </div>
          {/* Side-by-side on every breakpoint (was stacked on mobile). The
              cards shrink to ~half-width on small screens, so the height
              and title sizes step up progressively rather than starting at
              the desktop scale. */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6">
            {/* Shop for Him */}
            <Link
              href="/categories/for-him"
              className="group relative overflow-hidden rounded-2xl h-[280px] sm:h-[360px] md:h-[500px]"
            >
              <Image
                src="https://ik.imagekit.io/smhon4suw/Gemini_Generated_Image_w1c5cmw1c5cmw1c5.png"
                alt="Shop fragrances for him"
                fill
                sizes="(max-width: 768px) 50vw, 50vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/35 group-hover:bg-black/45 transition-all duration-500" />
              <div className="relative h-full flex flex-col items-center justify-center text-center px-3">
                <h3 className="text-white text-2xl sm:text-4xl md:text-6xl font-serif">
                  Shop For Him
                </h3>
                <span className="mt-3 sm:mt-4 inline-flex items-center text-[10px] sm:text-xs uppercase tracking-widest text-white/70 font-bold group-hover:text-white transition-colors">
                  Explore
                  <ArrowRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </Link>

            {/* Shop for Her */}
            <Link
              href="/categories/for-her"
              className="group relative overflow-hidden rounded-2xl h-[280px] sm:h-[360px] md:h-[500px]"
            >
              <Image
                src="https://ik.imagekit.io/smhon4suw/Gemini_Generated_Image_2f5avv2f5avv2f5a.png"
                alt="Shop fragrances for her"
                fill
                sizes="(max-width: 768px) 50vw, 50vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/35 group-hover:bg-black/45 transition-all duration-500" />
              <div className="relative h-full flex flex-col items-center justify-center text-center px-3">
                <h3 className="text-white text-2xl sm:text-4xl md:text-6xl font-serif">
                  Shop For Her
                </h3>
                <span className="mt-3 sm:mt-4 inline-flex items-center text-[10px] sm:text-xs uppercase tracking-widest text-white/70 font-bold group-hover:text-white transition-colors">
                  Explore
                  <ArrowRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Sets */}
      {featuredSets.length > 0 && (
      <HomeSectionShell className="md:py-16">
        <SectionHeader
          eyebrow="Curated Collections"
          title="Sets"
          href="/products?type=set"
        />
        <FeaturedProducts products={featuredSets} compact />
      </HomeSectionShell>
      )}

      {/* Decants */}
      <HomeSectionShell className="md:py-16">
        <SectionHeader
          eyebrow="Try Before You Commit"
          title="Decants"
          href="/products?type=decant"
        />

        {decantProducts.length > 0 ? (
          <FeaturedProducts products={decantProducts} compact />
        ) : (
          <div className="text-center text-slate-400 italic py-12">
            No decants available yet.
          </div>
        )}

        <div className="mt-6 md:mt-8">
          <Link
            href="/products?type=decant"
            className="block w-full text-center py-4 text-xs font-bold uppercase tracking-widest text-emerald-950 border border-emerald-200/80 bg-white/80 hover:bg-white transition-colors rounded-lg"
          >
            Shop all decants
          </Link>
        </div>
      </HomeSectionShell>

      {/* Full Bottles */}
      <HomeSectionShell className="md:py-16">
        <SectionHeader
          eyebrow="The Full Experience"
          title="Sealed Bottles"
          href="/products?type=full-bottle"
        />

        {fullBottleProducts.length > 0 ? (
          <FeaturedProducts products={fullBottleProducts} priceMode="pack" compact />
        ) : (
          <div className="text-center text-slate-400 italic py-12">
            No sealed bottles available yet.
          </div>
        )}

        <div className="mt-6 md:mt-8">
          <Link
            href="/products?type=full-bottle"
            className="block w-full text-center py-4 text-xs font-bold uppercase tracking-widest text-emerald-950 border border-emerald-200/80 bg-white/80 hover:bg-white transition-colors rounded-lg"
          >
            Shop all sealed bottles
          </Link>
        </div>
      </HomeSectionShell>

      {/* Today's Daily Deal rail — sits just above Signature Curations so
          users reach core catalog sections first when a deal is live. */}
      {dailyDeal && dealProducts.length > 0 && (
        <DailyDealRail deal={dailyDeal} products={dealProducts} />
      )}

      {/* Collections Bento */}
      <section className="py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <div className="text-[10px] uppercase tracking-[0.35em] text-[color:var(--hero-accent)] font-bold">
                Collections
              </div>
              <h2 className="text-3xl md:text-4xl font-serif text-[color:var(--hero-text)]">
                Signature Curations
              </h2>
            </div>
            <Link
              href="/products"
              className="hidden md:inline-block text-xs font-bold uppercase tracking-widest text-[color:var(--hero-accent)] border-b border-[color:var(--hero-accent)]"
            >
              View all
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
            {featuredFamilies.length > 0 ? (
              featuredFamilies.map((cat: any) => (
                <Link
                  key={cat._id}
                  href={`/products?fragrance_family=${cat.name}`}
                  className="group relative overflow-hidden rounded-3xl border border-emerald-50 bg-white shadow-lg h-64 md:h-72"
                >
                  {cat.image_url ? (
                    <Image
                      src={cat.image_url}
                      alt={cat.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-emerald-50 flex items-center justify-center text-4xl">
                      {cat.icon || "✨"}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent"></div>
                  <div className="relative p-6 h-full flex flex-col justify-end">
                    <div className="text-[10px] uppercase tracking-[0.35em] text-white/70 mb-2">
                      Curated
                    </div>
                    <h3 className="text-white text-2xl font-serif uppercase tracking-widest">
                      {cat.name}
                    </h3>
                    <span className="mt-4 inline-flex items-center text-[10px] uppercase tracking-widest text-white/80">
                      Explore Collection{" "}
                      <ArrowRight size={12} className="ml-2" />
                    </span>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full text-center text-slate-400 italic py-10">
                No featured collections yet.
              </div>
            )}
          </div>

          <div className="mt-8">
            <Link
              href="/products"
              className="block w-full text-center py-4 text-xs font-bold uppercase tracking-widest text-[color:var(--hero-accent)] border border-[color:var(--hero-accent)]/20 hover:bg-[color:var(--hero-accent)]/5 transition-colors"
            >
              View all collections
            </Link>
          </div>
        </div>
      </section>

      <FairPricing
        bottlePrice={5000}
        ourPrice={500}
        sizeLabel="10ml"
        othersLow={650}
        othersHigh={700}
        introText="If a 100ml bottle is ₹5,000, a 10ml decant should be ₹500."
      />

      {/* Trust / Authenticity */}
      <section className="py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-[32px] border border-emerald-100 bg-[image:var(--accent-gradient)] text-[color:var(--accent-text)] p-6 md:p-14">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.18),_transparent_55%)]"></div>
            <div className="absolute -right-10 -bottom-10 w-48 h-48 rounded-full bg-white/10 blur-2xl"></div>
            <div className="relative grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-12 items-center">
              <div>
                <div className="text-[10px] uppercase tracking-[0.35em] text-[color:var(--accent-muted)] font-bold">
                  Authenticity Promise
                </div>
                <h3 className="text-3xl md:text-4xl font-serif mt-3">
                  Decanted exclusively from original, sealed retail bottles.
                </h3>
                <p className="text-[color:var(--accent-muted)] mt-4 max-w-2xl">
                  We never use refills. Every decant is hand‑filled,
                  labeled, and sealed to preserve the exact character of the
                  fragrance you'd experience from a full bottle.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                  {[
                    { label: "Verified", value: "Originals" },
                    { label: "Small‑batch", value: "Hand‑filled" },
                    { label: "Clean tools", value: "Sanitized" },
                    { label: "Secure", value: "Leak‑proof" },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="bg-white/10 border border-white/10 rounded-2xl p-4"
                    >
                      <div className="text-sm font-bold">{item.value}</div>
                      <div className="text-[10px] uppercase tracking-widest text-[color:var(--accent-muted)] mt-1">
                        {item.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white text-emerald-950 rounded-3xl p-6 md:p-8 shadow-2xl border border-emerald-50">
                <div className="flex items-center justify-between mb-6">
                  <div className="text-[10px] uppercase tracking-[0.3em] text-emerald-700 font-bold">
                    Certificate
                  </div>
                  <div className="w-10 h-10 rounded-full bg-emerald-900 text-white flex items-center justify-center">
                    <ShieldCheck size={18} />
                  </div>
                </div>
                <div className="text-lg font-serif text-emerald-950 mb-2">
                  Original Source Guarantee
                </div>
                <p className="text-sm text-slate-600">
                  Each decant is sourced from verified retail stock and checked
                  before dispatch.
                </p>
                <div className="mt-6 space-y-3">
                  {[
                    "Retail bottle verification",
                    "Batch‑tracked decanting",
                    "Tamper‑safe sealing",
                  ].map((item) => (
                    <div
                      key={item}
                      className="flex items-center space-x-3 text-sm"
                    >
                      <BadgeCheck size={16} className="text-emerald-700" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-4 border-t border-emerald-100 text-[10px] uppercase tracking-widest text-emerald-700">
                  Verified by SCENTS Atelier
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Editorial Strip */}
      <section className="py-10 md:py-16 bg-white/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "Curated Houses",
              copy: "Every decant is sourced from verified bottles, never replicas.",
            },
            {
              title: "Small Batch",
              copy: "Hand‑filled and labeled for a boutique, premium feel.",
            },
            {
              title: "Scent Guidance",
              copy: "Find your profile by notes, moods, or occasions.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="p-8 border border-emerald-50 bg-white/70 rounded-2xl shadow-sm"
            >
              <h3 className="text-lg font-serif text-emerald-950 mb-2">
                {item.title}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {item.copy}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Closing CTA */}
      <section className="py-12 md:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-[32px] bg-[image:var(--accent-gradient)] text-[color:var(--accent-text)] p-8 md:p-16 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_right,_rgba(255,255,255,0.12),_transparent_60%)]"></div>
            <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-8">
              <div>
                <div className="text-[10px] uppercase tracking-[0.35em] text-[color:var(--accent-muted)]">
                  Personalized
                </div>
                <h3 className="text-3xl md:text-4xl font-serif">
                  Let us curate your next signature scent.
                </h3>
                <p className="text-[color:var(--accent-muted)] mt-3 max-w-xl">
                  Explore by note profiles, occasions, or designer houses — and
                  build a collection you'll love.
                </p>
              </div>
              <Link
                href="/search"
                className="bg-white text-emerald-950 px-10 py-4 text-xs font-bold uppercase tracking-widest hover:bg-emerald-50 transition-all text-center"
              >
                Start the Scent Finder
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
