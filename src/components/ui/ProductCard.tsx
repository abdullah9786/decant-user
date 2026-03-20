import Link from 'next/link';

interface Variant {
  size_ml: number;
  price: number;
}

interface ProductCardProps {
  id?: string;
  _id?: string;
  name: string;
  brand: string;
  variants?: Variant[];
  image_url?: string;
  is_featured?: boolean;
  is_new_arrival?: boolean;
  notes_top?: string[];
  notes_middle?: string[];
  notes_base?: string[];
}

const ProductCard = ({ 
  id, _id, name, brand, variants, image_url, is_featured, is_new_arrival,
  notes_top = [], notes_middle = [], notes_base = []
}: ProductCardProps) => {
  const productId = id || _id;
  let minPrice = 0;
  let maxPrice = 0;
  
  if (variants && variants.length > 0) {
    const prices = variants.map(v => v.price);
    minPrice = Math.min(...prices);
    maxPrice = Math.max(...prices);
  }

  const priceNode = (minPrice === maxPrice || !variants || variants.length === 1) ? (
    <>₹{minPrice} <span className="text-[9px] font-normal text-slate-400 uppercase tracking-wider">/ decant</span></>
  ) : (
    <>₹{minPrice} - ₹{maxPrice}</>
  );

  // Extract up to 3 notes for a quick 'scent profile' preview right on the card
  const allNotes = [...(notes_top || []), ...(notes_middle || []), ...(notes_base || [])].slice(0, 3);

  return (
    <Link 
      href={`/products/${productId}`} 
      className="group block w-full relative sm:cursor-pointer overflow-hidden rounded-[20px] border border-emerald-900/10 bg-white hover:border-emerald-900/30 hover:shadow-md transition-all duration-300"
    >
      {/* Image Container */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#F4F4F4] border-b border-emerald-900/10">
        
        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 z-20 flex flex-col gap-1.5">
          {is_new_arrival && (
            <span className="bg-white/95 text-emerald-950 px-3 py-1 text-[8px] font-bold uppercase tracking-widest rounded-full shadow-sm w-max border border-emerald-50">
              New Arrival
            </span>
          )}
          {is_featured && !is_new_arrival && (
            <span className="bg-emerald-950/90 backdrop-blur-md text-white px-3 py-1 text-[8px] font-bold uppercase tracking-widest rounded-full shadow-sm w-max">
              Featured
            </span>
          )}
        </div>
        
        {/* Image */}
        {image_url ? (
          <img 
            src={image_url} 
            alt={name} 
            className="w-full h-full object-cover transition-transform duration-[1.5s] ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-[1.03]"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center font-serif text-slate-300 italic text-sm">
            [ Fragrance Image ]
          </div>
        )}

        {/* Scent Profile Overlay (Always visible for Mobile UX) */}
        {allNotes.length > 0 && (
          <div className="absolute inset-x-0 bottom-0 p-3 pt-12 bg-gradient-to-t from-emerald-950/60 to-transparent z-10 pointer-events-none">
            <div className="flex flex-wrap gap-1.5 justify-center">
              {allNotes.map((note, idx) => (
                <span key={idx} className="bg-white/20 backdrop-blur-md text-white border border-white/20 px-2 py-0.5 text-[8px] uppercase tracking-widest rounded-full flex items-center">
                  {note}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Product Details - Boxed Flow */}
      <div className="p-3 md:p-5 flex flex-col">
        <p className="text-[10px] uppercase tracking-wider text-emerald-800/80 font-bold mb-1 leading-tight line-clamp-1">
          {brand}
        </p>
        <h3 className="font-serif text-[15px] md:text-[17px] text-emerald-950 leading-snug line-clamp-1 transition-colors group-hover:text-emerald-700 mb-1.5">
          {name}
        </h3>
        <p className="text-[13px] font-medium text-emerald-950 whitespace-nowrap">
          {priceNode}
        </p>
      </div>
    </Link>
  );
};

export default ProductCard;
