"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Package, Heart, LogOut, ChevronRight, Settings, Loader2, RefreshCw } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { orderApi, revokeRefreshOnServer } from '@/lib/api';

export default function ProfilePage() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const [recentOrder, setRecentOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    const fetchRecentOrder = async () => {
      try {
        const response = await orderApi.getUserOrders(user?.id || (user as any)?._id);
        if (response.data?.length > 0) {
          // Sort by date and take the latest
          const latest = [...response.data].sort((a: any, b: any) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )[0];
          setRecentOrder(latest);
        }
      } catch (err) {
        console.error("Error fetching recent order", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecentOrder();
  }, [isAuthenticated, router]);

  const handleSyncOrders = async () => {
    setSyncing(true);
    try {
      await orderApi.syncGuestOrders();
      const response = await orderApi.getUserOrders(user?.id || (user as any)?._id);
      if (response.data?.length > 0) {
        const latest = [...response.data].sort((a: any, b: any) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )[0];
        setRecentOrder(latest);
      } else {
        setRecentOrder(null);
      }
    } catch (err) {
      console.error("Error syncing orders", err);
    } finally {
      setSyncing(false);
    }
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-emerald-600" size={32} />
      </div>
    );
  }

  const menuItems = [
    { title: 'Order History', icon: Package, href: '/orders' },
    { title: 'My Wishlist', icon: Heart, href: '/wishlist' },
    { title: 'Account Settings', icon: Settings, href: '/settings' },
  ];

  return (
    <div className="py-20 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-serif text-emerald-950 mb-12">My Account</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Sidebar / Info */}
          <div className="md:col-span-1 space-y-8">
            <div className="bg-white p-8 border border-gray-100 shadow-sm text-center">
              <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <User size={40} className="text-emerald-600" />
              </div>
              <h3 className="text-xl font-serif text-emerald-950 mb-1">{user.full_name}</h3>
              <p className="text-xs text-gray-400 uppercase tracking-widest">{user.email}</p>
            </div>

            <button
              onClick={async () => {
                const rt = useAuthStore.getState().refreshToken;
                await revokeRefreshOnServer(rt);
                logout();
                router.push('/');
              }}
              className="w-full flex items-center justify-center space-x-3 py-4 border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-500 transition-all text-xs font-bold uppercase tracking-widest"
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </div>

          {/* Menu */}
          <div className="md:col-span-2 space-y-4">
            {menuItems.map((item) => (
              <Link 
                key={item.title} 
                href={item.href}
                className="flex items-center justify-between p-8 bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all group"
              >
                <div className="flex items-center space-x-6">
                  <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center group-hover:bg-emerald-50 transition-colors">
                    <item.icon size={20} className="text-emerald-950" />
                  </div>
                  <span className="text-sm font-bold uppercase tracking-widest text-emerald-950">{item.title}</span>
                </div>
                <ChevronRight size={20} className="text-gray-300 group-hover:text-emerald-600 transition-colors" />
              </Link>
            ))}

            {/* Recent Order Preview */}
            <div className="mt-12">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-6">Recent Order</h4>
              {loading ? (
                <div className="bg-white p-8 border border-gray-100 flex justify-center">
                  <Loader2 className="animate-spin text-emerald-200" size={24} />
                </div>
              ) : recentOrder ? (
                <div className="bg-emerald-950 text-white p-8 relative overflow-hidden transition-all hover:bg-black">
                  <div className="relative z-10">
                     <p className="text-[10px] uppercase tracking-widest opacity-60 mb-2">Order #{(recentOrder.id || recentOrder._id).substring(0, 8)}</p>
                     <p className="text-xl font-serif mb-4 truncate pr-16">
                        {recentOrder.items?.[0]?.name} {recentOrder.items?.length > 1 ? `+ ${recentOrder.items.length - 1} more` : ''}
                     </p>
                     <div className="flex justify-between items-end">
                       <span className="px-3 py-1 bg-white/20 text-[10px] uppercase tracking-widest">{recentOrder.status}</span>
                       <Link href="/orders" className="text-xs font-bold uppercase tracking-widest border-b border-white">View Details</Link>
                     </div>
                  </div>
                  <Package size={80} className="absolute -right-4 -bottom-4 opacity-10" />
                </div>
              ) : (
                <div className="bg-white p-10 border-2 border-dashed border-gray-100 text-center space-y-4">
                  <p className="text-xs text-gray-400 uppercase tracking-widest">No recent orders found</p>
                  <button
                    onClick={handleSyncOrders}
                    disabled={syncing}
                    className="inline-flex items-center justify-center space-x-2 text-[10px] font-bold uppercase tracking-widest text-emerald-600 border-b border-emerald-600 disabled:opacity-60"
                  >
                    <RefreshCw size={12} className={syncing ? "animate-spin" : ""} />
                    <span>{syncing ? "Syncing..." : "Sync Guest Orders"}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
