'use client';

import Link from 'next/link';
import { X } from 'lucide-react';
import SearchBar from '@/components/search/SearchBar';
import MobileOverlay from './MobileOverlay';

interface Category {
  _id?: string;
  slug: string;
  name: string;
}

interface MobileMenuOverlayProps {
  open: boolean;
  onClose: () => void;
  categories: Category[];
}

interface NavLinkProps {
  href: string;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}

/**
 * Single-source-of-truth styled link inside the menu — keeps the markup
 * below DRY and consistent without spinning up a separate file.
 */
function NavLink({ href, onClick, children, className }: NavLinkProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`block py-0.5 font-serif text-base text-emerald-950 hover:text-emerald-700 transition-colors ${className ?? ''}`}
    >
      {children}
    </Link>
  );
}

/**
 * Full-screen mobile menu overlay.
 *
 * Sections (top → bottom):
 *   1. Header row: close button + "Menu" label.
 *   2. Embedded SearchBar so search remains one tap away even after the
 *      user opened the menu.
 *   3. Primary nav links (Shop All / Decants / Full Bottles).
 *   4. Categories (dynamic).
 *   5. Brand + new arrivals.
 *   6. Gifting subsection.
 *   7. Account / extras (Creators, Track Order).
 *
 * The whole content column is `flex-1 overflow-y-auto`, so even if the
 * link list grows past the viewport, the menu scrolls internally without
 * affecting the page underneath.
 */
export default function MobileMenuOverlay({
  open,
  onClose,
  categories,
}: MobileMenuOverlayProps) {
  return (
    <MobileOverlay open={open} onClose={onClose} ariaLabel="Menu">
      <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-gray-100 shrink-0">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close menu"
          className="p-2 -ml-1 text-gray-700 hover:text-emerald-700 transition-colors rounded-full"
        >
          <X size={22} />
        </button>
        <span className="text-xs font-bold uppercase tracking-widest text-gray-500">
          Menu
        </span>
        {/* Symmetry spacer so the title stays visually centred. */}
        <span className="w-9" aria-hidden="true" />
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="mb-4">
          <SearchBar onNavigate={onClose} />
        </div>

        <nav className="space-y-4">
          <div className="space-y-0.5">
            <NavLink href="/products" onClick={onClose}>Shop All</NavLink>
            <NavLink href="/products?type=decant" onClick={onClose}>Decants</NavLink>
            <NavLink href="/products?type=full-bottle" onClick={onClose}>Full Bottles</NavLink>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1.5">
              Categories
            </p>
            <div className="space-y-0.5">
              {categories.map((cat) => (
                <NavLink
                  key={cat._id || cat.slug}
                  href={`/categories/${cat.slug}`}
                  onClick={onClose}
                  className="pl-3"
                >
                  {cat.name}
                </NavLink>
              ))}
              <Link
                href="/categories"
                onClick={onClose}
                className="block py-0.5 pl-3 text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
              >
                View All Categories →
              </Link>
            </div>
          </div>

          <div className="space-y-0.5">
            <NavLink href="/brands" onClick={onClose}>Brands</NavLink>
            <NavLink href="/new-arrivals" onClick={onClose}>New Arrivals</NavLink>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1.5">
              Gifting
            </p>
            <div className="space-y-0.5">
              <NavLink href="/gift-boxes" onClick={onClose} className="pl-3">Gift Boxes</NavLink>
              <NavLink href="/bottles" onClick={onClose} className="pl-3">Our Bottles</NavLink>
            </div>
          </div>

          <div className="space-y-0.5">
            <NavLink href="/creators" onClick={onClose}>Creators</NavLink>
            <NavLink href="/track-order" onClick={onClose}>Track Order</NavLink>
          </div>
        </nav>
      </div>
    </MobileOverlay>
  );
}
