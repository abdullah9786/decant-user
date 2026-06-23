'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ShoppingBag, User, Search, X, Menu, ChevronDown } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { revokeRefreshOnServer, categoryApi } from '@/lib/api';
import Logo from './Logo';
import SearchBar from '@/components/search/SearchBar';
import MobileMenuOverlay from './MobileMenuOverlay';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [extrasOpen, setExtrasOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);

  const shopRef = useRef<HTMLDivElement>(null);
  const catRef = useRef<HTMLDivElement>(null);
  const extrasRef = useRef<HTMLDivElement>(null);
  const searchPanelRef = useRef<HTMLDivElement>(null);
  const totalItems = useCartStore((state) => state.totalItems());
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    categoryApi.getAll().then((res) => setCategories(res.data || [])).catch(() => {});
  }, []);

  // Auto-close the mobile overlays whenever the route changes, e.g. after
  // the user taps a suggestion / nav link that triggers a navigation.
  useEffect(() => {
    setSearchOpen(false);
    setIsMenuOpen(false);
  }, [pathname]);

  // Dismiss the mobile search panel on outside-click or Escape. Mousedown
  // (not click) so taps on a suggestion still navigate before the panel
  // hides. The search trigger button is excluded via `data-search-trigger`
  // so its own onClick can toggle the panel closed without us racing it.
  useEffect(() => {
    if (!searchOpen) return;
    const onMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest?.('[data-search-trigger]')) return;
      if (searchPanelRef.current && !searchPanelRef.current.contains(target)) {
        setSearchOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSearchOpen(false);
    };
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [searchOpen]);

  const shopTimeout = useRef<NodeJS.Timeout | null>(null);
  const openShop = () => { if (shopTimeout.current) clearTimeout(shopTimeout.current); setShopOpen(true); };
  const closeShop = () => { shopTimeout.current = setTimeout(() => setShopOpen(false), 0); };

  const catTimeout = useRef<NodeJS.Timeout | null>(null);
  const openCat = () => { if (catTimeout.current) clearTimeout(catTimeout.current); setCatOpen(true); };
  const closeCat = () => { catTimeout.current = setTimeout(() => setCatOpen(false), 150); };

  const extrasTimeout = useRef<NodeJS.Timeout | null>(null);
  const openExtras = () => { if (extrasTimeout.current) clearTimeout(extrasTimeout.current); setExtrasOpen(true); };
  const closeExtras = () => { extrasTimeout.current = setTimeout(() => setExtrasOpen(false), 150); };

  const handleLogout = async () => {
    const rt = useAuthStore.getState().refreshToken;
    await revokeRefreshOnServer(rt);
    logout();
    router.push('/');
  };

  return (
    <nav
      className="sticky z-50 bg-white border-b border-gray-100 shadow-sm"
      style={{ top: "var(--mgift-bar-h, 0px)" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          {/* Mobile: hamburger + logo */}
          <div className="flex items-center space-x-4 md:space-x-0">
            <button
              type="button"
              onClick={() => setIsMenuOpen(true)}
              aria-label="Open menu"
              className="md:hidden text-gray-600 hover:text-emerald-600 transition-colors"
            >
              <Menu size={24} />
            </button>
            <div className="flex-shrink-0 flex items-center">
              <Logo />
            </div>
          </div>

          {/* Desktop nav links — explicit left margin away from the logo
              because the parent uses `justify-between` with a flex-1
              search slot, leaving no natural gap between siblings. */}
          <div className="hidden md:flex space-x-6 lg:space-x-7 items-center ml-6 lg:ml-10">
            <div ref={shopRef} className="relative" onMouseEnter={openShop} onMouseLeave={closeShop}>
              <button className="flex items-center space-x-1 text-xs font-bold uppercase tracking-widest text-gray-700 hover:text-emerald-600 transition-colors">
                <span>Shop</span>
                <ChevronDown size={14} className={`transition-transform ${shopOpen ? 'rotate-180' : ''}`} />
              </button>
              {shopOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 z-50">
                  <div className="w-52 bg-white border border-gray-100 rounded-xl shadow-xl p-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    <Link href="/products" onClick={() => setShopOpen(false)} className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg transition-colors">Shop All</Link>
                    <Link href="/products?type=decant" onClick={() => setShopOpen(false)} className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg transition-colors">Decants</Link>
                    <Link href="/products?type=full-bottle" onClick={() => setShopOpen(false)} className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg transition-colors">Full Bottles</Link>
                    <div className="my-1 border-t border-gray-100" />
                    <Link href="/brands" onClick={() => setShopOpen(false)} className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg transition-colors">Brands</Link>
                    <Link href="/families" onClick={() => setShopOpen(false)} className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg transition-colors">Fragrance Families</Link>
                    <Link href="/new-arrivals" onClick={() => setShopOpen(false)} className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg transition-colors">New Arrivals</Link>
                  </div>
                </div>
              )}
            </div>
            <div ref={catRef} className="relative" onMouseEnter={openCat} onMouseLeave={closeCat}>
              <button className="flex items-center space-x-1 text-xs font-bold uppercase tracking-widest text-gray-700 hover:text-emerald-600 transition-colors">
                <span>Categories</span>
                <ChevronDown size={14} className={`transition-transform ${catOpen ? 'rotate-180' : ''}`} />
              </button>
              {catOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 z-50">
                  <div className="w-52 bg-white border border-gray-100 rounded-xl shadow-xl p-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    <Link href="/categories" onClick={() => setCatOpen(false)} className="block px-4 py-2.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors">All Categories</Link>
                    {categories.length > 0 && <div className="my-1 border-t border-gray-100" />}
                    {categories.map((cat) => (
                      <Link key={cat._id || cat.slug} href={`/categories/${cat.slug}`} onClick={() => setCatOpen(false)} className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg transition-colors">{cat.name}</Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div ref={extrasRef} className="relative" onMouseEnter={openExtras} onMouseLeave={closeExtras}>
              <button className="flex items-center space-x-1 text-xs font-bold uppercase tracking-widest text-gray-700 hover:text-emerald-600 transition-colors">
                <span>Gifting</span>
                <ChevronDown size={14} className={`transition-transform ${extrasOpen ? 'rotate-180' : ''}`} />
              </button>
              {extrasOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 z-50">
                  <div className="w-48 bg-white border border-gray-100 rounded-xl shadow-xl p-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    <Link href="/gift-boxes" onClick={() => setExtrasOpen(false)} className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg transition-colors">Gift Boxes</Link>
                    <Link href="/bottles" onClick={() => setExtrasOpen(false)} className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg transition-colors">Our Bottles</Link>
                  </div>
                </div>
              )}
            </div>
            <Link href="/creators" className="text-xs font-bold uppercase tracking-widest text-gray-700 hover:text-emerald-600 transition-colors">Creators</Link>
            <Link href="/track-order" className="text-xs font-bold uppercase tracking-widest text-gray-700 hover:text-emerald-600 transition-colors">Track Order</Link>
          </div>

          {/* Desktop inline search */}
          <div className="hidden md:block flex-1 max-w-sm lg:max-w-md mx-4 lg:mx-8">
            <SearchBar compact />
          </div>

          {/* Icons */}
          <div className="flex items-center space-x-4 sm:space-x-5">
            {/* Mobile-only search trigger — toggles the slide-down panel
                below the navbar. `data-search-trigger` lets the outside-
                click handler skip this element so closing here always
                works via the button's own onClick. */}
            <button
              type="button"
              data-search-trigger
              onClick={() => setSearchOpen((v) => !v)}
              aria-label={searchOpen ? 'Close search' : 'Open search'}
              aria-expanded={searchOpen}
              className="md:hidden text-gray-600 hover:text-emerald-600 transition-colors"
            >
              {searchOpen ? <X size={22} /> : <Search size={22} />}
            </button>

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

      {/* Mobile search — slide-down panel anchored to the bottom of the
          sticky navbar. Closes on outside-click or Escape (see effect
          above). Page underneath stays scrollable; if the user scrolls
          or taps somewhere else, the panel just dismisses. */}
      {searchOpen && (
        <div
          ref={searchPanelRef}
          className="absolute top-full inset-x-0 md:hidden bg-white shadow-lg px-4 py-3 z-40 animate-in slide-in-from-top-2 duration-150"
        >
          <SearchBar autoFocus onNavigate={() => setSearchOpen(false)} />
        </div>
      )}

      {/* Mobile menu still uses a full-screen overlay — its content can
          easily exceed the viewport, and a full screen is the better UX
          for a primary navigation list. */}
      <MobileMenuOverlay
        open={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        categories={categories}
      />
    </nav>
  );
};

export default Navbar;
