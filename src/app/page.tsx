"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import ProductCard from '@/components/ui/ProductCard';
import { productApi, categoryApi } from '@/lib/api';
import { Loader2, Sparkles, ArrowRight, Star, ShieldCheck, BadgeCheck } from 'lucide-react';

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [featuredCategories, setFeaturedCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [catsLoading, setCatsLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const response = await productApi.getAll({ is_featured: true });
        const featured = response.data.filter((p: any) => p.is_featured).slice(0, 6);
        setFeaturedProducts(featured);
      } catch (err) {
        console.error("Error fetching featured products", err);
      } finally {
        setLoading(false);
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await categoryApi.getAll();
        const featured = response.data.filter((c: any) => c.is_featured).slice(0, 4);
        setFeaturedCategories(featured);
      } catch (err) {
        console.error("Error fetching categories", err);
      } finally {
        setCatsLoading(false);
      }
    };

    fetchFeatured();
    fetchCategories();
  }, []);

  return (
    <div className="bg-transparent">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.18),_transparent_55%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(15,118,110,0.14),_transparent_55%)]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 relative">
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
                Explore authentic designer and niche fragrances in curated decant sizes. 
                Beautifully packaged, instantly shippable, and crafted for first impressions.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/products" className="bg-[color:var(--hero-cta-bg)] text-[color:var(--hero-cta-text)] px-10 py-4 text-xs font-bold uppercase tracking-widest hover:bg-[color:var(--hero-cta-bg-hover)] transition-all flex items-center justify-center space-x-3">
                  <span>Shop Collection</span>
                  <ArrowRight size={16} />
                </Link>
                <Link href="/search" className="border border-[color:var(--hero-cta-alt-border)] text-[color:var(--hero-cta-alt-text)] px-10 py-4 text-xs font-bold uppercase tracking-widest hover:bg-[color:var(--hero-cta-alt-hover)] transition-all flex items-center justify-center">
                  Find Your Scent
                </Link>
              </div>
              <div className="grid grid-cols-3 gap-6 pt-6">
                {[
                  { label: 'Verified Originals', value: '100%' },
                  { label: 'Pan‑India Delivery', value: '48‑72h' },
                  { label: 'Trial Sizes', value: '2/5/10ml' },
                ].map((item) => (
                  <div key={item.label} className="border-t border-[color:var(--hero-border)] pt-4">
                    <div className="text-lg font-bold text-[color:var(--hero-text)]">{item.value}</div>
                    <div className="text-[10px] uppercase tracking-widest text-[color:var(--hero-muted)]">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="aspect-[4/5] rounded-[32px] bg-white/70 backdrop-blur-xl border border-white shadow-2xl overflow-hidden">
                <img
                  src="https://i.postimg.cc/wjhVJzPs/Gemini-Generated-Image-se7fiese7fiese7f.png"
                  alt="Elegant perfume bottles"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white shadow-xl rounded-2xl p-5 border border-emerald-50">
                <div className="text-[10px] uppercase tracking-widest text-emerald-700 font-bold mb-2">Top Rated</div>
                <div className="flex items-center space-x-2">
                  <Star size={16} className="text-emerald-600" />
                  <span className="text-sm font-bold text-emerald-950">4.9</span>
                  <span className="text-xs text-slate-500">/ 5</span>
                </div>
              </div>
              <div className="absolute -top-6 -right-6 bg-emerald-900 text-white rounded-2xl px-5 py-4 shadow-xl">
                <div className="text-[10px] uppercase tracking-widest text-emerald-200">New Drop</div>
                <div className="text-sm font-bold">Santal & Amber</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Fair Pricing Comparison */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-[32px] border border-emerald-100 bg-[image:var(--accent-gradient)] text-[color:var(--accent-text)] p-10 md:p-14">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.18),_transparent_55%)]"></div>
            <div className="absolute -right-10 -bottom-10 w-48 h-48 rounded-full bg-white/10 blur-2xl"></div>
            <div className="text-center">
              <div className="text-[10px] uppercase tracking-[0.35em] text-[color:var(--accent-muted)] font-bold">Fair Pricing</div>
              <h3 className="text-2xl md:text-4xl font-serif mt-4">
                Pay the true cost of a decant.
              </h3>
              <p className="text-[color:var(--accent-muted)] mt-3">
                If a 100ml bottle is ₹5,000, a 10ml decant should be ₹500.
              </p>
            </div>

            <div className="relative mt-10 rounded-3xl border border-white/10 bg-white/10 p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-6 text-center">
                <div className="space-y-1">
                  <div className="text-[10px] uppercase tracking-widest text-[color:var(--accent-muted)] font-bold">Bottle</div>
                  <div className="text-2xl font-serif">₹5,000</div>
                  <div className="text-xs text-[color:var(--accent-muted)]">100ml retail</div>
                </div>

                <div className="text-white/60 text-xl font-serif hidden md:block">→</div>

                <div className="space-y-1">
                  <div className="text-[10px] uppercase tracking-widest text-[color:var(--accent-muted)] font-bold">Others</div>
                  <div className="text-2xl font-serif line-through decoration-white/50">₹650–₹700</div>
                  <div className="text-xs text-[color:var(--accent-muted)]">10ml decant</div>
                </div>

                <div className="text-white/60 text-xl font-serif hidden md:block">→</div>

                <div className="space-y-1">
                  <div className="text-[10px] uppercase tracking-widest text-white font-bold">SCENTS</div>
                  <div className="text-3xl font-serif">₹500</div>
                  <div className="text-xs text-[color:var(--accent-muted)]">10ml fair‑price</div>
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

      {/* Signature Atelier Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            <div className="relative">
              <div className="absolute -top-6 -left-6 w-24 h-24 rounded-full bg-emerald-100/70 blur-sm"></div>
              <div className="absolute -bottom-10 right-8 w-32 h-32 rounded-full bg-emerald-200/40 blur-sm"></div>
              <div className="relative grid grid-cols-2 gap-4">
                <div className="rounded-3xl overflow-hidden shadow-xl border border-emerald-50">
                  <img
                    src="https://images.unsplash.com/photo-1470337458703-46ad1756a187?q=80&w=1200&auto=format&fit=crop"
                    alt="Scent ritual"
                    className="w-full h-full object-cover aspect-[4/5]"
                  />
                </div>
                <div className="rounded-3xl overflow-hidden shadow-xl border border-emerald-50 mt-10">
                  <img
                    src="https://images.unsplash.com/photo-1519669011783-4eaa95fa1b7d?q=80&w=1200&auto=format&fit=crop"
                    alt="Perfume details"
                    className="w-full h-full object-cover aspect-[4/5]"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="text-[10px] uppercase tracking-[0.35em] text-[color:var(--hero-accent)] font-bold">The Atelier</div>
              <h2 className="text-4xl md:text-5xl font-serif text-[color:var(--hero-text)] leading-tight">
                Crafted for discovery,<br /> designed for obsession.
              </h2>
              <p className="text-[color:var(--hero-muted)] text-lg">
                We decant every fragrance by hand, preserving its character and
                clarity — so you can explore bold statements or intimate skinscents
                without the commitment of a full bottle.
              </p>
              <div className="grid grid-cols-2 gap-6 pt-2">
                {[
                  { label: 'Hand‑filled', value: 'Small batch' },
                  { label: 'Premium glass', value: 'Leak‑proof' },
                  { label: 'Authentic', value: 'Verified sources' },
                  { label: 'Curated', value: 'By mood & notes' },
                ].map((item) => (
                  <div key={item.label} className="p-4 bg-white/10 border border-white/10 rounded-2xl shadow-sm">
                    <div className="text-sm font-bold text-[color:var(--hero-text)]">{item.value}</div>
                    <div className="text-[10px] uppercase tracking-widest text-[color:var(--hero-muted)] mt-1">{item.label}</div>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-4 pt-4">
                <Link href="/new-arrivals" className="bg-[color:var(--hero-cta-bg)] text-[color:var(--hero-cta-text)] px-8 py-3 text-xs font-bold uppercase tracking-widest hover:bg-[color:var(--hero-cta-bg-hover)] transition-all">
                  Explore New Arrivals
                </Link>
                <Link href="/brands" className="text-xs font-bold uppercase tracking-widest text-[color:var(--hero-cta-alt-text)] border-b border-[color:var(--hero-cta-alt-border)]">
                  Shop by Brand
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Editorial Strip */}
      <section className="py-16 bg-white/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: 'Curated Houses', copy: 'Every decant is sourced from verified bottles, never replicas.' },
            { title: 'Small Batch', copy: 'Hand‑filled and labeled for a boutique, premium feel.' },
            { title: 'Scent Guidance', copy: 'Find your profile by notes, moods, or occasions.' },
          ].map((item) => (
            <div key={item.title} className="p-8 border border-emerald-50 bg-white/70 rounded-2xl shadow-sm">
              <h3 className="text-lg font-serif text-emerald-950 mb-2">{item.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{item.copy}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Trust / Authenticity */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-[32px] border border-emerald-100 bg-[image:var(--accent-gradient)] text-[color:var(--accent-text)] p-10 md:p-14">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.18),_transparent_55%)]"></div>
            <div className="absolute -right-10 -bottom-10 w-48 h-48 rounded-full bg-white/10 blur-2xl"></div>
            <div className="relative grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-12 items-center">
              <div>
                <div className="text-[10px] uppercase tracking-[0.35em] text-[color:var(--accent-muted)] font-bold">Authenticity Promise</div>
                <h3 className="text-3xl md:text-4xl font-serif mt-3">
                  Decanted exclusively from original, sealed retail bottles.
                </h3>
                <p className="text-[color:var(--accent-muted)] mt-4 max-w-2xl">
                  We never use refills or clones. Every decant is hand‑filled, labeled, and sealed
                  to preserve the exact character of the fragrance you’d experience from a full bottle.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                  {[
                    { label: 'Verified', value: 'Originals' },
                    { label: 'Small‑batch', value: 'Hand‑filled' },
                    { label: 'Clean tools', value: 'Sanitized' },
                    { label: 'Secure', value: 'Leak‑proof' },
                  ].map((item) => (
                    <div key={item.label} className="bg-white/10 border border-white/10 rounded-2xl p-4">
                      <div className="text-sm font-bold">{item.value}</div>
                      <div className="text-[10px] uppercase tracking-widest text-[color:var(--accent-muted)] mt-1">{item.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white text-emerald-950 rounded-3xl p-6 md:p-8 shadow-2xl border border-emerald-50">
                <div className="flex items-center justify-between mb-6">
                  <div className="text-[10px] uppercase tracking-[0.3em] text-emerald-700 font-bold">Certificate</div>
                  <div className="w-10 h-10 rounded-full bg-emerald-900 text-white flex items-center justify-center">
                    <ShieldCheck size={18} />
                  </div>
                </div>
                <div className="text-lg font-serif text-emerald-950 mb-2">Original Source Guarantee</div>
                <p className="text-sm text-slate-600">
                  Each decant is sourced from verified retail stock and checked before dispatch.
                </p>
                <div className="mt-6 space-y-3">
                  {[
                    'Retail bottle verification',
                    'Batch‑tracked decanting',
                    'Tamper‑safe sealing',
                  ].map((item) => (
                    <div key={item} className="flex items-center space-x-3 text-sm">
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

      {/* Collections Bento */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <div className="text-[10px] uppercase tracking-[0.35em] text-[color:var(--hero-accent)] font-bold">Collections</div>
              <h2 className="text-3xl md:text-4xl font-serif text-[color:var(--hero-text)]">Signature Curations</h2>
            </div>
            <Link href="/products" className="text-xs font-bold uppercase tracking-widest text-[color:var(--hero-accent)] border-b border-[color:var(--hero-accent)]">
              View all
            </Link>
          </div>

          {catsLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin text-emerald-200" size={32} />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredCategories.length > 0 ? (
                featuredCategories.map((cat, idx) => (
                  <Link
                    key={cat._id}
                    href={`/products?category=${cat.name}`}
                    className="group relative overflow-hidden rounded-3xl border border-emerald-50 bg-white shadow-lg h-64 md:h-72"
                  >
                    {cat.image_url ? (
                      <img
                        src={cat.image_url}
                        alt={cat.name}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-emerald-50 flex items-center justify-center text-4xl">
                        {cat.icon || '✨'}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent"></div>
                    <div className="relative p-6 h-full flex flex-col justify-end">
                      <div className="text-[10px] uppercase tracking-[0.35em] text-white/70 mb-2">Curated</div>
                      <h3 className="text-white text-2xl font-serif uppercase tracking-widest">{cat.name}</h3>
                      <span className="mt-4 inline-flex items-center text-[10px] uppercase tracking-widest text-white/80">
                        Explore Collection <ArrowRight size={12} className="ml-2" />
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
          )}
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-white/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <div className="text-[10px] uppercase tracking-[0.35em] text-emerald-700 font-bold">The Edit</div>
              <h2 className="text-3xl md:text-4xl font-serif text-emerald-950">Featured Fragrances</h2>
            </div>
            <Link href="/products" className="text-xs font-bold uppercase tracking-widest text-emerald-700 border-b border-emerald-700">
              Shop all
            </Link>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="animate-spin text-emerald-200" size={32} />
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProducts.map((product) => (
                <ProductCard key={product._id || product.id} {...product} />
              ))}
            </div>
          ) : (
            <div className="text-center text-slate-400 italic py-12">
              Browse our collection to see all perfumes.
            </div>
          )}
        </div>
      </section>

      {/* Closing CTA */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-[32px] bg-[image:var(--accent-gradient)] text-[color:var(--accent-text)] p-12 md:p-16 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_right,_rgba(255,255,255,0.12),_transparent_60%)]"></div>
            <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-8">
              <div>
                <div className="text-[10px] uppercase tracking-[0.35em] text-[color:var(--accent-muted)]">Personalized</div>
                <h3 className="text-3xl md:text-4xl font-serif">Let us curate your next signature scent.</h3>
                <p className="text-[color:var(--accent-muted)] mt-3 max-w-xl">
                  Explore by note profiles, occasions, or designer houses — and build a collection you’ll love.
                </p>
              </div>
              <Link href="/search" className="bg-white text-emerald-950 px-10 py-4 text-xs font-bold uppercase tracking-widest hover:bg-emerald-50 transition-all">
                Start the Scent Finder
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
