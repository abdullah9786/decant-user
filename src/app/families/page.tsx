"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { fragranceFamilyApi } from '@/lib/api';
import { Loader2 } from 'lucide-react';

export default function FamiliesPage() {
  const [families, setFamilies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFamilies = async () => {
      try {
        const response = await fragranceFamilyApi.getAll();
        setFamilies(response.data || []);
      } catch (err) {
        console.error("Error fetching families", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFamilies();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-emerald-600" size={32} />
      </div>
    );
  }

  return (
    <div className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-serif text-emerald-950 mb-4 text-center">Fragrance Families</h1>
        <p className="text-gray-500 text-center uppercase tracking-[0.2em] text-xs mb-16">Discover your preferred olfactory family</p>

        {families.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {families.map((family) => (
              <Link 
                key={family._id || family.name}
                href={`/products?fragrance_family=${family.name}`}
                className="group rounded-3xl border border-emerald-100 bg-white/80 shadow-sm hover:shadow-xl transition-all overflow-hidden"
              >
                <div className="relative aspect-[16/10] bg-emerald-50/60">
                  {family.image_url ? (
                    <Image
                      src={family.image_url}
                      alt={family.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover group-hover:scale-[1.02] transition-transform"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.2),_transparent_60%)]" />
                  )}
                </div>
                <div className="p-8">
                  <h3 className="text-2xl font-serif text-emerald-950 mb-4 group-hover:text-emerald-600 uppercase tracking-widest">{family.name}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed italic mb-8">
                    {family.description || 'A unique and captivating olfactory experience.'}
                  </p>
                  <div className="flex items-center text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-600 border-b border-emerald-600 w-fit pb-1 group-hover:tracking-[0.3em] transition-all">
                    EXPLORE {family.name}
                  </div>
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
