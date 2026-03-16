"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Package, ChevronRight, Loader2, Copy, RefreshCw } from 'lucide-react';
import { orderApi } from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'react-hot-toast';

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    const fetchOrders = async () => {
      if (!isAuthenticated) return;
      try {
        const response = await orderApi.getUserOrders(user?.id || (user as any)?._id);
        setOrders(response.data);
      } catch (err) {
        console.error("Error fetching orders", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [isAuthenticated]);

  const handleSyncOrders = async () => {
    setSyncing(true);
    try {
      await orderApi.syncGuestOrders();
      const response = await orderApi.getUserOrders(user?.id || (user as any)?._id);
      setOrders(response.data);
      toast.success('Orders synced', {
        duration: 1500,
        style: {
          background: '#1e1b4b',
          color: '#fff',
          fontSize: '10px',
          fontWeight: 'bold',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          borderRadius: '0',
        },
      });
    } catch (err) {
      console.error("Error syncing orders", err);
      toast.error('Sync failed', {
        duration: 1500,
        style: {
          background: '#1e1b4b',
          color: '#fff',
          fontSize: '10px',
          fontWeight: 'bold',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          borderRadius: '0',
        },
      });
    } finally {
      setSyncing(false);
    }
  };

  if (!isAuthenticated) {
    return (
        <div className="py-20 text-center">
            <h2 className="text-2xl font-serif text-emerald-950 mb-4">Please login to view your orders.</h2>
            <Link href="/login" className="text-xs font-bold uppercase tracking-widest text-emerald-600 border-b border-emerald-600">
                Sign In
            </Link>
        </div>
    );
  }

  return (
    <div className="py-20 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12">
          <div>
            <nav className="text-[10px] uppercase tracking-widest text-gray-400 mb-4">
              <Link href="/profile">Account</Link> / <span className="text-emerald-600">Order History</span>
            </nav>
            <h1 className="text-4xl font-serif text-emerald-950">Your Orders</h1>
          </div>
          <button
            onClick={handleSyncOrders}
            disabled={syncing}
            className="mt-6 md:mt-0 inline-flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest text-emerald-600 border-b border-emerald-600 disabled:opacity-60"
          >
            <RefreshCw size={12} className={syncing ? "animate-spin" : ""} />
            <span>{syncing ? "Syncing..." : "Sync Guest Orders"}</span>
          </button>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center">
              <Loader2 className="animate-spin text-emerald-600" size={32} />
          </div>
        ) : orders.length === 0 ? (
          <div className="py-20 text-center border-2 border-dashed border-gray-100 uppercase tracking-widest">
             <Package size={48} className="mx-auto text-gray-200 mb-4" />
             <p className="text-gray-500 text-xs">No orders found.</p>
             <Link href="/products" className="mt-4 inline-block text-[10px] font-bold text-emerald-600 border-b border-emerald-600 pb-1">Start Shopping</Link>
          </div>
        ) : (
          <div className="border border-gray-100 overflow-hidden shadow-sm">
            <div className="hidden md:grid grid-cols-5 bg-gray-50 p-6 border-b border-gray-100 text-[10px] font-bold uppercase tracking-widest text-gray-500">
              <span>Order ID</span>
              <span>Date</span>
              <span>Total</span>
              <span>Items</span>
              <span>Status</span>
            </div>
            <div className="divide-y divide-gray-100">
              {orders.map((order) => (
                <div 
                  key={order.id} 
                  className="grid grid-cols-1 md:grid-cols-5 p-6 hover:bg-gray-50 transition-colors items-center text-sm group"
                >
                  <div className="flex items-center space-x-2 mb-2 md:mb-0 group/id md:pr-8">
                    <span className="font-bold text-emerald-950 truncate max-w-[120px] md:max-w-full">{order.id || order._id}</span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        const id = order.id || order._id;
                        navigator.clipboard.writeText(id);
                        toast.success('ID Copied', {
                          duration: 1500,
                          style: {
                            background: '#1e1b4b',
                            color: '#fff',
                            fontSize: '10px',
                            fontWeight: 'bold',
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                            borderRadius: '0',
                          },
                        });
                      }}
                      className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all opacity-0 group-hover/id:opacity-100"
                      title="Copy Order ID"
                    >
                      <Copy size={12} />
                    </button>
                  </div>
                  <span className="text-gray-500 mb-2 md:mb-0">{new Date(order.created_at).toLocaleDateString()}</span>
                  <span className="font-bold text-emerald-950 mb-2 md:mb-0">₹{order.total_amount}</span>
                  <span className="text-gray-500 mb-2 md:mb-0 truncate pr-4 italic">
                    {order.items?.[0]?.name}
                    {order.items?.length > 1 ? ` + ${order.items.length - 1} more` : ''}
                  </span>
                  <div className="flex justify-between items-center">
                    <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${
                      order.status === 'delivered' ? 'bg-green-50 text-green-600' : 'bg-emerald-50 text-emerald-600'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
