"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, X, Gift, Check, ShoppingBag, ArrowLeft } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { toast } from "react-hot-toast";

interface SelectedProduct {
  product_id: string;
  name: string;
  brand: string;
  image_url: string;
  size_ml: number;
  price: number;
}

export default function BuilderClient({
  box,
  allProducts,
}: {
  box: any;
  allProducts: any[];
}) {
  const boxId = box.id || box._id;
  const [slots, setSlots] = useState<(SelectedProduct | null)[]>(
    Array(box.slot_count).fill(null)
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [brandFilter, setBrandFilter] = useState("");
  const addItem = useCartStore((s) => s.addItem);

  const eligibleProducts = useMemo(() => {
    return allProducts.filter((p: any) => {
      if (!p.is_active && p.is_active !== undefined) return false;
      const hasVariant = (p.variants || []).some(
        (v: any) => v.size_ml === box.size_ml && !v.is_pack
      );
      return hasVariant;
    });
  }, [allProducts, box.size_ml]);

  const brands = useMemo(() => {
    const set = new Set(eligibleProducts.map((p: any) => p.brand));
    return Array.from(set).sort();
  }, [eligibleProducts]);

  const filtered = useMemo(() => {
    return eligibleProducts.filter((p: any) => {
      if (brandFilter && p.brand !== brandFilter) return false;
      if (
        searchTerm &&
        !p.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !p.brand.toLowerCase().includes(searchTerm.toLowerCase())
      )
        return false;
      return true;
    });
  }, [eligibleProducts, searchTerm, brandFilter]);

  const selectedCounts = new Map<string, number>();
  slots.filter(Boolean).forEach((s) => {
    selectedCounts.set(s!.product_id, (selectedCounts.get(s!.product_id) || 0) + 1);
  });
  const filledCount = slots.filter(Boolean).length;
  const allFilled = filledCount === box.slot_count;

  const fragranceTotal = slots.reduce(
    (sum, s) => sum + (s?.price || 0),
    0
  );
  const grandTotal = box.box_price + fragranceTotal;

  function handleSelect(product: any) {
    const nextEmpty = slots.findIndex((s) => s === null);
    if (nextEmpty === -1) return;
    const variant = (product.variants || []).find(
      (v: any) => v.size_ml === box.size_ml && !v.is_pack
    );
    if (!variant) return;
    const updated = [...slots];
    updated[nextEmpty] = {
      product_id: product.id || product._id,
      name: product.name,
      brand: product.brand,
      image_url: product.image_url || "",
      size_ml: variant.size_ml,
      price: variant.price,
    };
    setSlots(updated);
  }

  function handleRemoveSlot(index: number) {
    const updated = [...slots];
    updated[index] = null;
    setSlots(updated);
  }

  function handleAddToCart() {
    if (!allFilled) return;
    const selected = slots.filter(Boolean) as SelectedProduct[];
    addItem({
      id: boxId,
      name: box.name,
      brand: "Gift Box",
      size_ml: box.size_ml,
      price: grandTotal,
      quantity: 1,
      image_url: box.image_url || "",
      is_pack: false,
      gift_box_id: boxId,
      gift_box_name: box.name,
      selected_products: selected.map((s) => ({
        product_id: s.product_id,
        name: s.name,
        size_ml: s.size_ml,
        price: s.price,
      })),
    } as any);
    toast.success(`${box.name} added to bag!`, {
      icon: "🎁",
      style: {
        borderRadius: "10px",
        background: "#022c22",
        color: "#fff",
        fontSize: "12px",
        textTransform: "uppercase",
        letterSpacing: "0.1em",
      },
    });
  }

  const boxImages = [box.image_url, ...(box.images || [])].filter(Boolean);

  return (
    <div className="py-12 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/gift-boxes"
          className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-emerald-600 transition-colors mb-8"
        >
          <ArrowLeft size={14} />
          <span>All Gift Boxes</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-12">
          {/* Left: Box summary */}
          <div className="space-y-6">
            <div className="sticky top-28 space-y-6">
              {/* Box image */}
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-50 border border-gray-100">
                {boxImages[0] ? (
                  <Image
                    src={boxImages[0]}
                    alt={box.name}
                    fill
                    sizes="380px"
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Gift size={64} className="text-gray-200" />
                  </div>
                )}
                {box.tier === "premium" && (
                  <div className="absolute top-3 left-3 bg-amber-500 text-white text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                    Premium
                  </div>
                )}
              </div>

              {/* Box info */}
              <div>
                <h1 className="text-2xl font-serif text-emerald-950 mb-1">
                  {box.name}
                </h1>
                <p className="text-xs text-gray-400 uppercase tracking-widest">
                  {box.slot_count} Fragrances &middot; {box.size_ml}ml each
                </p>
                {box.description && (
                  <p className="text-sm text-gray-500 mt-3">
                    {box.description}
                  </p>
                )}
              </div>

              {/* Slots */}
              <div className="space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-900">
                  Your Selections ({filledCount}/{box.slot_count})
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {slots.map((slot, i) => (
                    <div
                      key={i}
                      className={`relative rounded-xl border-2 border-dashed p-3 transition-all ${
                        slot
                          ? "border-emerald-300 bg-emerald-50/50"
                          : "border-gray-200 bg-gray-50"
                      }`}
                    >
                      {slot ? (
                        <div className="flex items-start space-x-2">
                          <div className="w-10 h-10 rounded-lg bg-white border border-gray-100 overflow-hidden flex-shrink-0 relative">
                            {slot.image_url ? (
                              <Image
                                src={slot.image_url}
                                alt={slot.name}
                                fill
                                sizes="40px"
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[8px] text-gray-300">
                                IMG
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-bold text-emerald-950 truncate">
                              {slot.name}
                            </p>
                            <p className="text-[9px] text-gray-400 uppercase">
                              {slot.brand}
                            </p>
                            <p className="text-[10px] font-bold text-emerald-600">
                              ₹{slot.price}
                            </p>
                          </div>
                          <button
                            onClick={() => handleRemoveSlot(i)}
                            className="absolute top-1 right-1 p-0.5 text-gray-300 hover:text-red-500 transition-colors"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ) : (
                        <div className="h-10 flex items-center justify-center">
                          <span className="text-[10px] text-gray-300 uppercase tracking-widest">
                            Slot {i + 1}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Price breakdown */}
              <div className="bg-gray-50 rounded-xl p-5 space-y-3 border border-gray-100">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Box</span>
                  <span className="font-bold">₹{box.box_price}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>
                    Fragrances ({filledCount}/{box.slot_count})
                  </span>
                  <span className="font-bold">₹{fragranceTotal}</span>
                </div>
                <div className="pt-3 border-t border-gray-200 flex justify-between text-lg font-bold text-emerald-950">
                  <span>Total</span>
                  <span>₹{grandTotal}</span>
                </div>
              </div>

              {/* Add to cart */}
              <button
                onClick={handleAddToCart}
                disabled={!allFilled || box.stock < 1}
                className="w-full bg-emerald-950 text-white py-5 text-[10px] font-bold uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center space-x-3 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingBag size={18} />
                <span>
                  {box.stock < 1
                    ? "Out of Stock"
                    : allFilled
                    ? "Add to Cart"
                    : `Select ${box.slot_count - filledCount} more`}
                </span>
              </button>
            </div>
          </div>

          {/* Right: Product picker */}
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-serif text-emerald-950 mb-1">
                Choose Your Fragrances
              </h2>
              <p className="text-xs text-gray-400 uppercase tracking-widest">
                Pick {box.slot_count} fragrances for your box
              </p>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={16}
                />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search fragrances..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none placeholder:text-gray-400"
                />
              </div>
              <select
                value={brandFilter}
                onChange={(e) => setBrandFilter(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-600 focus:ring-2 focus:ring-emerald-500/20 outline-none"
              >
                <option value="">All Brands</option>
                {brands.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            {/* Product grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {filtered.map((product: any) => {
                const pid = product.id || product._id;
                const timesUsed = selectedCounts.get(pid) || 0;
                const variant = (product.variants || []).find(
                  (v: any) =>
                    v.size_ml === box.size_ml && !v.is_pack
                );
                const stockMl = product.stock_ml || 0;
                const mlNeededForNext = box.size_ml * (timesUsed + 1);
                const canAddMore = stockMl >= mlNeededForNext && !allFilled;
                const outOfStock = stockMl < box.size_ml;

                return (
                  <div
                    key={pid}
                    className={`relative rounded-xl border overflow-hidden transition-all ${
                      timesUsed > 0
                        ? "border-emerald-400 bg-emerald-50/50 ring-2 ring-emerald-200"
                        : "border-gray-100 bg-white hover:border-emerald-200 hover:shadow-sm"
                    }`}
                  >
                    <div className="relative aspect-square bg-gray-50 overflow-hidden">
                      {product.image_url ? (
                        <Image
                          src={product.image_url}
                          alt={product.name}
                          fill
                          sizes="200px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-200 text-[10px] italic">
                          No Image
                        </div>
                      )}
                      {timesUsed > 0 && (
                        <div className="absolute top-2 right-2 bg-emerald-600 text-white text-[10px] font-bold w-6 h-6 rounded-full flex items-center justify-center shadow">
                          {timesUsed}
                        </div>
                      )}
                      {outOfStock && timesUsed === 0 && (
                        <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                          <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500">
                            Out of Stock
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="text-[9px] text-gray-400 uppercase tracking-widest mb-0.5">
                        {product.brand}
                      </p>
                      <p className="text-xs font-bold text-emerald-950 truncate mb-1">
                        {product.name}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-600">
                          ₹{variant?.price || 0}
                        </span>
                        <button
                          onClick={() => handleSelect(product)}
                          disabled={!canAddMore || outOfStock}
                          className="text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-emerald-950 text-white hover:bg-black"
                        >
                          {timesUsed > 0 ? `Add (${timesUsed})` : "Add"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-16">
                <p className="text-gray-400 text-sm">
                  No fragrances found matching your search.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
