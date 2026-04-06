import Link from 'next/link';
import Logo from './Logo';

const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-1">
            <Logo className="mb-6" imgClassName="h-10 w-auto" />
            <p className="text-gray-600 text-sm leading-relaxed">
              Curating the finest perfume decants in India. Experience luxury fragrances in accessible sizes.
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
              <li><Link href="/about" className="hover:text-emerald-600">About Us</Link></li>
              <li><Link href="/shipping-policy" className="hover:text-emerald-600">Shipping Policy</Link></li>
              <li><Link href="/return-policy" className="hover:text-emerald-600">Return Policy</Link></li>
              <li><Link href="/terms" className="hover:text-emerald-600">Terms & Conditions</Link></li>
              <li><Link href="/privacy" className="hover:text-emerald-600">Privacy Policy</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-bold text-gray-900 tracking-widest uppercase mb-6">Newsletter</h4>
            <p className="text-sm text-gray-600 mb-4">Subscribe for fragrance tips and exclusive offers.</p>
            <div className="flex max-w-sm">
              <input 
                type="email" 
                placeholder="Email address" 
                className="w-full bg-white border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:border-emerald-600"
              />
              <button className="bg-emerald-950 text-white px-6 py-2 text-xs font-bold uppercase tracking-widest hover:bg-black transition-colors">
                Join
              </button>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
          <p>© {new Date().getFullYear()} Decume. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
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
