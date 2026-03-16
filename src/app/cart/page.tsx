"use client";

import React from 'react';
import Link from 'next/link';
import { Trash2, ShoppingBag, ArrowRight, Minus, Plus } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice } = useCartStore();

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
            {items.map((item) => (
              <div key={`${item.id}-${item.size_ml}`} className="flex items-center space-x-6 border-b border-gray-100 pb-8">
                <div className="w-24 h-32 bg-gray-50 flex-shrink-0 flex items-center justify-center italic text-gray-200 text-[10px] border border-gray-100">
                  Image
                </div>
                <div className="flex-1">
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">{item.brand}</p>
                  <h3 className="font-serif text-xl text-emerald-950 mb-1">{item.name}</h3>
                  <p className="text-xs text-emerald-600 font-bold mb-4">{item.size_ml}ML Decant</p>
                  
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center border border-gray-200">
                      <button 
                        onClick={() => updateQuantity(item.id, item.size_ml, Math.max(1, item.quantity - 1))}
                        className="p-2 hover:bg-gray-50 transition-colors"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-10 text-center text-xs font-bold">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.size_ml, item.quantity + 1)}
                        className="p-2 hover:bg-gray-50 transition-colors"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <button 
                      onClick={() => removeItem(item.id, item.size_ml)}
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
          <div className="bg-gray-50 p-10 h-fit sticky top-32 border border-gray-100">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-950 mb-8 border-b border-gray-200 pb-4">Order Summary</h3>
            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-sm text-gray-600 uppercase tracking-widest">
                <span>Subtotal</span>
                <span>₹{totalPrice()}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600 uppercase tracking-widest">
                <span>Shipping</span>
                <span>FREE</span>
              </div>
              <div className="pt-4 border-t border-gray-200 flex justify-between text-lg font-bold text-emerald-950">
                <span>Total</span>
                <span>₹{totalPrice()}</span>
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
        </div>
      </div>
    </div>
  );
}
