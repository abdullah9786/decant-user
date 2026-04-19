import type { Metadata } from "next";
import Image from "next/image";
import { PerfumeBottle } from "@/components/icons/PerfumeBottle";

export const metadata: Metadata = {
  title: "Our Bottles | Decume",
  description:
    "Explore the bottle types we use for our perfume decants. Each bottle is carefully chosen for portability, durability, and style.",
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

async function getAllBottles() {
  try {
    const res = await fetch(`${API_URL}/bottles`, {
      next: { revalidate: 900 },
    });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export default async function BottlesPage() {
  const bottles = await getAllBottles();

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative h-[50vh] min-h-[360px] max-h-[500px] flex items-center justify-center overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1615634260167-c8cdede054de?q=80&w=2000&auto=format&fit=crop"
          alt="Perfume bottles"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-emerald-950/60" />
        <div className="relative text-center px-4 sm:px-6 lg:px-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-300 mb-3">
            Crafted for Perfection
          </p>
          <h1 className="text-4xl md:text-5xl font-serif text-white mb-4">
            Our Bottles
          </h1>
          <p className="text-emerald-100/80 max-w-xl mx-auto">
            Every fragrance deserves the right vessel. We offer different bottle
            types to match your lifestyle — from pocket-friendly atomizers to
            elegant spray bottles.
          </p>
        </div>
      </section>

      {/* Bottles Grid */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {bottles.length === 0 ? (
            <div className="text-center py-20">
              <PerfumeBottle size={64} className="mx-auto text-gray-200 mb-6" />
              <p className="text-gray-400 uppercase tracking-widest text-xs">
                Bottles coming soon.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
              {bottles.map((bottle: any) => {
                const id = bottle.id || bottle._id;
                const sizePrices = bottle.size_prices || {};
                const sizes = (bottle.compatible_sizes || []).sort(
                  (a: number, b: number) => a - b
                );

                return (
                  <div
                    key={id}
                    className="group relative bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:border-emerald-100 transition-all duration-300"
                  >
                    {/* Image */}
                    <div className="relative aspect-[4/3] bg-gray-50 overflow-hidden">
                      {bottle.image_url ? (
                        <Image
                          src={bottle.image_url}
                          alt={bottle.name}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-contain p-6 scale-150 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <PerfumeBottle size={48} className="text-gray-200" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-5 space-y-3">
                      <div>
                        <h3 className="font-serif text-lg text-emerald-950 mb-1 group-hover:text-emerald-700 transition-colors">
                          {bottle.name}
                        </h3>
                        {bottle.description && (
                          <p className="text-xs text-gray-400 line-clamp-2">
                            {bottle.description}
                          </p>
                        )}
                      </div>

                      {/* Size & Price Table */}
                      {sizes.length > 0 && (
                        <div className="space-y-1.5">
                          {sizes.map((sz: number) => {
                            const price = sizePrices[String(sz)] ?? 0;
                            return (
                              <div
                                key={sz}
                                className="flex items-center justify-between py-2 px-3 bg-gray-50/80 rounded-lg"
                              >
                                <div className="flex items-center space-x-2">
                                  <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
                                    <span className="text-[9px] font-bold text-emerald-700">
                                      {sz}
                                    </span>
                                  </div>
                                  <span className="text-xs font-medium text-emerald-950">
                                    {sz}ml
                                  </span>
                                </div>
                                <span className="text-xs font-bold text-emerald-950">
                                  {price > 0 ? `+₹${price}` : "+₹0"}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Info Banner */}
      <section className="py-16 md:py-20 bg-emerald-950 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-300">
            How It Works
          </p>
          <h2 className="text-3xl md:text-4xl font-serif leading-tight">
            Your fragrance, your bottle
          </h2>
          <p className="text-emerald-200 max-w-2xl mx-auto leading-relaxed">
            When you add a decant to your cart, you&apos;ll be able to pick
            your preferred bottle type. The additional cost (if any) is added
            to the decant price automatically.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8">
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <p className="text-3xl font-serif mb-2">01</p>
              <p className="text-sm font-bold uppercase tracking-widest mb-1">
                Choose Size
              </p>
              <p className="text-xs text-emerald-300">
                Pick your preferred decant size.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <p className="text-3xl font-serif mb-2">02</p>
              <p className="text-sm font-bold uppercase tracking-widest mb-1">
                Pick Bottle
              </p>
              <p className="text-xs text-emerald-300">
                Select the bottle type that suits you.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <p className="text-3xl font-serif mb-2">03</p>
              <p className="text-sm font-bold uppercase tracking-widest mb-1">
                Add to Cart
              </p>
              <p className="text-xs text-emerald-300">
                Price adjusts automatically. Done.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
