"use client";

import React, { useState, useEffect, useRef } from 'react';

import Link from 'next/link';
import { ShoppingBag, User, Search, Menu, X, ChevronDown } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { revokeRefreshOnServer, categoryApi } from '@/lib/api';
import { useRouter, usePathname } from 'next/navigation';
import Logo from './Logo';
import SearchBar from '@/components/search/SearchBar';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [extrasOpen, setExtrasOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const shopRef = useRef<HTMLDivElement>(null);
  const catRef = useRef<HTMLDivElement>(null);
  const extrasRef = useRef<HTMLDivElement>(null);
  const totalItems = useCartStore((state) => state.totalItems());
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  // Close the mobile slide-down search whenever the route changes (e.g.
  // after the user taps a suggestion that navigates to a product page).
  useEffect(() => {
    setSearchOpen(false);
  }, [pathname]);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    categoryApi.getAll().then(res => setCategories(res.data || [])).catch(() => {});
  }, []);

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
    // When the mobile slide-down search is open we suppress the bottom
    // shadow so the navbar + panel read as one continuous white surface.
    // Otherwise the shadow casts onto the panel and produces a visible
    // gray "strip" right above the search input.
    <nav className={`sticky top-0 z-50 bg-white border-b border-gray-100 ${searchOpen ? '' : 'shadow-sm'}`}>
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

          {/* Desktop Nav — explicit left margin away from the logo because
              the parent uses `justify-between` with a flex-1 search slot,
              which leaves no natural gap between adjacent siblings.
              Inner spacing reduced from space-x-8 → space-x-6 so the five
              nav items + the inline search still fit comfortably at md. */}
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

          {/* Desktop inline search — replaces the old icon-only link so
              users can type without first navigating to /search. The
              SearchBar handles the autosuggest dropdown + URL routing.
              Slightly tighter horizontal margins at md (where space is
              tightest) and a touch more breathing room at lg+. */}
          <div className="hidden md:block flex-1 max-w-sm lg:max-w-md mx-4 lg:mx-8">
            <SearchBar compact />
          </div>

          {/* Icons */}
          <div className="flex items-center space-x-4 sm:space-x-5">
            {/* Mobile-only search trigger — opens the slide-down panel
                below the navbar. Desktop has the inline bar above. */}
            <button
              type="button"
              onClick={() => setSearchOpen((v) => !v)}
              className="md:hidden text-gray-600 hover:text-emerald-600 transition-colors"
              aria-label={searchOpen ? 'Close search' : 'Open search'}
              aria-expanded={searchOpen}
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

      {/* Mobile slide-down search panel — sits directly below the navbar
          bar. autoFocus opens the keyboard immediately; tapping anywhere
          outside (including the backdrop) collapses it. The dropdown's
          autosuggest results render inline below the input, so the user
          sees them at the top of the screen above the keyboard.
          NOTE: No `border-t` here — the navbar already has a `border-b`
          gray-100 line. Stacking another 1px border on top of it (plus
          the navbar's drop shadow) was producing a visible gray "strip"
          right above the input. We also suppressed the navbar's
          `shadow-sm` while this panel is open (see <nav> className). */}
      {searchOpen && (
        <>
          <div
            className="fixed inset-0 top-20 bg-black/30 z-40 md:hidden animate-in fade-in"
            onClick={() => setSearchOpen(false)}
            aria-label="Close search"
          />
          <div className="absolute top-full left-0 right-0 md:hidden bg-white px-4 py-3 z-50 shadow-xl animate-in slide-in-from-top-4 duration-200">
            <SearchBar autoFocus onNavigate={() => setSearchOpen(false)} />
          </div>
        </>
      )}

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
            {/* Persistent inline search inside the drawer too, so the search
                entry-point is always reachable regardless of which menu
                the user opened first. */}
            <SearchBar onNavigate={() => setIsMenuOpen(false)} />
            <Link href="/products" onClick={() => setIsMenuOpen(false)} className="block font-serif text-2xl text-emerald-950 hover:text-emerald-700 transition-colors">Shop All</Link>
            <Link href="/products?type=decant" onClick={() => setIsMenuOpen(false)} className="block font-serif text-2xl text-emerald-950 hover:text-emerald-700 transition-colors">Decants</Link>
            <Link href="/products?type=full-bottle" onClick={() => setIsMenuOpen(false)} className="block font-serif text-2xl text-emerald-950 hover:text-emerald-700 transition-colors">Full Bottles</Link>
            <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold pt-2">Categories</p>
            {categories.map((cat) => (
              <Link key={cat._id || cat.slug} href={`/categories/${cat.slug}`} onClick={() => setIsMenuOpen(false)} className="block font-serif text-2xl text-emerald-950 hover:text-emerald-700 transition-colors pl-4">{cat.name}</Link>
            ))}
            <Link href="/categories" onClick={() => setIsMenuOpen(false)} className="block text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors pl-4">View All Categories →</Link>
            <Link href="/brands" onClick={() => setIsMenuOpen(false)} className="block font-serif text-2xl text-emerald-950 hover:text-emerald-700 transition-colors">Brands</Link>
            <Link href="/new-arrivals" onClick={() => setIsMenuOpen(false)} className="block font-serif text-2xl text-emerald-950 hover:text-emerald-700 transition-colors">New Arrivals</Link>
            <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold pt-2">Gifting</p>
            <Link href="/gift-boxes" onClick={() => setIsMenuOpen(false)} className="block font-serif text-2xl text-emerald-950 hover:text-emerald-700 transition-colors pl-4">Gift Boxes</Link>
            <Link href="/bottles" onClick={() => setIsMenuOpen(false)} className="block font-serif text-2xl text-emerald-950 hover:text-emerald-700 transition-colors pl-4">Our Bottles</Link>
            <Link href="/creators" onClick={() => setIsMenuOpen(false)} className="block font-serif text-2xl text-emerald-950 hover:text-emerald-700 transition-colors">Creators</Link>
            <Link href="/track-order" onClick={() => setIsMenuOpen(false)} className="block font-serif text-2xl text-emerald-950 hover:text-emerald-700 transition-colors">Track Order</Link>
          </div>
        </>
      )}
    </nav>
  );
};

export default Navbar;
