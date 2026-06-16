import Link from 'next/link';
import { Phone, Mail, MapPin } from 'lucide-react';
import Logo from './Logo';

const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-1">
            <Logo className="mb-6" imgClassName="h-10 w-auto" />
            <p className="text-gray-600 text-sm leading-relaxed">
              Independent perfume decanting service in India. Hand-poured trial sizes from genuine sealed bottles.
            </p>
          </div>
          <div>
            <h4 className="text-xs font-bold text-gray-900 tracking-widest uppercase mb-6">Explore</h4>
            <ul className="space-y-4 text-sm text-gray-600">
              <li><Link href="/products" className="hover:text-emerald-600">Shop All</Link></li>
              <li><Link href="/brands" className="hover:text-emerald-600">Featured Brands</Link></li>
              <li><Link href="/new-arrivals" className="hover:text-emerald-600">New Arrivals</Link></li>
              <li><Link href="/creators" className="hover:text-emerald-600">Creators</Link></li>
              <li><Link href="/bestsellers" className="hover:text-emerald-600">Best Sellers</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-bold text-gray-900 tracking-widest uppercase mb-6">Policies</h4>
            <ul className="space-y-4 text-sm text-gray-600">
              <li><Link href="/authenticity" className="hover:text-emerald-600">Authenticity & Sourcing</Link></li>
              <li><Link href="/reviews-policy" className="hover:text-emerald-600">Verified Reviews Policy</Link></li>
              <li><Link href="/about" className="hover:text-emerald-600">About Us</Link></li>
              <li><Link href="/shipping-policy" className="hover:text-emerald-600">Shipping Policy</Link></li>
              <li><Link href="/return-policy" className="hover:text-emerald-600">Return Policy</Link></li>
              <li><Link href="/terms" className="hover:text-emerald-600">Terms & Conditions</Link></li>
              <li><Link href="/privacy" className="hover:text-emerald-600">Privacy Policy</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-bold text-gray-900 tracking-widest uppercase mb-6">Contact</h4>
            <ul className="space-y-4 text-sm text-gray-600">
              <li className="flex items-start gap-3">
                <MapPin size={14} className="mt-0.5 text-emerald-600 flex-shrink-0" />
                <span className="leading-relaxed">
                  41/12, Plot 1692, M.A Road,<br />
                  L Melville Marg, Mumbai, India
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={14} className="text-emerald-600 flex-shrink-0" />
                <a href="tel:+919768188453" className="hover:text-emerald-600">+91 97681 88453</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={14} className="text-emerald-600 flex-shrink-0" />
                <a href="mailto:orders@decume.in" className="hover:text-emerald-600">orders@decume.in</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-8 mb-8">
          <p className="text-[11px] text-gray-500 leading-relaxed">
            <span className="font-bold text-gray-700">Brand Disclaimer:</span>{' '}
            Decume is an independent perfume decanting service. We are not affiliated with, endorsed
            by, sponsored by, or officially connected to any of the fragrance houses or brands
            referenced on this site. All trademarks, brand names, and product names are the property
            of their respective owners and are used solely to identify the original fragrance from
            which a decant is poured. Vials, labels, and packaging are produced by Decume and are
            not the brand&rsquo;s official packaging.
          </p>
        </div>

        <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500 gap-4">
          <p>© {new Date().getFullYear()} Decume. All rights reserved.</p>
          <div className="flex space-x-6">
            <span>Instagram</span>
            <span>Facebook</span>
            <span>Twitter</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
