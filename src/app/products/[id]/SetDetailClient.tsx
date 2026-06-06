"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, ShoppingBag, ShieldCheck, Star, Truck } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { toast } from "react-hot-toast";
import { ChipList } from "@/components/ui/Chip";
import PriceTag from "@/components/deal/PriceTag";
import { buildProductSeoCopy } from "@/lib/product/productSeo";
import { getSetDecantVariants, isSetInStock, normalizeSizeMl, sizesMatch } from "@/lib/product/setStock";
import { variantButtonLabel } from "@/lib/product/variantLabel";

interface SetDetailClientProps {
  product: any;
  bottles?: any[];
  initialSize?: number | null;
  initialBottleId?: string | null;
}

export default function SetDetailClient({
  product,
  bottles = [],
  initialSize = null,
  initialBottleId = null,
}: SetDetailClientProps) {
  const addItem = useCartStore((state) => state.addItem);
  const productId = product.id || product._id;
  const slug = product.slug || productId;
  const setItems = product.set_items ?? [];
  const decantVariants = useMemo(
    () => getSetDecantVariants(product),
    [product],
  );

  const normalizedInitialSize =
    initialSize != null ? normalizeSizeMl(initialSize) : null;

  const pickDefaultVariant = useCallback(() => {
    const firstInStock = decantVariants.find((v) =>
      isSetInStock(product, v.size_ml),
    );
    if (normalizedInitialSize != null) {
      const fromUrl = decantVariants.find((v) =>
        sizesMatch(v.size_ml, normalizedInitialSize),
      );
      if (fromUrl) return fromUrl;
    }
    return firstInStock ?? decantVariants[0] ?? null;
  }, [decantVariants, normalizedInitialSize, product]);

  const [selectedSize, setSelectedSize] = useState<number | null>(() => {
    const def = pickDefaultVariant();
    return def?.size_ml ?? null;
  });
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [sanitizedDescription, setSanitizedDescription] = useState("");
  const [selectedBottleId, setSelectedBottleId] = useState<string | null>(
    initialBottleId,
  );

  useEffect(() => {
    if (!product?.description) return;
    import("dompurify").then((mod) => {
      setSanitizedDescription(
        mod.default.sanitize(
          (product.description || "").replace(/&nbsp;|\u00A0/g, " "),
        ),
      );
    });
  }, [product?.description]);

  const currentVariant = useMemo(
    () =>
      decantVariants.find((v) => sizesMatch(v.size_ml, selectedSize)) ??
      pickDefaultVariant(),
    [decantVariants, selectedSize, pickDefaultVariant],
  );

  const selectedMl = currentVariant?.size_ml ?? 0;
  const variantOriginalPrice =
    currentVariant?.original_price ?? currentVariant?.price ?? 0;
  const variantSalePrice =
    currentVariant?.sale_price ?? currentVariant?.price ?? 0;
  const variantDiscountPercent = (currentVariant as any)?.discount_percent ?? 0;
  const inStock = selectedMl > 0 && isSetInStock(product, selectedMl);

  const productBottleIds: string[] = product.bottle_ids || [];
  const availableBottles =
    productBottleIds.length === 0
      ? []
      : bottles.filter((b: any) => {
          if (!(b.compatible_sizes || []).includes(selectedMl)) return false;
          const bid = b.id || b._id;
          return productBottleIds.includes(bid);
        });

  const selectedBottle = availableBottles.find(
    (b: any) => (b.id || b._id) === selectedBottleId,
  );
  const bottleAddon = selectedBottle?.size_prices?.[String(selectedMl)] ?? 0;

  const setItemSnapshot = useMemo(
    () =>
      setItems.map((item: any) => ({
        product_id: item.product_id,
        name: item.name || "",
        brand: item.brand || "",
        size_ml: selectedMl,
      })),
    [setItems, selectedMl],
  );

  const seoCopy = buildProductSeoCopy({
    name: product.name,
    brand: product.brand,
    variants: product.variants,
    productType: "set",
    setItemCount: setItems.length,
    matchedVariant: currentVariant
      ? {
          size_ml: currentVariant.size_ml,
          price: currentVariant.price ?? 0,
          is_pack: false,
        }
      : null,
  });

  const allImages = [product.image_url, ...(product.images || [])].filter(Boolean);
  const hasSyncedInitial = useRef(false);

  const updateUrl = useCallback(
    (size: number | null, bottleId: string | null) => {
      const params = new URLSearchParams(window.location.search);
      if (size != null && size > 0) {
        params.set("size", String(size));
      } else {
        params.delete("size");
      }
      if (bottleId) {
        params.set("bottle", bottleId);
      } else {
        params.delete("bottle");
      }
      const qs = params.toString();
      const path = qs ? `/products/${slug}?${qs}` : `/products/${slug}`;
      window.history.replaceState(null, "", path);
    },
    [slug],
  );

  useEffect(() => {
    if (availableBottles.length === 0) {
      if (selectedBottleId !== null) setSelectedBottleId(null);
      if (!hasSyncedInitial.current) {
        hasSyncedInitial.current = true;
        updateUrl(selectedSize, null);
      }
      return;
    }
    const current = availableBottles.find(
      (b: any) => (b.id || b._id) === selectedBottleId,
    );
    if (current) {
      if (!hasSyncedInitial.current) {
        hasSyncedInitial.current = true;
        updateUrl(selectedSize, selectedBottleId);
      }
      return;
    }
    const def = availableBottles.find((b: any) => b.is_default);
    const newId =
      (def?.id || def?._id) ??
      (availableBottles[0]?.id || availableBottles[0]?._id) ??
      null;
    setSelectedBottleId(newId);
    if (!hasSyncedInitial.current) hasSyncedInitial.current = true;
    updateUrl(selectedSize, newId);
  }, [selectedMl, availableBottles.length]);

  const selectSize = (size: number) => {
    const normalized = normalizeSizeMl(size);
    setSelectedSize(normalized);
    updateUrl(normalized, selectedBottleId);
  };

  const handleAddToCart = () => {
    if (!currentVariant || !inStock) return;
    addItem({
      id: productId,
      name: product.name,
      brand: product.brand,
      size_ml: selectedMl,
      price: variantSalePrice + bottleAddon,
      original_price: variantOriginalPrice + bottleAddon,
      discount_percent: variantDiscountPercent,
      deal_id: (currentVariant as any)?.deal_id ?? null,
      quantity: 1,
      is_pack: false,
      product_type: "set",
      set_items: setItemSnapshot,
      ...(selectedBottle && {
        bottle_id: selectedBottle.id || selectedBottle._id,
        bottle_name: selectedBottle.name,
        bottle_price: bottleAddon,
      }),
    });
    toast.success(`${product.name} (${selectedMl}ml set) added to bag!`, {
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
        <nav className="text-[10px] uppercase tracking-widest text-gray-400 mb-4 md:mb-8 flex items-center">
          <Link href="/" className="hover:text-emerald-600 transition-colors">
            Home
          </Link>
          <ChevronRight size={10} className="mx-2" />
          <Link href="/products?type=set" className="hover:text-emerald-600 transition-colors">
            Sets
          </Link>
          <ChevronRight size={10} className="mx-2" />
          <span className="text-emerald-600 font-bold">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-12 xl:gap-20 items-start">
          <div className="lg:col-span-7 lg:sticky lg:top-24 lg:self-start">
            <div className="relative aspect-[4/5] bg-gray-50 overflow-hidden mb-4">
              {allImages.map((img, i) => (
                <Image
                  key={i}
                  src={img}
                  alt={seoCopy.imageAlt}
                  fill
                  sizes="(max-width: 1024px) 100vw, 58vw"
                  className={`object-cover transition-opacity duration-500 ${
                    i === activeImageIdx ? "opacity-100" : "opacity-0"
                  }`}
                  priority={i === 0}
                />
              ))}
            </div>
            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {allImages.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActiveImageIdx(i)}
                    className={`flex-shrink-0 w-20 aspect-square relative border-2 ${
                      i === activeImageIdx ? "border-emerald-600" : "border-transparent"
                    }`}
                  >
                    <Image src={img} alt="" fill sizes="80px" className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-5 space-y-5 md:space-y-8">
            {product.chips?.length > 0 && (
              <ChipList chips={product.chips} max={5} size="md" />
            )}
            <div>
              <p className="text-xs font-bold tracking-[0.4em] uppercase text-emerald-600 mb-2">
                Curated Set
              </p>
              <h1 className="text-3xl md:text-5xl font-serif text-emerald-950 mb-2 leading-tight">
                {product.name}
              </h1>
              <p className="text-[11px] uppercase tracking-[0.25em] text-slate-500 font-medium">
                {seoCopy.formatLabel}
              </p>
            </div>

            <div className="flex items-center space-x-4">
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

            <PriceTag
              originalPrice={variantOriginalPrice + bottleAddon}
              salePrice={variantSalePrice + bottleAddon}
              discountPercent={variantDiscountPercent}
              size="lg"
            />

            {decantVariants.length > 0 && (
              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-900 block">
                  Select Set Size (ML)
                </label>
                <div className="flex flex-wrap gap-2">
                  {decantVariants.map((v) => {
                    const outOfStock = !isSetInStock(product, v.size_ml);
                    const isSelected = sizesMatch(selectedSize, v.size_ml);
                    return (
                      <button
                        key={v.size_ml}
                        type="button"
                        onClick={() => selectSize(v.size_ml)}
                        className={`min-w-[72px] py-2.5 px-4 text-[10px] font-bold border transition-all ${
                          outOfStock
                            ? isSelected
                              ? "bg-gray-100 text-gray-500 border-emerald-700 ring-2 ring-emerald-700/30"
                              : "bg-gray-50 text-gray-400 border-gray-200"
                            : isSelected
                              ? "bg-emerald-950 text-white border-emerald-950"
                              : "border-gray-200 text-gray-500 hover:border-emerald-600"
                        }`}
                      >
                        <span className={outOfStock ? "line-through opacity-80" : ""}>
                          {variantButtonLabel(v)}
                        </span>
                        {outOfStock && <span className="ml-1">(Out)</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {availableBottles.length > 0 && (
              <div className="space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-900">
                  Choose Your Bottle
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {availableBottles.map((b: any) => {
                    const bid = b.id || b._id;
                    const isSelected = selectedBottleId === bid;
                    const addon = b.size_prices?.[String(selectedMl)] ?? 0;
                    return (
                      <button
                        key={bid}
                        type="button"
                        onClick={() => {
                          setSelectedBottleId(bid);
                          updateUrl(selectedSize, bid);
                        }}
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
                            {addon > 0 ? `+₹${addon}` : "+₹0"}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={handleAddToCart}
              disabled={!currentVariant || !inStock}
              className="w-full bg-emerald-950 text-white py-4 md:py-6 text-[10px] font-bold uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center space-x-3 shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingBag size={18} />
              <span>{inStock ? "Add to Cart" : "Out of Stock"}</span>
            </button>

            {setItems.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <h2 className="text-sm font-bold uppercase tracking-widest text-emerald-950">
                  Included Fragrances
                </h2>
                <p className="text-xs text-gray-500">
                  Each fragrance in this {selectedMl}ml set:
                </p>
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  {setItems.map((item: any, index: number) => (
                    <Link
                      key={`${item.product_id}-${index}`}
                      href={`/products/${item.slug || item.product_id}`}
                      className="flex flex-col items-center text-center gap-2 p-2.5 sm:flex-row sm:items-center sm:text-left sm:gap-3 sm:p-3 rounded-xl border border-gray-100 hover:border-emerald-200 transition-colors"
                    >
                      {item.image_url && (
                        <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0">
                          <Image
                            src={item.image_url}
                            alt={item.name}
                            fill
                            sizes="(max-width: 640px) 48px, 56px"
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div className="min-w-0 w-full">
                        <p className="text-[9px] sm:text-[10px] uppercase tracking-widest text-emerald-600 truncate">
                          {item.brand}
                        </p>
                        <p className="text-xs sm:text-sm font-serif text-emerald-950 truncate">
                          {item.name}
                        </p>
                        <p className="text-[9px] sm:text-[10px] text-gray-400">{selectedMl}ml</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {sanitizedDescription && (
              <div
                className="prose prose-sm max-w-none text-gray-600 pt-4 border-t border-gray-100"
                dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
              />
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center space-x-2 p-3 bg-gray-50/50 rounded-lg">
                <Truck size={18} className="text-emerald-600" />
                <span className="text-[9px] font-bold uppercase tracking-widest">
                  Fast pan-india shipping
                </span>
              </div>
              <div className="flex items-center space-x-2 p-3 bg-gray-50/50 rounded-lg">
                <ShieldCheck size={18} className="text-emerald-600" />
                <span className="text-[9px] font-bold uppercase tracking-widest">
                  Secure Payment
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
