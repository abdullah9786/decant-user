import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Gift, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Gift Boxes | Decume",
  description:
    "Build your own perfume gift box. Choose your favourite fragrances and we'll pack them beautifully.",
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

async function getAllGiftBoxes() {
  try {
    const res = await fetch(`${API_URL}/gift-boxes`, {
      next: { revalidate: 120 },
    });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export default async function GiftBoxesPage() {
  const boxes = await getAllGiftBoxes();

  return (
    <div className="py-16 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-600 mb-3">
            Curated Collections
          </p>
          <h1 className="text-4xl md:text-5xl font-serif text-emerald-950 mb-4">
            Gift Boxes
          </h1>
          <p className="text-gray-500 max-w-xl mx-auto">
            Pick your favourite fragrances and we&apos;ll pack them in a
            beautiful box. Perfect for gifting or self-discovery.
          </p>
        </div>

        {boxes.length === 0 ? (
          <div className="text-center py-20">
            <Gift size={64} className="mx-auto text-gray-200 mb-6" />
            <p className="text-gray-400 uppercase tracking-widest text-xs">
              Gift boxes coming soon.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {boxes.map((box: any) => {
              const id = box.id || box._id;
              return (
                <Link
                  key={id}
                  href={`/gift-boxes/${id}`}
                  className="group block rounded-2xl border border-gray-100 bg-white overflow-hidden hover:shadow-lg hover:border-emerald-200 transition-all duration-300"
                >
                  <div className="relative aspect-[4/3] bg-gray-50 overflow-hidden">
                    {box.image_url ? (
                      <Image
                        src={box.image_url}
                        alt={box.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Gift
                          size={48}
                          className="text-gray-200"
                        />
                      </div>
                    )}
                    {box.tier === "premium" && (
                      <div className="absolute top-3 left-3 bg-amber-500 text-white text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                        Premium
                      </div>
                    )}
                    {box.stock < 1 && (
                      <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                        <span className="text-xs font-bold uppercase tracking-widest text-gray-500">
                          Out of Stock
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="font-serif text-xl text-emerald-950 mb-2 group-hover:text-emerald-700 transition-colors">
                      {box.name}
                    </h3>
                    <p className="text-xs text-gray-400 uppercase tracking-widest mb-4">
                      {box.slot_count} Fragrances &middot; {box.size_ml}ml each
                    </p>
                    {box.description && (
                      <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                        {box.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-gray-400 uppercase tracking-widest block">
                          Starting from
                        </span>
                        <span className="text-lg font-bold text-emerald-950">
                          ₹{box.box_price}
                        </span>
                        <span className="text-[10px] text-gray-400 ml-1">
                          + fragrances
                        </span>
                      </div>
                      <div className="flex items-center space-x-1 text-emerald-600 text-xs font-bold uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                        <span>Build</span>
                        <ArrowRight size={14} />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
