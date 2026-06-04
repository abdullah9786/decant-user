"use client";

import React, { useMemo, useCallback, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/store/useCartStore';
import toast from 'react-hot-toast';
import { ChipList, type ProductChip } from '@/components/ui/Chip';
import { isProductOutOfStock, isVariantInStock } from '@/lib/product/stock';
import { variantButtonLabel } from '@/lib/product/variantLabel';

interface Variant {
  size_ml: number;
  price: number;
  is_pack?: boolean;
  stock?: number;
  label?: string | null;
}

interface ProductCardProps {
  id?: string;
  _id?: string;
  slug?: string;
  name: string;
  brand: string;
  variants?: Variant[];
  /**
   * Shared decant pool at the product level (in ml). A decant variant is
   * available iff this pool is at least as large as its `size_ml`. Pack
   * variants ignore this and use their own integer `stock` count.
   */
  stock_ml?: number;
  image_url?: string;
  is_featured?: boolean;
  is_new_arrival?: boolean;
  notes_top?: string[];
  notes_middle?: string[];
  notes_base?: string[];
  chips?: ProductChip[];
  priceMode?: 'default' | 'pack';
}

const TOAST_STYLE = {
  borderRadius: '10px',
  background: '#022c22',
  color: '#fff',
  fontSize: '12px',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.1em',
};

function variantKey(v: Variant): string {
  return `${v.is_pack ? 'pack' : 'decant'}-${v.size_ml}`;
}

function variantsMatch(a: Variant, b: Variant): boolean {
  return a.size_ml === b.size_ml && !!a.is_pack === !!b.is_pack;
}

const ProductCard = React.memo(({
  id, _id, slug, name, brand, variants, stock_ml, image_url, is_featured, is_new_arrival,
  notes_top = [], notes_middle = [], notes_base = [], chips = [], priceMode = 'default',
}: ProductCardProps) => {
  const productId = id || _id;
  const productSlug = slug || productId;
  const availableMl = stock_ml ?? 0;

  const decantVariants = useMemo(
    () =>
      (variants ?? [])
        .filter((v) => !v.is_pack)
        .sort((a, b) => a.size_ml - b.size_ml),
    [variants],
  );

  const packVariants = useMemo(
    () =>
      (variants ?? [])
        .filter((v) => v.is_pack)
        .sort((a, b) => a.size_ml - b.size_ml),
    [variants],
  );

  /** Decant pills when any decants exist; else pack pills when pack-only (even a single option). */
  const pickerVariants = useMemo((): Variant[] | null => {
    if (decantVariants.length >= 1) return decantVariants;
    if (packVariants.length >= 1) return packVariants;
    return null;
  }, [decantVariants, packVariants]);

  const initialPickerVariant = useMemo(() => {
    if (!pickerVariants) return null;
    const inStock = pickerVariants.find((v) => isVariantInStock(v, availableMl));
    return inStock ?? pickerVariants[0];
  }, [pickerVariants, availableMl]);

  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const activePickerVariant = selectedVariant ?? initialPickerVariant;

  const showSizePicker = pickerVariants !== null;

  const { defaultVariant, hasDecant, hasPack, isOutOfStock } = useMemo(() => {
    const inStockVariants = (variants ?? []).filter((v) =>
      isVariantInStock(v, availableMl),
    );
    const pool = inStockVariants.length > 0 ? inStockVariants : variants ?? [];
    const def = pool.length > 0
      ? pool.reduce((m, v) => (v.price < m.price ? v : m), pool[0])
      : null;
    return {
      defaultVariant: def,
      hasDecant: variants?.some((v) => !v.is_pack),
      hasPack: variants?.some((v) => v.is_pack),
      isOutOfStock: isProductOutOfStock({ variants, stock_ml }),
    };
  }, [variants, stock_ml, availableMl]);

  const singlePackVariant = useMemo(() => {
    if (packVariants.length === 1) return packVariants[0];
    return packVariants.find((v) => isVariantInStock(v, availableMl)) ?? packVariants[0] ?? null;
  }, [packVariants, availableMl]);

  const activeVariant = useMemo(() => {
    if (showSizePicker && activePickerVariant) return activePickerVariant;
    if (priceMode === 'pack') return singlePackVariant ?? defaultVariant;
    return defaultVariant;
  }, [showSizePicker, activePickerVariant, priceMode, singlePackVariant, defaultVariant]);

  const activeVariantOutOfStock = activeVariant
    ? !isVariantInStock(activeVariant, availableMl)
    : true;

  const priceNode = useMemo(() => {
    if (activeVariant) return <>₹{activeVariant.price}</>;
    return <>₹0</>;
  }, [activeVariant]);

  const allNotes = useMemo(
    () => [...(notes_top || []), ...(notes_middle || []), ...(notes_base || [])].slice(0, 3),
    [notes_top, notes_middle, notes_base],
  );

  const addItem = useCartStore((s) => s.addItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  const quantityInCart = useCartStore(
    useCallback(
      (s) => {
        if (!activeVariant) return 0;
        const match = s.items.find(
          (item) =>
            item.id === (productId as string) &&
            item.size_ml === activeVariant.size_ml &&
            !!item.is_pack === !!activeVariant.is_pack,
        );
        return match?.quantity || 0;
      },
      [productId, activeVariant],
    ),
  );

  const stopNav = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    stopNav(e);

    if (!activeVariant) {
      toast.error('No sizes available');
      return;
    }

    addItem({
      id: productId as string,
      name,
      brand,
      size_ml: activeVariant.size_ml,
      price: activeVariant.price,
      quantity: 1,
      image_url,
      is_pack: !!activeVariant.is_pack,
    });

    toast.success(`${name} (${variantButtonLabel(activeVariant)}) added to bag!`, {
      icon: '✨',
      style: TOAST_STYLE,
    });
  };

  const handleDecrement = (e: React.MouseEvent) => {
    stopNav(e);
    if (!activeVariant) return;

    if (quantityInCart > 1) {
      updateQuantity(
        productId as string,
        activeVariant.size_ml,
        quantityInCart - 1,
        activeVariant.is_pack,
      );
    } else {
      removeItem(productId as string, activeVariant.size_ml, activeVariant.is_pack);
    }
  };

  const handleIncrement = (e: React.MouseEvent) => {
    stopNav(e);
    if (!activeVariant) return;
    updateQuantity(
      productId as string,
      activeVariant.size_ml,
      quantityInCart + 1,
      activeVariant.is_pack,
    );
  };

  const handleSelectVariant = (e: React.MouseEvent, variant: Variant) => {
    stopNav(e);
    setSelectedVariant(variant);
  };

  return (
    <Link
      href={`/products/${productSlug}`}
      className="group block w-full relative sm:cursor-pointer overflow-hidden rounded-[20px] border border-emerald-900/10 bg-white hover:border-emerald-900/30 hover:shadow-md transition-shadow duration-300 flex flex-col h-full"
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#F4F4F4] border-b border-emerald-900/10 shrink-0">
        <div className="absolute top-2.5 left-2.5 z-20 flex flex-col gap-1.5">
          {isOutOfStock ? (
            <span className="bg-rose-600 text-white px-3 py-1 text-[8px] font-bold uppercase tracking-widest rounded-full shadow-sm w-max">
              Out of Stock
            </span>
          ) : (
            <>
              {is_new_arrival && (
                <span className="bg-white/95 text-emerald-950 px-3 py-1 text-[8px] font-bold uppercase tracking-widest rounded-full shadow-sm w-max border border-emerald-50">
                  New Arrival
                </span>
              )}
              {is_featured && !is_new_arrival && (
                <span className="bg-emerald-950 text-white px-3 py-1 text-[8px] font-bold uppercase tracking-widest rounded-full shadow-sm w-max">
                  Featured
                </span>
              )}
            </>
          )}
        </div>

        {chips && chips.length > 0 && (
          <div className="absolute top-2.5 right-2.5 z-20 max-w-[65%]">
            <ChipList chips={chips} max={2} size="xs" align="end" />
          </div>
        )}

        {image_url ? (
          <Image
            src={image_url}
            alt={name}
            fill
            sizes="(max-width: 1024px) 50vw, 25vw"
            className={`object-cover transition-transform duration-[1.5s] ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-[1.03] ${isOutOfStock ? 'opacity-60 grayscale' : ''}`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center font-serif text-slate-300 italic text-sm">
            [ Fragrance Image ]
          </div>
        )}

        {allNotes.length > 0 && (
          <div className="absolute inset-x-0 bottom-0 p-3 pt-12 bg-gradient-to-t from-emerald-950/60 to-transparent z-10 pointer-events-none">
            <div className="flex flex-wrap gap-1.5 justify-center">
              {allNotes.map((note, idx) => (
                <span
                  key={idx}
                  className="bg-black/30 text-white border border-white/15 px-2 py-0.5 text-[8px] uppercase tracking-widest rounded-full flex items-center"
                >
                  {note}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="p-3 md:p-5 flex flex-col flex-1 min-h-0">
        <div className="shrink-0">
          <p className="text-[11px] uppercase tracking-wider text-emerald-950 font-bold mb-1 leading-tight line-clamp-1">
            {brand}
          </p>
          <h3 className="font-serif text-[15px] md:text-[17px] text-emerald-950 leading-snug line-clamp-1 transition-colors group-hover:text-emerald-700 mb-1.5">
            {name}
          </h3>
          <p className="text-[13px] font-medium text-emerald-950 whitespace-nowrap">
            {priceNode}
          </p>
          <p className="text-[9px] uppercase tracking-widest text-slate-400 font-medium mt-0.5">
            {hasDecant && hasPack ? 'Decant · Sealed Bottle' : hasDecant ? 'Decant' : 'Sealed Bottle'}
          </p>
        </div>

        <div className="flex-1 min-h-[2.75rem]">
          {showSizePicker && pickerVariants && (
            <div className="mt-2.5 -mx-1 md:mx-0 carousel-clip" onClick={stopNav}>
              <div className="carousel-scroll flex gap-1.5 flex-nowrap pb-3 -mb-3 md:pb-2 md:-mb-2">
                {pickerVariants.map((v) => {
                  const outOfStock = !isVariantInStock(v, availableMl);
                  const isSelected = activePickerVariant
                    ? variantsMatch(activePickerVariant, v)
                    : false;
                  return (
                    <button
                      key={variantKey(v)}
                      type="button"
                      aria-pressed={isSelected}
                      title={outOfStock ? 'Currently out of stock' : undefined}
                      onClick={(e) => handleSelectVariant(e, v)}
                      className={`shrink-0 min-w-[42px] px-2 py-1 text-[8px] font-bold uppercase tracking-wide border rounded-md transition-all ${
                        outOfStock
                          ? isSelected
                            ? 'bg-gray-100 text-gray-500 border-emerald-700 ring-1 ring-emerald-700/30'
                            : 'bg-gray-50 text-gray-400 border-gray-200'
                          : isSelected
                            ? 'bg-emerald-950 text-white border-emerald-950 shadow-sm'
                            : 'border-gray-200 text-gray-500 hover:border-emerald-600 hover:text-emerald-950'
                      }`}
                    >
                      <span className={outOfStock ? 'line-through opacity-80' : ''}>
                        {variantButtonLabel(v)}
                      </span>
                      {outOfStock && <span className="ml-0.5 normal-case">(Out)</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="w-full mt-3 shrink-0" onClick={stopNav}>
          {quantityInCart > 0 ? (
            <div className="flex flex-row items-center justify-between border border-emerald-950 rounded-md bg-transparent w-full text-emerald-950 h-[42px]">
              <button
                onClick={handleDecrement}
                className="w-10 h-full flex items-center justify-center hover:bg-emerald-50 transition-colors text-lg"
                aria-label="Decrease quantity"
              >
                -
              </button>
              <span className="text-[13px] font-bold w-12 text-center select-none">{quantityInCart}</span>
              <button
                onClick={handleIncrement}
                className="w-10 h-full flex items-center justify-center hover:bg-emerald-50 transition-colors text-lg"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
          ) : isOutOfStock || activeVariantOutOfStock ? (
            <button
              type="button"
              disabled
              aria-disabled="true"
              className="w-full text-center py-0 h-[42px] text-[10px] font-bold uppercase tracking-widest border border-gray-200 text-gray-400 bg-gray-50 rounded-md cursor-not-allowed"
            >
              Sold Out
            </button>
          ) : (
            <button
              onClick={handleQuickAdd}
              className="w-full text-center py-0 h-[42px] text-[10px] font-bold uppercase tracking-widest border border-emerald-950 text-emerald-950 bg-transparent rounded-md hover:bg-emerald-50 transition-colors cursor-pointer"
            >
              Add to Cart
            </button>
          )}
        </div>
      </div>
    </Link>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;
