import Link from 'next/link';

interface Variant {
  size_ml: number;
  price: number;
  stock: number;
}

interface ProductCardProps {
  id?: string;
  _id?: string;
  name: string;
  brand: string;
  variants?: Variant[];
  image_url?: string;
  is_featured?: boolean;
}

const ProductCard = ({ id, _id, name, brand, variants, image_url, is_featured }: ProductCardProps) => {
  const productId = id || _id;
  const displayPrice = variants && variants.length > 0 
    ? Math.min(...variants.map(v => v.price)) 
    : 0;
  return (
    <div className="group bg-white border border-gray-100 p-4 transition-all hover:shadow-2xl hover:-translate-y-1 relative">
      {is_featured && (
        <span className="absolute top-4 left-4 bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-widest px-2 py-1 z-10">
          Featured
        </span>
      )}
      
      <Link href={`/products/${productId}`} className="block overflow-hidden bg-gray-50 aspect-[4/5] mb-6 relative">
        {image_url ? (
          <img 
            src={image_url} 
            alt={name} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center italic text-gray-200 font-serif text-lg">
             [ Fragrance Image ]
          </div>
        )}
        
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-6">
           <button className="bg-white text-emerald-950 px-6 py-2 text-[10px] font-bold uppercase tracking-widest shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform">
             Quick View
           </button>
        </div>
      </Link>

      <div className="text-center">
        <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em] mb-2">{brand}</p>
        <h3 className="font-serif text-lg text-emerald-950 mb-2 truncate px-2">{name}</h3>
        <p className="text-emerald-600 font-bold mb-4">From ₹{displayPrice}</p>
        <Link 
          href={`/products/${productId}`}
          className="inline-block w-full py-4 bg-gray-50 text-emerald-950 text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-950 hover:text-white transition-all duration-300 text-center"
        >
          Select Options
        </Link>
      </div>
    </div>
  );
};

export default ProductCard;
