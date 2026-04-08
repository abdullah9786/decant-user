"use client";

import React, { useState, useEffect, useRef } from 'react';

import Link from 'next/link';
import { ShoppingBag, User, Search, Menu, X, ChevronDown } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { revokeRefreshOnServer } from '@/lib/api';
import { useRouter } from 'next/navigation';
import Logo from './Logo';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const shopRef = useRef<HTMLDivElement>(null);
  const totalItems = useCartStore((state) => state.totalItems());
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();

  useEffect(() => { setMounted(true); }, []);

  const shopTimeout = useRef<NodeJS.Timeout | null>(null);
  const openShop = () => { if (shopTimeout.current) clearTimeout(shopTimeout.current); setShopOpen(true); };
  const closeShop = () => { shopTimeout.current = setTimeout(() => setShopOpen(false), 150); };


  const handleLogout = async () => {
    const rt = useAuthStore.getState().refreshToken;
    await revokeRefreshOnServer(rt);
    logout();
    router.push('/');
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          {/* Mobile: Hamburger + Logo grouped together */}
          <div className="flex items-center space-x-4 md:space-x-0">
            <div className="flex items-center md:hidden">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-600">
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
            <div className="flex-shrink-0 flex items-center">
              <Logo />
            </div>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex space-x-8 items-center">
            <div ref={shopRef} className="relative" onMouseEnter={openShop} onMouseLeave={closeShop}>
              <button className="flex items-center space-x-1 text-xs font-bold uppercase tracking-widest text-gray-700 hover:text-emerald-600 transition-colors">
                <span>Shop</span>
                <ChevronDown size={14} className={`transition-transform ${shopOpen ? 'rotate-180' : ''}`} />
              </button>
              {shopOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 z-50">
                  <div className="w-52 bg-white border border-gray-100 rounded-xl shadow-xl p-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    <Link href="/products" onClick={() => setShopOpen(false)} className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg transition-colors">Shop All</Link>
                    <Link href="/brands" onClick={() => setShopOpen(false)} className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg transition-colors">Brands</Link>
                    <Link href="/families" onClick={() => setShopOpen(false)} className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg transition-colors">Fragrance Families</Link>
                    <Link href="/new-arrivals" onClick={() => setShopOpen(false)} className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg transition-colors">New Arrivals</Link>
                  </div>
                </div>
              )}
            </div>
            <Link href="/gift-boxes" className="text-xs font-bold uppercase tracking-widest text-gray-700 hover:text-emerald-600 transition-colors">Gift Boxes</Link>
            <Link href="/bottles" className="text-xs font-bold uppercase tracking-widest text-gray-700 hover:text-emerald-600 transition-colors">Bottles</Link>
            <Link href="/creators" className="text-xs font-bold uppercase tracking-widest text-gray-700 hover:text-emerald-600 transition-colors">Creators</Link>
            <Link href="/track-order" className="text-xs font-bold uppercase tracking-widest text-gray-700 hover:text-emerald-600 transition-colors">Track Order</Link>
          </div>

          {/* Icons */}
          <div className="flex items-center space-x-4 sm:space-x-5">
            <Link href="/search" className="text-gray-600 hover:text-emerald-600 transition-colors">
              <Search size={22} />
            </Link>
            
            {isAuthenticated ? (
              <div className="flex items-center space-x-5">
                <Link href="/profile" className="text-gray-600 hover:text-emerald-600 transition-colors flex items-center space-x-1">
                  <User size={22} />
                  <span className="hidden lg:block text-[10px] font-bold uppercase tracking-widest">{user?.full_name?.split(' ')[0]}</span>
                </Link>
                <button 
                  onClick={handleLogout}
                  className="text-[10px] font-bold text-gray-400 hover:text-red-500 uppercase tracking-widest transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link href="/login" className="text-[10px] font-bold text-gray-600 hover:text-emerald-600 uppercase tracking-widest transition-colors">
                Login
              </Link>
            )}

            <Link href="/cart" className="text-gray-600 hover:text-emerald-600 transition-colors relative">
              <ShoppingBag size={22} />
              {mounted && totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <>
          {/* Backdrop for clicking outside */}
          <div 
            className="fixed inset-0 top-20 bg-black/40 z-40 md:hidden animate-in fade-in"
            onClick={() => setIsMenuOpen(false)}
            aria-label="Close menu"
          />
          
          {/* Slide-down Menu Drawer */}
          <div className="absolute top-full left-0 right-0 md:hidden bg-white border-t border-gray-100 p-6 space-y-5 z-50 shadow-xl animate-in slide-in-from-top-4 duration-300">
            <Link href="/products" onClick={() => setIsMenuOpen(false)} className="block font-serif text-2xl text-emerald-950 hover:text-emerald-700 transition-colors">Shop All</Link>
            <Link href="/brands" onClick={() => setIsMenuOpen(false)} className="block font-serif text-2xl text-emerald-950 hover:text-emerald-700 transition-colors">Brands</Link>
            <Link href="/new-arrivals" onClick={() => setIsMenuOpen(false)} className="block font-serif text-2xl text-emerald-950 hover:text-emerald-700 transition-colors">New Arrivals</Link>
            <Link href="/gift-boxes" onClick={() => setIsMenuOpen(false)} className="block font-serif text-2xl text-emerald-950 hover:text-emerald-700 transition-colors">Gift Boxes</Link>
            <Link href="/bottles" onClick={() => setIsMenuOpen(false)} className="block font-serif text-2xl text-emerald-950 hover:text-emerald-700 transition-colors">Bottles</Link>
            <Link href="/creators" onClick={() => setIsMenuOpen(false)} className="block font-serif text-2xl text-emerald-950 hover:text-emerald-700 transition-colors">Creators</Link>
            <Link href="/track-order" onClick={() => setIsMenuOpen(false)} className="block font-serif text-2xl text-emerald-950 hover:text-emerald-700 transition-colors">Track Order</Link>
          </div>
        </>
      )}
    </nav>
  );
};

export default Navbar;
