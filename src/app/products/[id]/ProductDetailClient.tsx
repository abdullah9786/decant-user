"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ShoppingBag,
  ChevronRight,
  Star,
  ShieldCheck,
  Truck,
  ChevronLeft,
} from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { toast } from "react-hot-toast";
import FairPricing from "@/components/home/FairPricing";

export default function ProductDetailClient({ product, bottles = [] }: { product: any; bottles?: any[] }) {
  const firstVariant = product.variants?.[0];
  const [selectedSize, setSelectedSize] = useState<number | null>(
    firstVariant?.size_ml ?? null
  );
  const [selectedIsPack, setSelectedIsPack] = useState<boolean>(
    !!firstVariant?.is_pack
  );
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [sanitizedDescription, setSanitizedDescription] = useState("");
  const [selectedBottleId, setSelectedBottleId] = useState<string | null>(null);
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    if (!product?.description) return;
    import("dompurify").then((mod) => {
      const DOMPurify = mod.default;
      setSanitizedDescription(
        DOMPurify.sanitize(
          (product.description || "").replace(/&nbsp;|\u00A0/g, " ")
        )
      );
    });
  }, [product?.description]);

  const allImages = [product.image_url, ...(product.images || [])].filter(
    Boolean
  );
  const currentVariant =
    product.variants?.find(
      (v: any) => v.size_ml === selectedSize && !!v.is_pack === selectedIsPack
    ) || product.variants?.[0];
  const selectedMl = selectedSize ?? currentVariant?.size_ml ?? 0;
  const selectedPrice = currentVariant?.price ?? 0;
  const availableMl = product.stock_ml ?? 0;
  const isPack = !!currentVariant?.is_pack;
  const canFulfill = isPack
    ? (currentVariant?.stock ?? 0) >= 1
    : selectedMl > 0 && availableMl >= selectedMl;
  const bottlePrice = selectedMl
    ? Math.round((selectedPrice / selectedMl) * 100)
    : 5000;

  const decantVariants = (product.variants || []).filter((v: any) => !v.is_pack);
  const packVariants = (product.variants || []).filter((v: any) => v.is_pack);
  const othersLow = selectedPrice ? selectedPrice + 200 : 0;
  const othersHigh = selectedPrice ? selectedPrice + 250 : 0;

  const productBottleIds: string[] = product.bottle_ids || [];
  const availableBottles = productBottleIds.length === 0 ? [] : bottles.filter((b: any) => {
    if (isPack) return false;
    if (!(b.compatible_sizes || []).includes(selectedMl)) return false;
    const bid = b.id || b._id;
    return productBottleIds.includes(bid);
  });

  const selectedBottle = availableBottles.find(
    (b: any) => (b.id || b._id) === selectedBottleId
  );
  const bottleAddon = selectedBottle?.size_prices?.[String(selectedMl)] ?? 0;

  useEffect(() => {
    if (availableBottles.length === 0) {
      setSelectedBottleId(null);
      return;
    }
    const current = availableBottles.find((b: any) => (b.id || b._id) === selectedBottleId);
    if (current) return;
    const def = availableBottles.find((b: any) => b.is_default);
    setSelectedBottleId((def?.id || def?._id) ?? (availableBottles[0]?.id || availableBottles[0]?._id) ?? null);
  }, [selectedMl, isPack, availableBottles.length]);

  const handleAddToCart = () => {
    if (!product || !currentVariant) return;

    addItem({
      id: product.id || product._id,
      name: product.name,
      brand: product.brand,
      size_ml: selectedSize!,
      price: currentVariant.price + bottleAddon,
      quantity: 1,
      is_pack: isPack,
      ...(selectedBottle && {
        bottle_id: selectedBottle.id || selectedBottle._id,
        bottle_name: selectedBottle.name,
        bottle_price: bottleAddon,
      }),
    } as any);
    const label = isPack ? `${selectedSize}ml Pack` : `${selectedSize}ml`;
    toast.success(`${product.name} (${label}) added to bag!`, {
      icon: "✨",
      style: {
        borderRadius: "10px",
        background: "#022c22",
        color: "#fff",
        fontSize: "12px",
        textTransform: "uppercase",
        letterSpacing: "0.1em",
      },
    });
  };

  return (
    <div className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <nav className="text-[10px] uppercase tracking-widest text-gray-400 mb-8 flex items-center">
          <Link href="/" className="hover:text-emerald-600 transition-colors">
            Home
          </Link>
          <ChevronRight size={10} className="mx-2" />
          <Link
            href="/products"
            className="hover:text-emerald-600 transition-colors"
          >
            Shop
          </Link>
          <ChevronRight size={10} className="mx-2" />
          <span className="text-emerald-600 font-bold">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 xl:gap-20 items-start">
          {/* Left Column: Image Gallery */}
          <div className="lg:col-span-7 lg:sticky lg:top-24 lg:self-start flex flex-col md:flex-row-reverse gap-4">
            {/* Main Image Viewer */}
            <div className="flex-1 relative aspect-[4/5] bg-gray-50 overflow-hidden group">
              {allImages.map((img, i) => (
                <Image
                  key={i}
                  src={img}
                  alt={product.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 58vw"
                  priority={i === 0}
                  className={`object-cover transition-opacity duration-500 ${
                    i === activeImageIdx ? "opacity-100 z-10" : "opacity-0 z-0"
                  }`}
                />
              ))}

              {/* Mobile Controls */}
              <div className="absolute inset-0 flex items-center justify-between p-4 md:hidden pointer-events-none z-20">
                <button
                  onClick={() =>
                    setActiveImageIdx((prev) =>
                      prev === 0 ? allImages.length - 1 : prev - 1
                    )
                  }
                  className="p-2 bg-white/80 rounded-full shadow-lg backdrop-blur-sm pointer-events-auto"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={() =>
                    setActiveImageIdx((prev) =>
                      prev === allImages.length - 1 ? 0 : prev + 1
                    )
                  }
                  className="p-2 bg-white/80 rounded-full shadow-lg backdrop-blur-sm pointer-events-auto"
                >
                  <ChevronRight size={20} />
                </button>
              </div>

              {/* Mobile Indicators */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 md:hidden z-20">
                {allImages.map((_: string, i: number) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === activeImageIdx
                        ? "bg-emerald-600 w-4"
                        : "bg-gray-300 w-1.5"
                    }`}
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
                    i === activeImageIdx
                      ? "border-emerald-600 ring-2 ring-emerald-50"
                      : "border-transparent hover:border-gray-200"
                  }`}
                >
                  <Image
                    src={img}
                    alt=""
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>

            {/* Horizontal Thumbnails (Mobile Below) */}
            <div className="md:hidden flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
              {allImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImageIdx(i)}
                  className={`flex-shrink-0 w-20 aspect-square relative border-2 transition-all ${
                    i === activeImageIdx
                      ? "border-emerald-600"
                      : "border-transparent"
                  }`}
                >
                  <Image
                    src={img}
                    alt=""
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Details (Sticky) */}
          <div className="lg:col-span-5 relative">
            <div className="space-y-8">
              <div>
                <p className="text-xs font-bold tracking-[0.4em] uppercase text-emerald-600 mb-4">
                  {product.brand}
                </p>
                <h1 className="text-4xl md:text-5xl font-serif text-emerald-950 mb-6 leading-tight">
                  {product.name}
                </h1>

                <div className="flex items-center space-x-6">
                  <div className="flex text-yellow-500">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} size={14} fill="currentColor" />
                    ))}
                  </div>
                  <div className="h-4 w-px bg-gray-200" />
                  <span className="text-[10px] font-bold text-green-600 uppercase tracking-widest flex items-center">
                    <ShieldCheck size={12} className="mr-1.5" />
                    Authenticated Fragrance
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-3xl font-bold text-emerald-950">
                  ₹{(currentVariant?.price || 0) + bottleAddon}
                  {bottleAddon > 0 && (
                    <span className="text-sm font-medium text-gray-400 ml-2">(incl. ₹{bottleAddon} bottle)</span>
                  )}
                </p>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
                  Tax included. Shipping calculated at checkout.
                </p>
              </div>

              <div className="space-y-6">
                {decantVariants.length > 0 && (
                <div className="space-y-4">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-900 block">
                    Select Size (ML)
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {decantVariants.map((v: any) => {
                      const outOfStock = availableMl < v.size_ml;
                      const isSelected = selectedSize === v.size_ml && !selectedIsPack;
                      return (
                      <button
                        key={v.size_ml}
                        onClick={() => { setSelectedSize(v.size_ml); setSelectedIsPack(false); }}
                        disabled={outOfStock}
                        className={`min-w-[80px] py-3 px-4 text-[10px] font-bold transition-all border ${
                          isSelected
                            ? "bg-emerald-950 text-white border-emerald-950 shadow-md transform -translate-y-0.5"
                            : outOfStock
                              ? "bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed"
                              : "border-gray-200 text-gray-500 hover:border-emerald-600 hover:text-emerald-950"
                        }`}
                      >
                        {v.size_ml}ML {outOfStock && "(Out)"}
                      </button>
                      );
                    })}
                  </div>
                </div>
                )}

                {packVariants.length > 0 && (
                <div className="space-y-4">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-900 block">
                    Sealed Bottles
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {packVariants.map((v: any) => {
                      const outOfStock = (v.stock ?? 0) < 1;
                      const isSelected = selectedSize === v.size_ml && selectedIsPack;
                      return (
                      <button
                        key={`pack-${v.size_ml}`}
                        onClick={() => { setSelectedSize(v.size_ml); setSelectedIsPack(true); }}
                        disabled={outOfStock}
                        className={`min-w-[80px] py-3 px-4 text-[10px] font-bold transition-all border ${
                          isSelected
                            ? "bg-emerald-950 text-white border-emerald-950 shadow-md transform -translate-y-0.5"
                            : outOfStock
                              ? "bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed"
                              : "border-gray-200 text-gray-500 hover:border-emerald-600 hover:text-emerald-950"
                        }`}
                      >
                        {v.size_ml}ML Pack {outOfStock && "(Out)"}
                      </button>
                      );
                    })}
                  </div>
                </div>
                )}

                {availableBottles.length > 0 && (
                <div className="space-y-3 pt-2">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-900">
                    Choose Your Bottle
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {availableBottles.map((b: any) => {
                      const bid = b.id || b._id;
                      const isSelected = selectedBottleId === bid;
                      return (
                        <button
                          key={bid}
                          type="button"
                          onClick={() => setSelectedBottleId(bid)}
                          className={`flex items-center space-x-3 px-4 py-3 rounded-xl border-2 transition-all ${
                            isSelected
                              ? "border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-200"
                              : "border-gray-200 hover:border-emerald-300"
                          }`}
                        >
                          {b.image_url && (
                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0 relative">
                              <Image src={b.image_url} alt={b.name} fill sizes="40px" className="object-cover" />
                            </div>
                          )}
                          <div className="text-left">
                            <p className="text-xs font-bold text-emerald-950">{b.name}</p>
                            <p className="text-[10px] text-gray-400">
                              {(() => { const p = b.size_prices?.[String(selectedMl)] ?? 0; return p > 0 ? `+₹${p}` : "+₹0"; })()}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-xs text-gray-500">
                    Want to know more about our bottles? <Link href="/bottles" className="font-bold text-emerald-600 hover:underline">View bottles</Link>
                  </p>
                </div>
                )}

                <div className="space-y-4 pt-4">
                  <button
                    onClick={handleAddToCart}
                    disabled={!currentVariant || !canFulfill}
                    className="w-full bg-emerald-950 text-white py-6 text-[10px] font-bold uppercase tracking-widest hover:bg-black cursor-pointer transition-all flex items-center justify-center space-x-3 shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed group/cart"
                  >
                    <ShoppingBag
                      size={18}
                      className="group-hover/cart:scale-110 transition-transform"
                    />
                    <span>{canFulfill ? "Add to Cart" : "Out of Stock"}</span>
                  </button>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3 p-4 bg-gray-50/50 rounded-lg">
                      <Truck size={18} className="text-emerald-600" />
                      <span className="text-[9px] font-bold uppercase tracking-widest leading-tight">
                        Fast pan-india shipping
                      </span>
                    </div>
                    <div className="flex items-center space-x-3 p-4 bg-gray-50/50 rounded-lg">
                      <ShieldCheck size={18} className="text-emerald-600" />
                      <span className="text-[9px] font-bold uppercase tracking-widest leading-tight">
                        Secure Payment encryption
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-gray-100">
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-950 mb-6">
                  Fragrance Description
                </h3>
                <div
                  className="prose prose-sm font-serif italic text-gray-600 leading-relaxed text-lg rich-content"
                  style={{ wordBreak: "normal", overflowWrap: "break-word" }}
                  dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Scent Pyramid */}
        {((product?.notes_top?.length ?? 0) +
          (product?.notes_middle?.length ?? 0) +
          (product?.notes_base?.length ?? 0) >
          0) && (
          <div className="mt-10 md:mt-20">
            <div className="text-center mb-12">
              <span className="text-xs md:text-sm font-bold uppercase tracking-[0.35em] text-emerald-700">
                SCENT PYRAMID
              </span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-10">
              <div className="relative hidden lg:flex flex-col items-center">
                <div className="absolute top-6 bottom-6 w-px bg-emerald-100"></div>
                {[
                  { label: "Top Notes" },
                  { label: "Heart Notes" },
                  { label: "Base Notes" },
                ].map((item, idx) => (
                  <div
                    key={item.label}
                    className="relative z-10 flex flex-col items-center mb-10 last:mb-0"
                  >
                    <div
                      className={`w-28 h-28 rounded-full border-2 ${idx === 2 ? "border-emerald-700" : "border-emerald-200"} bg-white flex items-center justify-center`}
                    >
                      <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-800">
                        {item.label}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="space-y-4 md:space-y-6">
                {[
                  {
                    title: "Top Notes",
                    notes: product?.notes_top || [],
                    desc: product?.notes_top_desc,
                  },
                  {
                    title: "Heart Notes",
                    notes: product?.notes_middle || [],
                    desc: product?.notes_middle_desc,
                  },
                  {
                    title: "Base Notes",
                    notes: product?.notes_base || [],
                    desc: product?.notes_base_desc,
                  },
                ].map((block) => (
                  <div
                    key={block.title}
                    className="bg-white border border-emerald-100 rounded-xl p-4 md:p-6"
                  >
                    <div className="lg:hidden text-[10px] uppercase font-bold tracking-widest text-[#4B4136] mb-1">
                      {block.title}
                    </div>
                    <div className="text-emerald-950 font-serif text-lg mb-1.5">
                      {block.notes.length > 0
                        ? block.notes.join(", ")
                        : "Notes coming soon"}
                    </div>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      {block.desc || "Description coming soon."}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {block.notes.map((n: string) => (
                        <span
                          key={`${block.title}-${n}`}
                          className="text-[10px] uppercase tracking-widest px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-100"
                        >
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

      {!isPack && (
      <FairPricing
        bottlePrice={bottlePrice}
        ourPrice={selectedPrice + bottleAddon}
        sizeLabel={selectedMl ? `${selectedMl}ml` : "Decant"}
        othersLow={othersLow}
        othersHigh={othersHigh}
        introText={
          selectedMl
            ? `For ${selectedMl}ml, fair price is ₹${(selectedPrice + bottleAddon).toLocaleString("en-IN")}.`
            : "Choose a size to see fair pricing."
        }
      />
      )}

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
                  No fake markups. No &ldquo;coupon drama.&rdquo;
                </h2>
                <p className="mt-4 text-slate-600 text-base leading-relaxed max-w-2xl">
                  Some stores inflate the price just to &ldquo;slash&rdquo; it
                  at checkout. We don&apos;t do that. Our pricing is the real
                  price — fair from the start, without forced coupons or inflated
                  MRP tricks.
                </p>
              </div>
              <div className="bg-emerald-950 text-white rounded-2xl p-6 shadow-2xl">
                <div className="text-[10px] uppercase tracking-[0.3em] text-emerald-200 font-bold">
                  Price truth
                </div>
                <div className="mt-4 space-y-4">
                  <div className="flex items-center justify-between border border-emerald-900/60 rounded-xl px-4 py-3">
                    <span className="text-[10px] uppercase tracking-widest text-emerald-200">
                      Other sites
                    </span>
                    <span className="text-sm font-bold text-emerald-100">
                      Marked up + coupon bait
                    </span>
                  </div>
                  <div className="flex items-center justify-between border border-emerald-700/60 rounded-xl px-4 py-3 bg-emerald-900/40">
                    <span className="text-[10px] uppercase tracking-widest text-emerald-200">
                      Decume
                    </span>
                    <span className="text-lg font-bold">
                      ₹{(selectedPrice || 0) + bottleAddon}
                    </span>
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
                <div className="text-[10px] uppercase tracking-[0.35em] text-emerald-700 font-bold">
                  Limited decants • Small batches
                </div>
                <h2 className="text-3xl md:text-4xl font-serif text-emerald-950 mt-4">
                  Make this your next scent ritual.
                </h2>
                <p className="text-slate-600 mt-4 text-base leading-relaxed max-w-2xl">
                  {product.name} by {product.brand} is crafted in authentic
                  small-batch decants. Discover the full character without
                  committing to a full bottle — and keep it in rotation when it
                  becomes your signature.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <span className="text-[10px] uppercase tracking-widest px-4 py-2 bg-emerald-50 text-emerald-800 border border-emerald-100">
                    100% Original Bottle
                  </span>
                  <span className="text-[10px] uppercase tracking-widest px-4 py-2 bg-emerald-50 text-emerald-800 border border-emerald-100">
                    Fast Pan‑India Shipping
                  </span>
                  <span className="text-[10px] uppercase tracking-widest px-4 py-2 bg-emerald-50 text-emerald-800 border border-emerald-100">
                    Secure Checkout
                  </span>
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-emerald-100 p-6 shadow-lg">
                <div className="text-[10px] uppercase tracking-[0.3em] text-emerald-700 font-bold">
                  Selected Size
                </div>
                <div className="mt-3 text-2xl font-serif text-emerald-950">
                  {selectedSize ? `${selectedSize} ML` : "Choose your size"}
                </div>
                <div className="mt-2 text-sm text-slate-500">
                  {canFulfill
                    ? isPack
                      ? `In stock · ${currentVariant?.stock ?? 0} units available`
                      : `In stock · ${availableMl}ml available`
                    : "Currently out of stock"}
                </div>
                <div className="mt-6 text-3xl font-serif text-emerald-950">
                  ₹{currentVariant?.price}
                </div>
                <button
                  onClick={handleAddToCart}
                  disabled={!currentVariant || !canFulfill}
                  className="mt-6 w-full bg-emerald-950 text-white py-4 text-[10px] font-bold uppercase tracking-widest hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {canFulfill ? "Add to Cart" : "Out of Stock"}
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
