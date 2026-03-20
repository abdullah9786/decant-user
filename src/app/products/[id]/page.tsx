"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBag, ChevronRight, Star, ShieldCheck, Truck, Loader2, ChevronLeft } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { productApi } from '@/lib/api';
import { toast } from 'react-hot-toast';
import FairPricing from '@/components/home/FairPricing';


export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await productApi.getOne(id);
        setProduct(response.data);
        if (response.data.variants?.length > 0) {
          setSelectedSize(response.data.variants[0].size_ml);
        }
      } catch (err) {
        console.error("Error fetching product", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const allImages = product ? [product.image_url, ...(product.images || [])].filter(Boolean) : [];
  const currentVariant = product?.variants?.find((v: any) => v.size_ml === selectedSize) || product?.variants?.[0];
  const selectedMl = selectedSize ?? currentVariant?.size_ml ?? 0;
  const selectedPrice = currentVariant?.price ?? 0;
  const availableMl = product?.stock_ml ?? 0;
  const canFulfill = selectedMl > 0 && availableMl >= selectedMl;
  const bottlePrice = selectedMl ? Math.round((selectedPrice / selectedMl) * 100) : 5000;
  const othersLow = selectedPrice ? selectedPrice + 200 : 0;
  const othersHigh = selectedPrice ? selectedPrice + 250 : 0;

  const handleAddToCart = () => {
    if (!product || !currentVariant) return;
    
    addItem({
      id: product.id || product._id,
      name: product.name,
      brand: product.brand,
      size_ml: selectedSize!,
      price: currentVariant.price,
      quantity: 1
    });
    toast.success(`${product.name} added to cart!`, {
      style: {
        background: '#1e1b4b',
        color: '#fff',
        fontSize: '10px',
        fontWeight: 'bold',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        borderRadius: '0',
      },
      iconTheme: {
        primary: '#fff',
        secondary: '#1e1b4b',
      },
    });
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="animate-spin text-emerald-600" size={40} />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <p className="text-gray-400 font-serif italic text-xl">Fragrance not found.</p>
        <Link href="/products" className="text-xs font-bold uppercase tracking-widest text-emerald-600 border-b border-emerald-600">
            Back to Collection
        </Link>
      </div>
    );
  }

  return (
    <div className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <nav className="text-[10px] uppercase tracking-widest text-gray-400 mb-8 flex items-center">
          <Link href="/" className="hover:text-emerald-600 transition-colors">Home</Link> 
          <ChevronRight size={10} className="mx-2" /> 
          <Link href="/products" className="hover:text-emerald-600 transition-colors">Shop</Link> 
          <ChevronRight size={10} className="mx-2" /> 
          <span className="text-emerald-600 font-bold">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 xl:gap-20">
          {/* Left Column: Image Gallery (Dawn Style) */}
          <div className="lg:col-span-7 flex flex-col md:flex-row-reverse gap-4">
            {/* Main Image Viewer */}
            <div className="flex-1 relative aspect-[4/5] bg-gray-50 overflow-hidden group">
               {/* CSS cross-fade — no JS animation library needed */}
               {allImages.map((img, i) => (
                 <img
                   key={i}
                   src={img}
                   className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
                     i === activeImageIdx ? 'opacity-100 z-10' : 'opacity-0 z-0'
                   }`}
                   alt={product.name}
                 />
               ))}

               {/* Mobile Controls */}
               <div className="absolute inset-0 flex items-center justify-between p-4 md:hidden pointer-events-none z-20">
                  <button 
                    onClick={() => setActiveImageIdx(prev => (prev === 0 ? allImages.length - 1 : prev - 1))}
                    className="p-2 bg-white/80 rounded-full shadow-lg backdrop-blur-sm pointer-events-auto"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button 
                    onClick={() => setActiveImageIdx(prev => (prev === allImages.length - 1 ? 0 : prev + 1))}
                    className="p-2 bg-white/80 rounded-full shadow-lg backdrop-blur-sm pointer-events-auto"
                  >
                    <ChevronRight size={20} />
                  </button>
               </div>

               {/* Mobile Indicators */}
               <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 md:hidden z-20">
                  {allImages.map((_, i) => (
                    <div 
                      key={i} 
                      className={`h-1.5 rounded-full transition-all duration-300 ${i === activeImageIdx ? 'bg-emerald-600 w-4' : 'bg-gray-300 w-1.5'}`}
                    />
                  ))}
               </div>
            </div>

            {/* Thumbnails (Desktop Side List) */}
            <div className="hidden md:flex md:flex-col gap-4 w-24">
               {allImages.map((img, i) => (
                 <button
                    key={i}
                    onClick={() => setActiveImageIdx(i)}
                    className={`aspect-square relative overflow-hidden border-2 transition-all ${
                      i === activeImageIdx ? 'border-emerald-600 ring-2 ring-emerald-50' : 'border-transparent hover:border-gray-200'
                    }`}
                 >
                    <img src={img} className="w-full h-full object-cover" />
                 </button>
               ))}
            </div>
            
            {/* Horizontal Thumbnails (Mobile Below) */}
            <div className="md:hidden flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
               {allImages.map((img, i) => (
                 <button
                    key={i}
                    onClick={() => setActiveImageIdx(i)}
                    className={`flex-shrink-0 w-20 aspect-square border-2 transition-all ${
                      i === activeImageIdx ? 'border-emerald-600' : 'border-transparent'
                    }`}
                 >
                    <img src={img} className="w-full h-full object-cover" />
                 </button>
               ))}
            </div>
          </div>

          {/* Right Column: Details (Sticky) */}
          <div className="lg:col-span-5 relative">
            <div className="lg:sticky lg:top-24 space-y-8">
              <div>
                <p className="text-xs font-bold tracking-[0.4em] uppercase text-emerald-600 mb-4">{product.brand}</p>
                <h1 className="text-4xl md:text-5xl font-serif text-emerald-950 mb-6 leading-tight">{product.name}</h1>
                
                <div className="flex items-center space-x-6">
                  <div className="flex text-yellow-500">
                    {[1, 2, 3, 4, 5].map(i => <Star key={i} size={14} fill="currentColor" />)}
                  </div>
                  <div className="h-4 w-px bg-gray-200" />
                  <span className="text-[10px] font-bold text-green-600 uppercase tracking-widest flex items-center">
                    <ShieldCheck size={12} className="mr-1.5" />
                    Authenticated Fragrance
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-3xl font-bold text-emerald-950">₹{currentVariant?.price}</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Tax included. Shipping calculated at checkout.</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-4">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-900 block">Select Size (ML)</label>
                  <div className="flex flex-wrap gap-3">
                    {product.variants?.map((v: any) => (
                      <button
                        key={v.size_ml}
                        onClick={() => setSelectedSize(v.size_ml)}
                        disabled={availableMl < v.size_ml}
                        className={`min-w-[80px] py-3 px-4 text-[10px] font-bold transition-all border ${
                          selectedSize === v.size_ml 
                          ? 'bg-emerald-950 text-white border-emerald-950 shadow-md transform -translate-y-0.5' 
                          : availableMl < v.size_ml 
                            ? 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed'
                            : 'border-gray-200 text-gray-500 hover:border-emerald-600 hover:text-emerald-950'
                        }`}
                      >
                        {v.size_ml}ML {availableMl < v.size_ml && '(Out)'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4 pt-4">
                  <button 
                    onClick={handleAddToCart}
                    disabled={!currentVariant || !canFulfill}
                    className="w-full bg-emerald-950 text-white py-6 text-[10px] font-bold uppercase tracking-widest hover:bg-black cursor-pointer transition-all flex items-center justify-center space-x-3 shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed group/cart"
                  >
                    <ShoppingBag size={18} className="group-hover/cart:scale-110 transition-transform" />
                    <span>{canFulfill ? 'Add to Cart' : 'Out of Stock'}</span>
                  </button>
                  
                  <div className="grid grid-cols-2 gap-4">
                     <div className="flex items-center space-x-3 p-4 bg-gray-50/50 rounded-lg">
                        <Truck size={18} className="text-emerald-600" />
                        <span className="text-[9px] font-bold uppercase tracking-widest leading-tight">Fast pan-india shipping</span>
                     </div>
                     <div className="flex items-center space-x-3 p-4 bg-gray-50/50 rounded-lg">
                        <ShieldCheck size={18} className="text-emerald-600" />
                        <span className="text-[9px] font-bold uppercase tracking-widest leading-tight">Secure Payment encryption</span>
                     </div>
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-gray-100">
                 <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-950 mb-6">Fragrance Description</h3>
                 <div className="prose prose-sm font-serif italic text-gray-600 leading-relaxed text-lg">
                    {product.description}
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <FairPricing
        bottlePrice={bottlePrice}
        ourPrice={selectedPrice}
        sizeLabel={selectedMl ? `${selectedMl}ml` : 'Decant'}
        othersLow={othersLow}
        othersHigh={othersHigh}
        introText={
          selectedMl
            ? `For ${selectedMl}ml, fair price is ₹${selectedPrice.toLocaleString('en-IN')}.`
            : 'Choose a size to see fair pricing.'
        }
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Scent Pyramid */}
        {((product?.notes_top?.length ?? 0) + (product?.notes_middle?.length ?? 0) + (product?.notes_base?.length ?? 0) > 0) && (
          <div className="mt-10 md:mt-20">
            <div className="text-center mb-12">
              <span className="text-[10px] font-bold uppercase tracking-[0.35em] text-emerald-700">SCENT PYRAMID</span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-10">
              <div className="relative hidden lg:flex flex-col items-center">
                <div className="absolute top-6 bottom-6 w-px bg-emerald-100"></div>
                {[
                  { label: 'Top Notes', active: true },
                  { label: 'Heart Notes', active: true },
                  { label: 'Base Notes', active: true },
                ].map((item, idx) => (
                  <div key={item.label} className="relative z-10 flex flex-col items-center mb-10 last:mb-0">
                    <div className={`w-28 h-28 rounded-full border-2 ${idx === 2 ? 'border-emerald-700' : 'border-emerald-200'} bg-white flex items-center justify-center`}>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-800">{item.label}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="space-y-4 md:space-y-6">
                {[
                  { title: 'Top Notes', notes: product?.notes_top || [], desc: product?.notes_top_desc },
                  { title: 'Heart Notes', notes: product?.notes_middle || [], desc: product?.notes_middle_desc },
                  { title: 'Base Notes', notes: product?.notes_base || [], desc: product?.notes_base_desc },
                ].map((block) => (
                  <div key={block.title} className="bg-white border border-emerald-100 rounded-xl p-4 md:p-6">
                    <div className="lg:hidden text-[10px] uppercase font-bold tracking-widest text-[#4B4136] mb-1">
                      {block.title}
                    </div>
                    <div className="text-emerald-950 font-serif text-lg mb-1.5">
                      {block.notes.length > 0 ? block.notes.join(', ') : 'Notes coming soon'}
                    </div>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      {block.desc || 'Description coming soon.'}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {block.notes.map((n: string) => (
                        <span key={`${block.title}-${n}`} className="text-[10px] uppercase tracking-widest px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-100">
                          {n}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* No Fake Discount Promise */}
      <section className="py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-2xl border border-emerald-100 bg-white p-6 md:p-10">
            <div className="absolute -top-8 right-0 w-32 h-32 rounded-full bg-emerald-50" />
            <div className="absolute -bottom-8 left-0 w-32 h-32 rounded-full bg-emerald-50" />
            <div className="relative grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-8 items-center">
              <div>
                <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.35em] text-emerald-700 font-bold bg-emerald-50 px-3 py-1.5 rounded-full">
                  Genuine pricing
                </div>
                <h2 className="mt-4 text-3xl md:text-4xl font-serif text-emerald-950 leading-tight">
                  No fake markups. No “coupon drama.”
                </h2>
                <p className="mt-4 text-slate-600 text-base leading-relaxed max-w-2xl">
                  Some stores inflate the price just to “slash” it at checkout. We don’t do that. 
                  Our pricing is the real price — fair from the start, without forced coupons or inflated MRP tricks.
                </p>
              </div>
              <div className="bg-emerald-950 text-white rounded-2xl p-6 shadow-2xl">
                <div className="text-[10px] uppercase tracking-[0.3em] text-emerald-200 font-bold">Price truth</div>
                <div className="mt-4 space-y-4">
                  <div className="flex items-center justify-between border border-emerald-900/60 rounded-xl px-4 py-3">
                    <span className="text-[10px] uppercase tracking-widest text-emerald-200">Other sites</span>
                    <span className="text-sm font-bold text-emerald-100">Marked up + coupon bait</span>
                  </div>
                  <div className="flex items-center justify-between border border-emerald-700/60 rounded-xl px-4 py-3 bg-emerald-900/40">
                    <span className="text-[10px] uppercase tracking-widest text-emerald-200">Decume</span>
                    <span className="text-lg font-bold">₹{selectedPrice || 0}</span>
                  </div>
                </div>
                <p className="mt-4 text-[10px] uppercase tracking-widest text-emerald-300">
                  The price you see is the price you pay.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Conviction CTA */}
      <section className="py-8 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-2xl border border-emerald-100 bg-white p-6 md:p-14">
            <div className="absolute -top-12 right-0 w-48 h-48 rounded-full bg-emerald-50" />
            <div className="absolute -bottom-12 left-0 w-40 h-40 rounded-full bg-emerald-50" />
            <div className="relative grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-10 items-center">
              <div>
                <div className="text-[10px] uppercase tracking-[0.35em] text-emerald-700 font-bold">Limited decants • Small batches</div>
                <h2 className="text-3xl md:text-4xl font-serif text-emerald-950 mt-4">
                  Make this your next scent ritual.
                </h2>
                <p className="text-slate-600 mt-4 text-base leading-relaxed max-w-2xl">
                  {product.name} by {product.brand} is crafted in authentic small-batch decants. Discover the full character without committing to a full bottle — and keep it in rotation when it becomes your signature.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <span className="text-[10px] uppercase tracking-widest px-4 py-2 bg-emerald-50 text-emerald-800 border border-emerald-100">100% Original Bottle</span>
                  <span className="text-[10px] uppercase tracking-widest px-4 py-2 bg-emerald-50 text-emerald-800 border border-emerald-100">Fast Pan‑India Shipping</span>
                  <span className="text-[10px] uppercase tracking-widest px-4 py-2 bg-emerald-50 text-emerald-800 border border-emerald-100">Secure Checkout</span>
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-emerald-100 p-6 shadow-lg">
                <div className="text-[10px] uppercase tracking-[0.3em] text-emerald-700 font-bold">Selected Size</div>
                <div className="mt-3 text-2xl font-serif text-emerald-950">
                  {selectedSize ? `${selectedSize} ML` : 'Choose your size'}
                </div>
                <div className="mt-2 text-sm text-slate-500">
                  {canFulfill ? `In stock · ${availableMl}ml available` : 'Currently out of stock'}
                </div>
                <div className="mt-6 text-3xl font-serif text-emerald-950">₹{currentVariant?.price}</div>
                <button
                  onClick={handleAddToCart}
                  disabled={!currentVariant || !canFulfill}
                  className="mt-6 w-full bg-emerald-950 text-white py-4 text-[10px] font-bold uppercase tracking-widest hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {canFulfill ? 'Add to Cart' : 'Out of Stock'}
                </button>
                <div className="mt-4 text-[10px] uppercase tracking-widest text-slate-400">
                  Loved by collectors and first‑time explorers alike.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
