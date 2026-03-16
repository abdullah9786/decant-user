"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBag, ChevronRight, Star, ShieldCheck, Truck, Loader2, ChevronLeft } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { productApi } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await productApi.getOne(id);
        setProduct(response.data);
        if (response.data.variants?.length > 0) {
          setSelectedSize(response.data.variants[0].size_ml);
        }
      } catch (err) {
        console.error("Error fetching product", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const allImages = product ? [product.image_url, ...(product.images || [])].filter(Boolean) : [];
  const currentVariant = product?.variants?.find((v: any) => v.size_ml === selectedSize) || product?.variants?.[0];

  const handleAddToCart = () => {
    if (!product || !currentVariant) return;
    
    addItem({
      id: product.id || product._id,
      name: product.name,
      brand: product.brand,
      size_ml: selectedSize!,
      price: currentVariant.price,
      quantity: 1
    });
    toast.success(`${product.name} added to cart!`, {
      style: {
        background: '#1e1b4b',
        color: '#fff',
        fontSize: '10px',
        fontWeight: 'bold',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        borderRadius: '0',
      },
      iconTheme: {
        primary: '#fff',
        secondary: '#1e1b4b',
      },
    });
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <p className="text-gray-400 font-serif italic text-xl">Fragrance not found.</p>
        <Link href="/products" className="text-xs font-bold uppercase tracking-widest text-indigo-600 border-b border-indigo-600">
            Back to Collection
        </Link>
      </div>
    );
  }

  return (
    <div className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <nav className="text-[10px] uppercase tracking-widest text-gray-400 mb-8 flex items-center">
          <Link href="/" className="hover:text-indigo-600 transition-colors">Home</Link> 
          <ChevronRight size={10} className="mx-2" /> 
          <Link href="/products" className="hover:text-indigo-600 transition-colors">Shop</Link> 
          <ChevronRight size={10} className="mx-2" /> 
          <span className="text-indigo-600 font-bold">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 xl:gap-20">
          {/* Left Column: Image Gallery (Dawn Style) */}
          <div className="lg:col-span-7 flex flex-col md:flex-row-reverse gap-4">
            {/* Main Image Viewer */}
            <div className="flex-1 relative aspect-[4/5] bg-gray-50 overflow-hidden group">
               <AnimatePresence mode="wait">
                  <motion.img
                    key={activeImageIdx}
                    src={allImages[activeImageIdx]}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    className="w-full h-full object-cover"
                  />
               </AnimatePresence>
               
               {/* Mobile Controls */}
               <div className="absolute inset-0 flex items-center justify-between p-4 md:hidden pointer-events-none">
                  <button 
                    onClick={() => setActiveImageIdx(prev => (prev === 0 ? allImages.length - 1 : prev - 1))}
                    className="p-2 bg-white/80 rounded-full shadow-lg backdrop-blur-sm pointer-events-auto"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button 
                    onClick={() => setActiveImageIdx(prev => (prev === allImages.length - 1 ? 0 : prev + 1))}
                    className="p-2 bg-white/80 rounded-full shadow-lg backdrop-blur-sm pointer-events-auto"
                  >
                    <ChevronRight size={20} />
                  </button>
               </div>

               {/* Mobile Indicators */}
               <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 md:hidden">
                  {allImages.map((_, i) => (
                    <div 
                      key={i} 
                      className={`w-1.5 h-1.5 rounded-full transition-all ${i === activeImageIdx ? 'bg-indigo-600 w-4' : 'bg-gray-300'}`}
                    />
                  ))}
               </div>
            </div>

            {/* Thumbnails (Desktop Side List) */}
            <div className="hidden md:flex md:flex-col gap-4 w-24">
               {allImages.map((img, i) => (
                 <button
                    key={i}
                    onClick={() => setActiveImageIdx(i)}
                    className={`aspect-square relative overflow-hidden border-2 transition-all ${
                      i === activeImageIdx ? 'border-indigo-600 ring-2 ring-indigo-50' : 'border-transparent hover:border-gray-200'
                    }`}
                 >
                    <img src={img} className="w-full h-full object-cover" />
                 </button>
               ))}
            </div>
            
            {/* Horizontal Thumbnails (Mobile Below) */}
            <div className="md:hidden flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
               {allImages.map((img, i) => (
                 <button
                    key={i}
                    onClick={() => setActiveImageIdx(i)}
                    className={`flex-shrink-0 w-20 aspect-square border-2 transition-all ${
                      i === activeImageIdx ? 'border-indigo-600' : 'border-transparent'
                    }`}
                 >
                    <img src={img} className="w-full h-full object-cover" />
                 </button>
               ))}
            </div>
          </div>

          {/* Right Column: Details (Sticky) */}
          <div className="lg:col-span-5 relative">
            <div className="lg:sticky lg:top-24 space-y-8">
              <div>
                <p className="text-xs font-bold tracking-[0.4em] uppercase text-indigo-600 mb-4">{product.brand}</p>
                <h1 className="text-4xl md:text-5xl font-serif text-indigo-950 mb-6 leading-tight">{product.name}</h1>
                
                <div className="flex items-center space-x-6">
                  <div className="flex text-yellow-500">
                    {[1, 2, 3, 4, 5].map(i => <Star key={i} size={14} fill="currentColor" />)}
                  </div>
                  <div className="h-4 w-px bg-gray-200" />
                  <span className="text-[10px] font-bold text-green-600 uppercase tracking-widest flex items-center">
                    <ShieldCheck size={12} className="mr-1.5" />
                    Authenticated Fragrance
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-3xl font-bold text-indigo-950">₹{currentVariant?.price}</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Tax included. Shipping calculated at checkout.</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-4">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-900 block">Select Size (ML)</label>
                  <div className="flex flex-wrap gap-3">
                    {product.variants?.map((v: any) => (
                      <button
                        key={v.size_ml}
                        onClick={() => setSelectedSize(v.size_ml)}
                        disabled={v.stock === 0}
                        className={`min-w-[80px] py-3 px-4 text-[10px] font-bold transition-all border ${
                          selectedSize === v.size_ml 
                          ? 'bg-indigo-950 text-white border-indigo-950 shadow-md transform -translate-y-0.5' 
                          : v.stock === 0 
                            ? 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed'
                            : 'border-gray-200 text-gray-500 hover:border-indigo-600 hover:text-indigo-950'
                        }`}
                      >
                        {v.size_ml}ML {v.stock === 0 && '(Null)'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4 pt-4">
                  <button 
                    onClick={handleAddToCart}
                    disabled={!currentVariant || currentVariant.stock === 0}
                    className="w-full bg-indigo-950 text-white py-6 text-[10px] font-bold uppercase tracking-widest hover:bg-black cursor-pointer transition-all flex items-center justify-center space-x-3 shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed group/cart"
                  >
                    <ShoppingBag size={18} className="group-hover/cart:scale-110 transition-transform" />
                    <span>{currentVariant?.stock === 0 ? 'Out of Stock' : 'Add to Cart'}</span>
                  </button>
                  
                  <div className="grid grid-cols-2 gap-4">
                     <div className="flex items-center space-x-3 p-4 bg-gray-50/50 rounded-lg">
                        <Truck size={18} className="text-indigo-600" />
                        <span className="text-[9px] font-bold uppercase tracking-widest leading-tight">Fast pan-india shipping</span>
                     </div>
                     <div className="flex items-center space-x-3 p-4 bg-gray-50/50 rounded-lg">
                        <ShieldCheck size={18} className="text-indigo-600" />
                        <span className="text-[9px] font-bold uppercase tracking-widest leading-tight">Secure Payment encryption</span>
                     </div>
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-gray-100">
                 <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-950 mb-6">Fragrance Description</h3>
                 <div className="prose prose-sm font-serif italic text-gray-600 leading-relaxed text-lg">
                    {product.description}
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
