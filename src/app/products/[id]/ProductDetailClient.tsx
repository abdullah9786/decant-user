"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  ChevronRight,
  ShieldCheck,
  Truck,
  ChevronLeft,
  Gift,
} from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { toast } from "react-hot-toast";
import FairPricing from "@/components/home/FairPricing";
import { offerApi, productApi, reviewApi } from "@/lib/api";
import { ChipList } from "@/components/ui/Chip";
import { useActiveDeal } from "@/components/deal/ActiveDealProvider";
import PriceTag from "@/components/deal/PriceTag";
import DealCountdown from "@/components/deal/DealCountdown";
import { deepenAccent, formatDealEnd } from "@/components/deal/constants";
import { buildProductSeoCopy } from "@/lib/product/productSeo";
import { isVariantInStock } from "@/lib/product/stock";
import { variantButtonLabel } from "@/lib/product/variantLabel";
import SuggestedProducts from "@/components/product/SuggestedProducts";
import ProductReviews, {
  ProductRatingHeader,
  type ReviewItem,
  type ReviewSummaryData,
} from "@/components/product/ProductReviews";

interface ProductDetailClientProps {
  product: any;
  bottles?: any[];
  reviewSummary?: ReviewSummaryData;
  /** Server-sanitized description HTML — rendered directly so it's in the SSR/SSG output. */
  descriptionHtml?: string;
}

