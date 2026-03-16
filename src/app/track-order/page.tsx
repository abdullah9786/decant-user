"use client";

import React, { useState, useEffect } from 'react';
import { orderApi } from '@/lib/api';
import { Loader2, PackageSearch } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<any>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const initialId = searchParams.get('orderId');
    if (initialId) {
      setOrderId(initialId);
      handleTrackWithId(initialId);
    }
  }, [searchParams]);

  const handleTrackWithId = async (id: string) => {
    setLoading(true);
    setError(null);
    setOrder(null);
    try {
      const response = await orderApi.track(id.trim());
      setOrder(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Order not found');
    } finally {
      setLoading(false);
    }
  };

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleTrackWithId(orderId);
  };

  return (
    <div className="py-20 bg-white min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-serif text-emerald-950 mb-4">Track Your Order</h1>
          <p className="text-gray-500 uppercase tracking-widest text-xs">Enter your order ID to see the latest status</p>
        </div>

        <form onSubmit={handleTrack} className="bg-gray-50 border border-gray-100 p-8 shadow-sm">
          <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Order ID</label>
          <div className="flex flex-col sm:flex-row gap-4 mt-3">
            <input
              type="text"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="e.g. 65f1e2c4a9..."
              className="flex-1 bg-white border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-emerald-600"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-emerald-950 text-white px-8 py-3 text-xs font-bold uppercase tracking-widest hover:bg-black transition-all disabled:opacity-60"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : 'Track'}
            </button>
          </div>
          {error && (
            <div className="mt-4 text-red-500 text-xs font-bold uppercase tracking-widest">{error}</div>
          )}
        </form>

        {order && (
          <div className="mt-12 border border-gray-100 bg-white p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-gray-400">Order ID</p>
                <p className="text-lg font-bold text-emerald-950">{order.id || order._id}</p>
              </div>
              <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest bg-emerald-50 text-emerald-600">
                {order.status}
              </span>
            </div>

            <div className="text-sm text-gray-500 mb-6">
              {order.customer_name ? `Customer: ${order.customer_name} • ` : ''}
              Placed on {new Date(order.created_at).toLocaleDateString()}
            </div>

            <div className="border-t border-gray-100 pt-6">
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Items</h3>
              <div className="space-y-3">
                {order.items?.map((item: any, i: number) => (
                  <div key={i} className="flex justify-between text-sm text-gray-700">
                    <span>{item.name} • {item.size_ml}ml × {item.quantity}</span>
                    <span className="font-bold text-emerald-950">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between text-sm font-bold text-emerald-950">
                <span>Total</span>
                <span>₹{order.total_amount}</span>
              </div>
            </div>
          </div>
        )}

        {!order && !loading && !error && (
          <div className="mt-12 text-center text-gray-400 text-sm italic flex items-center justify-center space-x-2">
            <PackageSearch size={18} />
            <span>Enter your order ID above to track your order.</span>
          </div>
        )}
      </div>
    </div>
  );
}
