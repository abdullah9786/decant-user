"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { productApi } from '@/lib/api';
import { Loader2 } from 'lucide-react';

const FAMILY_DESCRIPTIONS: Record<string, string> = {
  'Woody': 'Warm, dry and earthy notes like sandalwood and cedar',
  'Floral': 'The most popular scent family, smelling like fresh-cut flowers',
  'Fresh': 'Zesty, aquatic and cooling scents like citrus and sea salt',
  'Oriental': 'Rich, exotic and spicy notes like vanilla and amber',
  'Gourmand': 'Delicious, edible scents like chocolate and caramel',
  'Fougère': 'The traditional masculine family, meaning "fern-like"',
  'Niche': 'Exclusively crafted scents with unique and rare ingredients',
  'Designer': 'Modern classics from the world\'s leading fashion houses',
  'Private Blend': 'The pinnacle of artisan perfumery, rare and refined',
};

export default function FamiliesPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFamilies = async () => {
      try {
        const response = await productApi.getAll();
        setProducts(response.data);
      } catch (err) {
        console.error("Error fetching families", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFamilies();
  }, []);

  const families = useMemo(() => {
    // Collect all categories (families) from products
    const uniqueFamilies = Array.from(new Set(products.map(p => p.category || 'Niche'))).sort();
    return uniqueFamilies.map(name => ({
      name,
      description: FAMILY_DESCRIPTIONS[name] || 'A unique and captivating olfactory experience.'
    }));
  }, [products]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
      </div>
    );
  }

  return (
    <div className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-serif text-indigo-950 mb-4 text-center">Fragrance Families</h1>
        <p className="text-gray-500 text-center uppercase tracking-[0.2em] text-xs mb-16">Discover your preferred olfactory category</p>

        {families.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {families.map((family) => (
              <Link 
                key={family.name}
                href={`/products?category=${family.name}`}
                className="bg-gray-50 p-10 border border-gray-100 hover:border-indigo-600 transition-all group"
              >
                <h3 className="text-2xl font-serif text-indigo-950 mb-4 group-hover:text-indigo-600 uppercase tracking-widest">{family.name}</h3>
                <p className="text-gray-600 text-sm leading-relaxed italic mb-8">{family.description}</p>
                <div className="flex items-center text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-600 border-b border-indigo-600 w-fit pb-1 group-hover:tracking-[0.3em] transition-all">
                  EXPLORE {family.name}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
             <p className="text-gray-400 italic">No families discovered yet. Check back soon for new additions.</p>
          </div>
        )}
      </div>
    </div>
  );
}
