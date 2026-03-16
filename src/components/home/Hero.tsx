import Link from 'next/link';

const Hero = () => {
  return (
    <section className="relative h-[85vh] flex items-center overflow-hidden bg-gray-100">
      {/* Background with a placeholder-like aesthetic for now */}
      <div className="absolute inset-0 bg-gradient-to-r from-gray-200 to-transparent z-0"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-2xl">
          <span className="text-xs font-bold tracking-[0.3em] uppercase text-emerald-600 mb-4 block">
            Crafting Miniature Luxuries
          </span>
          <h1 className="text-5xl md:text-7xl font-serif font-extrabold text-emerald-950 leading-tight mb-8">
            Experience the Finest <br /> Fragrances, <span className="italic">Decanted.</span>
          </h1>
          <p className="text-lg text-gray-700 mb-10 leading-relaxed max-w-lg">
            Authentic designer and niche perfume decants. Explore luxury scents in 2ml, 5ml, and 10ml sizes before committing to a full bottle.
          </p>
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6">
            <Link href="/products" className="bg-emerald-950 text-white px-10 py-4 text-xs font-bold uppercase tracking-widest hover:bg-black transition-all transform hover:-translate-y-1 shadow-xl text-center">
              Shop Collection
            </Link>
            <Link href="/new-arrivals" className="bg-white text-emerald-950 border border-emerald-950 px-10 py-4 text-xs font-bold uppercase tracking-widest hover:bg-gray-50 transition-all text-center">
              New Arrivals
            </Link>
          </div>
        </div>
      </div>

      {/* Hero Image area (Placeholder for actual premium perfume image) */}
      <div className="hidden lg:block absolute right-0 top-0 bottom-0 w-1/2 overflow-hidden">
        <img 
          src="https://i.postimg.cc/NM5FyycG/Gemini-Generated-Image-se7fiese7fiese7f.png" 
          alt="Premium Fragrance" 
          className="h-full w-full object-cover transform scale-110 hover:scale-100 transition-transform duration-[3000ms] ease-out" 
        />
        <div className="absolute inset-0"></div>
      </div>
    </section>
  );
};

export default Hero;