export default function ProductDetailClient({
  product,
  bottles = [],
  reviewSummary: initialReviewSummary = { average_rating: 0, review_count: 0 },
  descriptionHtml = "",
}: ProductDetailClientProps) {
  const router = useRouter();
  // Related products + the full review list are fetched client-side so the page
  // can be statically rendered + edge-cached. The lightweight review summary
  // arrives from SSR (drives the rating header + JSON-LD stars).
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [reviewSummary, setReviewSummary] = useState(initialReviewSummary);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);

  // Pick a sensible default size (deterministic for SSR so hydration matches):
  //   1. The first *in-stock* variant — so a sold-out 5ml doesn't auto-select
  //      and visually mislead the user.
  //   2. If every variant is sold out, fall back to the first one so
  //      `currentVariant` is non-null and the price/section can render;
  //      the size button itself will be styled as disabled (see render).
  // A `?size=`/`?pack=` deep link is applied after hydration (see effect below)
  // so the page itself stays statically renderable.
  const productStockMl = product.stock_ml ?? 0;
  const firstInStockVariant = product.variants?.find((v: any) =>
    isVariantInStock(v, productStockMl),
  );
  const fallbackVariant = product.variants?.[0];
  const initialVariant = firstInStockVariant ?? fallbackVariant;

  const resolvedInitialSize = initialVariant?.size_ml ?? null;
  const resolvedInitialIsPack = !!initialVariant?.is_pack;

  const [selectedSize, setSelectedSize] = useState<number | null>(resolvedInitialSize);
  const [selectedIsPack, setSelectedIsPack] = useState<boolean>(resolvedInitialIsPack);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [selectedBottleId, setSelectedBottleId] = useState<string | null>(null);
  const addItem = useCartStore((state) => state.addItem);

  // Apply a variant deep link (?size=&pack=&bottle=) once, after hydration.
  // Reading window.location here (rather than the server `searchParams` or the
  // `useSearchParams` hook) keeps the route static instead of forcing SSR.
  const deepLinkApplied = useRef(false);
  // Holds a `?bottle=` id from a deep link until the bottle-sync effect can
  // apply it (it has priority over the auto-selected default). Cleared once
  // applied or when the user picks a bottle/size manually.
  const pendingBottleRef = useRef<string | null>(null);
  useEffect(() => {
    if (deepLinkApplied.current) return;
    deepLinkApplied.current = true;
    const sp = new URLSearchParams(window.location.search);
    const sizeRaw = sp.get("size");
    const pack = sp.get("pack") === "true";
    const bottle = sp.get("bottle");
    if (sizeRaw) {
      const size = parseInt(sizeRaw, 10);
      const match = product.variants?.find(
        (v: any) => v.size_ml === size && !!v.is_pack === pack,
      );
      if (match) {
        setSelectedSize(size);
        setSelectedIsPack(pack);
      }
    }
    if (bottle) pendingBottleRef.current = bottle;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Lazy-load below-the-fold, non-SEO-critical data off the critical path.
  useEffect(() => {
    const idOrSlug = product.slug || product._id || product.id;
    let cancelled = false;
    productApi
      .getRelated(idOrSlug, 10)
      .then((res) => {
        if (!cancelled) setRelatedProducts(res.data || []);
      })
      .catch(() => {});
    reviewApi
      .getByProduct(String(product._id || product.id), { limit: 20 })
      .then((res) => {
        if (!cancelled) setReviews(res.data || []);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [product]);

  const [activeOffer, setActiveOffer] = useState<any>(null);

  useEffect(() => {
    offerApi.getActive().then(res => {
      const offer = (res.data || []).find((o: any) => o.type === "free_decant" && o.is_active);
      if (offer) setActiveOffer(offer);
    }).catch(() => {});
  }, []);

  const slug = product.slug || product._id || product.id;

  const updateUrl = useCallback(
    (size: number | null, isPack: boolean, bottleId: string | null) => {
      const params = new URLSearchParams();
      if (size != null) params.set("size", String(size));
      if (isPack) params.set("pack", "true");
      if (bottleId) params.set("bottle", bottleId);
      const qs = params.toString();
      router.replace(qs ? `/products/${slug}?${qs}` : `/products/${slug}`, { scroll: false });
    },
    [router, slug]
  );

  const allImages = [product.image_url, ...(product.images || [])].filter(
    Boolean
  );
  const currentVariant =
    product.variants?.find(
      (v: any) => v.size_ml === selectedSize && !!v.is_pack === selectedIsPack
    ) || product.variants?.[0];
  const selectedMl = selectedSize ?? currentVariant?.size_ml ?? 0;
  // Sale price falls through to the original price for non-deal variants
  // because the backend annotator sets sale_price == original_price in that
  // case. Either way, this is the per-unit price before bottle addons.
  const variantOriginalPrice = currentVariant?.original_price ?? currentVariant?.price ?? 0;
  const variantSalePrice = currentVariant?.sale_price ?? currentVariant?.price ?? 0;
  const variantDiscountPercent = currentVariant?.discount_percent ?? 0;
  const isOnDeal = variantDiscountPercent > 0 && variantSalePrice < variantOriginalPrice;
  const selectedPrice = variantSalePrice;
  const { deal: activeDeal } = useActiveDeal();
  const accentColor = isOnDeal ? activeDeal?.display?.accent_color || '#dc2626' : null;
  // Darkened, foreground-safe variant of the deal accent. Used wherever the
  // accent has to act as text on white or as a CTA background under white
  // text (image ribbon, eyebrow pill text, countdown chip text). Prevents
  // the "white on pastel pink" failure mode when admin picks a light accent.
  const deepAccent = accentColor ? deepenAccent(accentColor) : null;
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

  const seoCopy = buildProductSeoCopy({
    name: product.name,
    brand: product.brand,
    variants: product.variants,
    matchedVariant: currentVariant
      ? {
          size_ml: currentVariant.size_ml,
          price: currentVariant.price,
          is_pack: !!currentVariant.is_pack,
          stock: currentVariant.stock,
        }
      : null,
  });
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

  const hasSyncedInitial = useRef(false);

  useEffect(() => {
    if (availableBottles.length === 0) {
      pendingBottleRef.current = null;
      if (selectedBottleId !== null) setSelectedBottleId(null);
      if (!hasSyncedInitial.current) {
        hasSyncedInitial.current = true;
        updateUrl(selectedSize, selectedIsPack, null);
      }
      return;
    }
    // A deep-linked bottle takes priority over the current/default selection
    // until it's been applied (it may only become compatible after the
    // deep-linked size is applied a tick later).
    const desiredId = pendingBottleRef.current ?? selectedBottleId;
    const current = availableBottles.find((b: any) => (b.id || b._id) === desiredId);
    if (current) {
      pendingBottleRef.current = null;
      const cid = current.id || current._id;
      if (cid !== selectedBottleId) setSelectedBottleId(cid);
      if (!hasSyncedInitial.current) {
        hasSyncedInitial.current = true;
      }
      updateUrl(selectedSize, selectedIsPack, cid);
      return;
    }
    const def = availableBottles.find((b: any) => b.is_default);
    const newId = (def?.id || def?._id) ?? (availableBottles[0]?.id || availableBottles[0]?._id) ?? null;
    setSelectedBottleId(newId);
    if (!hasSyncedInitial.current) {
      hasSyncedInitial.current = true;
    }
    updateUrl(selectedSize, selectedIsPack, newId);
  }, [selectedMl, isPack, availableBottles.length, selectedBottleId]);

  const handleAddToCart = () => {
    if (!product || !currentVariant) return;

    addItem({
      id: product.id || product._id,
      name: product.name,
      brand: product.brand,
      size_ml: selectedSize!,
      // Snapshot the daily-deal sale price (when present) so the cart total
      // stays in sync with the deal until the user checks out. Backend
      // revalidates on order creation either way.
      price: variantSalePrice + bottleAddon,
      original_price: variantOriginalPrice + bottleAddon,
      discount_percent: variantDiscountPercent,
      deal_id: currentVariant?.deal_id ?? null,
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
    <div className="py-6 md:py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <nav className="text-[10px] uppercase tracking-widest text-gray-400 mb-4 md:mb-8 flex items-center">
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

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-12 xl:gap-20 items-start">
          {/* Left Column: Image Gallery */}
          <div className="lg:col-span-7 lg:sticky lg:top-24 lg:self-start flex flex-col md:flex-row-reverse gap-2 md:gap-4">
            {/* Main Image Viewer */}
            <div
              className="flex-1 relative aspect-[4/5] bg-gray-50 overflow-hidden group"
              style={isOnDeal && accentColor ? { boxShadow: `0 0 0 3px ${accentColor}` } : undefined}
            >
              {isOnDeal && deepAccent && activeDeal && (
                // Ribbon uses the *deepened* accent so the white label stays
                // readable even when admin picks a pastel accent.
                <div
                  className="absolute top-4 left-0 z-30 px-4 py-1.5 text-white text-[10px] font-bold uppercase tracking-[0.25em] shadow-lg"
                  style={{ backgroundColor: deepAccent }}
                >
                  {activeDeal.display?.headline || 'Decume Daily'} · {variantDiscountPercent}% OFF
                </div>
              )}
              {allImages.map((img, i) => (
                <Image
                  key={i}
                  src={img}
                  alt={seoCopy.imageAlt}
                  fill
                  sizes="(max-width: 1024px) 100vw, 58vw"
                  priority={i === 0}
                  className={`object-cover transition-opacity duration-500 ${
                    i === activeImageIdx ? "opacity-100 z-10" : "opacity-0 z-0"
                  }`}
                />
              ))}

              {/* Bottle Overlay */}
              {!isPack && selectedBottle?.image_url && (
                <div className="absolute top-3 right-3 sm:top-5 sm:right-5 z-20 flex flex-col items-center transition-all duration-500 ease-out">
                  <div className="relative w-14 h-20 sm:w-20 sm:h-28 bg-emerald-950/85 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden">
                    <Image
                      src={selectedBottle.image_url}
                      alt={selectedBottle.name || "Decant bottle"}
                      fill
                      sizes="112px"
                      className="object-cover transition-opacity duration-500 scale-130"
                    />
                  </div>
                </div>
              )}

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
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 md:hidden z-30">
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
            <div className="md:hidden flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
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
            <div className="space-y-5 md:space-y-8">
              <div>
                {product.chips && product.chips.length > 0 && (
                  <div className="mb-2 md:mb-4">
                    <ChipList chips={product.chips} max={5} size="md" />
                  </div>
                )}
                <p className="text-xs font-bold tracking-[0.4em] uppercase text-emerald-600 mb-2 md:mb-4">
                  {product.brand}
                </p>
                <h1 className="text-3xl md:text-5xl font-serif text-emerald-950 mb-2 md:mb-3 leading-tight">
                  {product.name}
                </h1>
                <p className="text-[11px] uppercase tracking-[0.25em] text-slate-500 font-medium mb-3 md:mb-6">
                  {seoCopy.formatLabel}
                </p>

                <div className="flex items-center space-x-4 md:space-x-6 flex-wrap gap-y-2">
                  <ProductRatingHeader summary={reviewSummary} size={14} />
                  <div className="h-4 w-px bg-gray-200 hidden sm:block" />
                  <span className="text-[10px] font-bold text-green-600 uppercase tracking-widest flex items-center">
                    <ShieldCheck size={12} className="mr-1.5" />
                    Authenticated Fragrance
                  </span>
                </div>
              </div>

              <div className="space-y-3 md:space-y-4">
                {isOnDeal && accentColor && deepAccent && activeDeal && (
                  // Tinted bg keeps the accent feel; text + dot use the
                  // deepened accent so pastel themes stay readable.
                  <div
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] uppercase tracking-[0.25em] font-bold"
                    style={{ backgroundColor: `${accentColor}1a`, color: deepAccent, border: `1px solid ${accentColor}40` }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: deepAccent }} />
                    <span>{activeDeal.display?.headline || 'Decume Daily'} · {variantDiscountPercent}% OFF</span>
                  </div>
                )}
                <div className="flex flex-wrap items-baseline gap-3">
                  <PriceTag
                    originalPrice={variantOriginalPrice + bottleAddon}
                    salePrice={variantSalePrice + bottleAddon}
                    discountPercent={variantDiscountPercent}
                    size="lg"
                  />
                  {bottleAddon > 0 && (
                    <span className="text-xs font-medium text-gray-400">(incl. ₹{bottleAddon} bottle)</span>
                  )}
                </div>
                {isOnDeal && activeDeal && accentColor && deepAccent && (
                  // Countdown chip sits on the white page background — pull
                  // the text into the deepened accent so it doesn't wash out.
                  <div
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border"
                    style={{ borderColor: `${accentColor}55`, color: deepAccent }}
                  >
                    <DealCountdown endsAt={activeDeal.ends_at} compact className="text-[11px]" />
                  </div>
                )}
                {isOnDeal && activeDeal && (
                  <p className="text-[11px] text-slate-500">
                    Part of today's Daily Deal — ends {formatDealEnd(activeDeal.ends_at)}.
                  </p>
                )}
                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
                  Tax included. Shipping calculated at checkout.
                </p>
              </div>

              <div className="space-y-4 md:space-y-6">
                {decantVariants.length > 0 && (
                <div className="space-y-2.5 md:space-y-4">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-900 block">
                    Select Size (ML)
                  </label>
                  <div className="flex flex-wrap gap-2 md:gap-3">
                    {decantVariants.map((v: any) => {
                      const outOfStock = availableMl < v.size_ml;
                      const isSelected = selectedSize === v.size_ml && !selectedIsPack;
                      // Out-of-stock variants are still *selectable* so the
                      // user can compare prices across sizes. They look
                      // muted (faded fill, strikethrough on the ml label,
                      // "(Out)" suffix) so the unavailability stays
                      // obvious; the actual buying is blocked by the
                      // disabled Add-to-Cart button below.
                      //
                      // Four visual states:
                      //   in-stock,  unselected: outlined gray (default)
                      //   in-stock,  selected:   dark emerald fill (CTA)
                      //   sold-out,  unselected: muted gray, struck through
                      //   sold-out,  selected:   muted gray + emerald ring
                      //                          (shows it's the active
                      //                          price preview while still
                      //                          reading as unavailable)
                      const sizeLabel = (
                        <span className={outOfStock ? 'line-through opacity-80' : ''}>
                          {variantButtonLabel(v)}
                        </span>
                      );
                      return (
                      <button
                        key={v.size_ml}
                        type="button"
                        onClick={() => { pendingBottleRef.current = null; setSelectedSize(v.size_ml); setSelectedIsPack(false); updateUrl(v.size_ml, false, selectedBottleId); }}
                        aria-pressed={isSelected}
                        title={outOfStock ? 'Currently out of stock' : undefined}
                        className={`min-w-[72px] md:min-w-[80px] py-2.5 md:py-3 px-3 md:px-4 text-[10px] font-bold transition-all border ${
                          outOfStock
                            ? isSelected
                              ? "bg-gray-100 text-gray-500 border-emerald-700 ring-2 ring-emerald-700/30"
                              : "bg-gray-50 text-gray-400 border-gray-200 hover:border-gray-300"
                            : isSelected
                              ? "bg-emerald-950 text-white border-emerald-950 shadow-md transform -translate-y-0.5"
                              : "border-gray-200 text-gray-500 hover:border-emerald-600 hover:text-emerald-950"
                        }`}
                      >
                        {sizeLabel} {outOfStock && <span className="ml-0.5">(Out)</span>}
                      </button>
                      );
                    })}
                  </div>
                </div>
                )}

                {packVariants.length > 0 && (
                <div className="space-y-2.5 md:space-y-4">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-900 block">
                    Sealed Bottles
                  </label>
                  <div className="flex flex-wrap gap-2 md:gap-3">
                    {packVariants.map((v: any) => {
                      const outOfStock = (v.stock ?? 0) < 1;
                      const isSelected = selectedSize === v.size_ml && selectedIsPack;
                      // See decant block above for the rationale — packs
                      // get the same four-state treatment so a sold-out
                      // pack can still be tapped to preview its price.
                      const sizeLabel = (
                        <span className={outOfStock ? 'line-through opacity-80' : ''}>
                          {variantButtonLabel(v)}
                        </span>
                      );
                      return (
                      <button
                        key={`pack-${v.size_ml}`}
                        type="button"
                        onClick={() => { pendingBottleRef.current = null; setSelectedSize(v.size_ml); setSelectedIsPack(true); updateUrl(v.size_ml, true, null); }}
                        aria-pressed={isSelected}
                        title={outOfStock ? 'Currently out of stock' : undefined}
                        className={`min-w-[72px] md:min-w-[80px] py-2.5 md:py-3 px-3 md:px-4 text-[10px] font-bold transition-all border ${
                          outOfStock
                            ? isSelected
                              ? "bg-gray-100 text-gray-500 border-emerald-700 ring-2 ring-emerald-700/30"
                              : "bg-gray-50 text-gray-400 border-gray-200 hover:border-gray-300"
                            : isSelected
                              ? "bg-emerald-950 text-white border-emerald-950 shadow-md transform -translate-y-0.5"
                              : "border-gray-200 text-gray-500 hover:border-emerald-600 hover:text-emerald-950"
                        }`}
                      >
                        {sizeLabel} {outOfStock && <span className="ml-0.5">(Out)</span>}
                      </button>
                      );
                    })}
                  </div>
                </div>
                )}

                {availableBottles.length > 0 && (
                <div className="space-y-2.5 md:space-y-3 pt-1 md:pt-2">
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
                          onClick={() => { pendingBottleRef.current = null; setSelectedBottleId(bid); updateUrl(selectedSize, selectedIsPack, bid); }}
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

                <div className="space-y-3 pt-2 md:space-y-4 md:pt-4">
                  {(() => {
                    if (!activeOffer) return null;
                    const cfg = activeOffer.config || {};
                    const minMl = cfg.min_qualifying_ml ?? 10;
                    const qType = cfg.qualifying_type ?? "decant";
                    const freeMl = cfg.free_size_ml ?? 2;
                    const qualifies =
                      ((qType === "decant" && !isPack) ||
                       (qType === "sealed" && isPack) ||
                       qType === "both") &&
                      selectedSize != null && selectedSize >= minMl;
                    if (!qualifies) return null;
                    return (
                      <div className="flex items-center space-x-3 px-4 py-2.5 md:py-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <Gift size={16} className="text-amber-600 flex-shrink-0" />
                        <p className="text-xs text-amber-800">
                          <span className="font-bold">FREE {freeMl}ml decant</span>
                          <span className="text-amber-600"> — pick yours in the cart!</span>
                        </p>
                      </div>
                    );
                  })()}

                  <button
                    onClick={handleAddToCart}
                    disabled={!currentVariant || !canFulfill}
                    className="w-full bg-emerald-950 text-white py-4 md:py-6 text-[10px] font-bold uppercase tracking-widest hover:bg-black cursor-pointer transition-all flex items-center justify-center space-x-3 shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed group/cart"
                  >
                    <ShoppingBag
                      size={18}
                      className="group-hover/cart:scale-110 transition-transform"
                    />
                    <span>{canFulfill ? "Add to Cart" : "Out of Stock"}</span>
                  </button>

                  <div className="grid grid-cols-2 gap-3 md:gap-4">
                    <div className="flex items-center space-x-2.5 md:space-x-3 p-3 md:p-4 bg-gray-50/50 rounded-lg">
                      <Truck size={18} className="text-emerald-600" />
                      <span className="text-[9px] font-bold uppercase tracking-widest leading-tight">
                        Fast pan-india shipping
                      </span>
                    </div>
                    <div className="flex items-center space-x-2.5 md:space-x-3 p-3 md:p-4 bg-gray-50/50 rounded-lg">
                      <ShieldCheck size={18} className="text-emerald-600" />
                      <span className="text-[9px] font-bold uppercase tracking-widest leading-tight">
                        Secure Payment encryption
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 md:pt-8 border-t border-gray-100">
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-950 mb-4 md:mb-6">
                  Fragrance Description
                </h3>
                <div
                  className="prose prose-sm font-serif italic text-gray-600 leading-relaxed text-lg rich-content"
                  style={{ wordBreak: "normal", overflowWrap: "break-word" }}
                  dangerouslySetInnerHTML={{ __html: descriptionHtml }}
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

      <ProductReviews
        productId={String(product._id || product.id)}
        initialReviews={reviews}
        initialSummary={reviewSummary}
        onReviewsChange={(nextReviews, nextSummary) => {
          setReviews(nextReviews);
          setReviewSummary(nextSummary);
        }}
      />

      <SuggestedProducts products={relatedProducts} />

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
                  Each Decume decant of {product.name} is hand-poured from a
                  genuine, sealed bottle of {product.brand} into a Decume vial.
                  Discover the full character without committing to a full
                  bottle — and keep it in rotation when it becomes your
                  signature.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <span className="text-[10px] uppercase tracking-widest px-4 py-2 bg-emerald-50 text-emerald-800 border border-emerald-100">
                    Poured from a Sealed Original Bottle
                  </span>
                  <span className="text-[10px] uppercase tracking-widest px-4 py-2 bg-emerald-50 text-emerald-800 border border-emerald-100">
                    Fast Pan‑India Shipping
                  </span>
                  <span className="text-[10px] uppercase tracking-widest px-4 py-2 bg-emerald-50 text-emerald-800 border border-emerald-100">
                    Secure Checkout
                  </span>
                </div>
                <p className="mt-6 text-[11px] text-slate-500 leading-relaxed max-w-2xl border-t border-emerald-100 pt-4">
                  <span className="font-bold text-slate-700">Brand disclaimer:</span>{' '}
                  Decume is an independent perfume decanting service and is not
                  affiliated with, endorsed by, sponsored by, or officially
                  connected to {product.brand}. The trademark &ldquo;
                  {product.brand}&rdquo; is the property of its owner and is
                  used here only to identify the original fragrance from which
                  this decant is poured. The vial, label, and packaging are
                  produced by Decume and are not the brand&rsquo;s official
                  packaging.{' '}
                  <Link
                    href="/authenticity"
                    className="text-emerald-700 underline underline-offset-2 hover:text-emerald-800 font-medium"
                  >
                    Read our Authenticity &amp; Sourcing policy
                  </Link>
                  .
                </p>
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
                <div className="mt-6">
                  <PriceTag
                    originalPrice={variantOriginalPrice}
                    salePrice={variantSalePrice}
                    discountPercent={variantDiscountPercent}
                    size="lg"
                  />
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
