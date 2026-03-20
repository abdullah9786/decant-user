"use client";

import React, { useState, useEffect } from 'react';

import Link from 'next/link';
import { ShoppingBag, User, Search, Menu, X } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import Logo from './Logo';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const totalItems = useCartStore((state) => state.totalItems());
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();

  useEffect(() => { setMounted(true); }, []);


  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-600">
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Logo />
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex space-x-10 items-center">
            <Link href="/products" className="text-sm font-medium text-gray-700 hover:text-emerald-600 transition-colors">SHOP ALL</Link>
            <Link href="/brands" className="text-sm font-medium text-gray-700 hover:text-emerald-600 transition-colors">BRANDS</Link>
            <Link href="/families" className="text-sm font-medium text-gray-700 hover:text-emerald-600 transition-colors">FRAGRANCE FAMILIES</Link>
            <Link href="/new-arrivals" className="text-sm font-medium text-gray-700 hover:text-emerald-600 transition-colors">NEW ARRIVALS</Link>
            <Link href="/track-order" className="text-sm font-medium text-gray-700 hover:text-emerald-600 transition-colors">TRACK ORDER</Link>
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
            <Link href="/track-order" onClick={() => setIsMenuOpen(false)} className="block font-serif text-2xl text-emerald-950 hover:text-emerald-700 transition-colors">Track Order</Link>
          </div>
        </>
      )}
    </nav>
  );
};

export default Navbar;
