"use client";

import React, { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Trash2, ShoppingBag, ArrowRight, Minus, Plus } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';

export const dynamic = 'force-dynamic';

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice } = useCartStore();
  const subtotal = totalPrice();
  const shippingFee = subtotal > 999 ? 0 : 90;
  const freeDeliveryThreshold = 999;
  const amountToFreeDelivery = Math.max(0, freeDeliveryThreshold + 1 - subtotal);
  const grandTotal = subtotal + shippingFee;

  if (items.length === 0) {
    return (
      <div className="py-32 text-center">
        <ShoppingBag size={64} className="mx-auto text-gray-200 mb-8" />
        <h2 className="text-3xl font-serif text-emerald-950 mb-4">Your cart is empty</h2>
        <p className="text-gray-500 mb-10 uppercase tracking-widest text-xs">Discover your signature scent today.</p>
        <Link href="/products" className="inline-block bg-emerald-950 text-white px-10 py-4 text-xs font-bold uppercase tracking-widest hover:bg-black transition-all">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-serif text-emerald-950 mb-12">Your Shopping Bag</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-8">
            {items.map((item, idx) => (
              <div key={item.gift_box_id ? `gb-${item.gift_box_id}-${idx}` : `${item.id}-${item.size_ml}-${item.is_pack ? 'p' : 'd'}-${item.bottle_id || ''}`} className="flex items-start space-x-6 border-b border-gray-100 pb-8">
                <div className="w-24 h-32 bg-gray-50 flex-shrink-0 relative border border-gray-100 overflow-hidden">
                  {item.image_url ? (
                    <Image src={item.image_url} alt={item.name} fill sizes="96px" className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center italic text-gray-200 text-[10px]">Image</div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">{item.gift_box_id ? 'Gift Box' : item.brand}</p>
                  <h3 className="font-serif text-xl text-emerald-950 mb-1">{item.name}</h3>
                  <p className="text-xs text-emerald-600 font-bold mb-2">
                    {item.gift_box_id
                      ? `${item.selected_products?.length || 0} × ${item.size_ml}ML`
                      : `${item.size_ml}ML ${item.is_pack ? 'Pack' : 'Decant'}${item.bottle_name ? ` · ${item.bottle_name}` : ''}`}
                  </p>

                  {item.gift_box_id && item.selected_products && (
                    <div className="mb-3 space-y-1 pl-2 border-l-2 border-emerald-200">
                      {item.selected_products.map((sp: any, i: number) => (
                        <div key={i} className="flex justify-between text-[10px] text-gray-500">
                          <span className="truncate max-w-[180px]">{sp.name}</span>
                          <span className="font-bold text-gray-600 ml-2">₹{sp.price}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center border border-gray-200">
                      <button 
                        onClick={() => updateQuantity(item.id, item.size_ml, Math.max(1, item.quantity - 1), item.is_pack, item.gift_box_id, item.selected_products, item.bottle_id)}
                        className="p-2 hover:bg-gray-50 transition-colors"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-10 text-center text-xs font-bold">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.size_ml, item.quantity + 1, item.is_pack, item.gift_box_id, item.selected_products, item.bottle_id)}
                        className="p-2 hover:bg-gray-50 transition-colors"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <button 
                      onClick={() => removeItem(item.id, item.size_ml, item.is_pack, item.gift_box_id, item.selected_products, item.bottle_id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-emerald-950">₹{item.price * item.quantity}</p>
                  <p className="text-[10px] text-gray-400 mt-1">₹{item.price} each</p>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="h-fit sticky top-32 space-y-6">
            <div className="bg-gray-50 p-10 border border-gray-100">
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-950 mb-8 border-b border-gray-200 pb-4">Order Summary</h3>
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-sm text-gray-600 uppercase tracking-widest">
                  <span>Subtotal</span>
                  <span>₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600 uppercase tracking-widest">
                  <span>Shipping</span>
                  <span>{shippingFee === 0 ? 'FREE' : `₹${shippingFee}`}</span>
                </div>
                <div className="space-y-2">
                  {amountToFreeDelivery > 0 && (
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-800">
                        Add ₹{amountToFreeDelivery} more to unlock free delivery
                      </div>
                      <Link
                        href="/products"
                        className="inline-flex items-center justify-center px-4 py-2 text-[10px] font-bold uppercase tracking-widest bg-emerald-950 text-white rounded-full hover:bg-emerald-900 transition-colors whitespace-nowrap"
                      >
                        Add more
                      </Link>
                    </div>
                  )}
                </div>
                <div className="pt-4 border-t border-gray-200 flex justify-between text-lg font-bold text-emerald-950">
                  <span>Total</span>
                  <span>₹{grandTotal}</span>
                </div>
              </div>
              <Link 
                href="/checkout" 
                className="w-full bg-emerald-950 text-white py-5 text-sm font-bold uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center space-x-3 shadow-xl"
              >
                <span>Continue to Checkout</span>
                <ArrowRight size={18} />
              </Link>
            </div>

            <div className="relative overflow-hidden border border-emerald-100 bg-white p-6 shadow-xl">
              <div className="absolute -top-10 right-4 w-24 h-24 rounded-full bg-emerald-100/70 blur-2xl" />
              <div className="absolute -bottom-12 -left-8 w-28 h-28 rounded-full bg-emerald-200/60 blur-2xl" />
              <div className="relative space-y-4">
                <div className="text-[10px] uppercase tracking-[0.3em] text-emerald-700 font-bold">
                  Coupon truth
                </div>
                <div className="text-xl font-serif text-emerald-950 leading-snug">
                  Looking for a coupon?
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  We don’t do inflated prices just to “discount” them. The price you see is genuine from the start.
                </p>
                <div className="text-[10px] uppercase tracking-widest text-emerald-700 font-bold">
                  No fake markdowns. No coupon bait.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
