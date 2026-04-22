"use client";

import React, { useState } from 'react';
import { Search, Gift, Plus, Minus } from 'lucide-react';
import type { FreeDecantItem } from '@/store/useCartStore';

interface EligibleProduct {
  _id?: string;
  id?: string;
  name: string;
  brand: string;
  image_url?: string;
}

interface FreeDecantPickerProps {
  entitledCount: number;
  selectedDecants: FreeDecantItem[];
  eligibleProducts: EligibleProduct[];
  freeSizeMl: number;
  offerId: string;
  onSelect: (item: FreeDecantItem) => void;
  onRemove: (productId: string) => void;
}

export default function FreeDecantPicker({
  entitledCount,
  selectedDecants,
  eligibleProducts,
  freeSizeMl,
  offerId,
  onSelect,
  onRemove,
}: FreeDecantPickerProps) {
  const [search, setSearch] = useState('');
  const selectedCount = selectedDecants.length;
  const canSelectMore = selectedCount < entitledCount;

  const filteredProducts = eligibleProducts.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.brand.toLowerCase().includes(search.toLowerCase())
  );

  const getId = (p: EligibleProduct) => p._id || p.id || '';

  const getCount = (productId: string) =>
    selectedDecants.filter(d => d.product_id === productId).length;

  const handleAdd = (product: EligibleProduct) => {
    if (!canSelectMore) return;
    onSelect({
      product_id: getId(product),
      name: product.name,
      brand: product.brand,
      image_url: product.image_url,
      size_ml: freeSizeMl,
      offer_id: offerId,
    });
  };

  const handleRemove = (product: EligibleProduct) => {
    onRemove(getId(product));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Gift size={18} className="text-amber-500" />
          <h3 className="font-semibold text-slate-900 text-sm">
            Pick your FREE {freeSizeMl}ml decant{entitledCount > 1 ? 's' : ''}
          </h3>
        </div>
        <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
          {selectedCount} of {entitledCount} selected
        </span>
      </div>

      {eligibleProducts.length > 6 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search fragrances..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-amber-500/20 placeholder:text-slate-400"
          />
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-72 overflow-y-auto pr-1">
        {filteredProducts.map(product => {
          const pid = getId(product);
          const count = getCount(pid);
          const isSelected = count > 0;
          return (
            <div
              key={pid}
              className={`relative flex flex-col items-center p-3 rounded-xl border-2 text-center transition-all ${
                isSelected
                  ? 'border-amber-400 bg-amber-50 shadow-sm'
                  : 'border-slate-200 bg-white'
              }`}
            >
              <div className="w-14 h-14 rounded-lg bg-slate-100 overflow-hidden mb-2 flex-shrink-0">
                {product.image_url ? (
                  <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300 text-[8px]">IMG</div>
                )}
              </div>
              <p className="text-xs font-semibold text-slate-900 leading-tight line-clamp-2">{product.name}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{product.brand}</p>
              <p className="text-[10px] font-bold text-amber-600 mt-1">FREE {freeSizeMl}ml</p>

              <div className="flex items-center justify-center space-x-2 mt-2">
                <button
                  type="button"
                  onClick={() => handleRemove(product)}
                  disabled={count === 0}
                  className="w-6 h-6 flex items-center justify-center rounded-full border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-300 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Minus size={12} />
                </button>
                <span className={`text-sm font-bold w-5 text-center ${count > 0 ? 'text-amber-700' : 'text-slate-300'}`}>
                  {count}
                </span>
                <button
                  type="button"
                  onClick={() => handleAdd(product)}
                  disabled={!canSelectMore}
                  className="w-6 h-6 flex items-center justify-center rounded-full border border-slate-200 text-slate-400 hover:text-amber-600 hover:border-amber-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Plus size={12} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredProducts.length === 0 && (
        <p className="text-center text-sm text-slate-400 py-6">No eligible products found.</p>
      )}
    </div>
  );
}
