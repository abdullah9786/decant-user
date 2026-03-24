import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export const metadata: Metadata = {
  title: "Explore Creators — Curated Fragrance Collections",
  description:
    "Discover top fragrance creators on Decume. Browse their curated perfume decant collections and find your next signature scent.",
  alternates: { canonical: "https://decume.in/creators" },
};

async function getInfluencers() {
  try {
    const res = await fetch(`${API_URL}/influencers/public/list`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export default async function CreatorsPage() {
  const influencers = await getInfluencers();

  return (
    <div className="bg-transparent min-h-screen">
      <section className="py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <div className="text-[10px] uppercase tracking-[0.35em] text-emerald-700 font-bold">
              Community
            </div>
            <h1 className="text-4xl md:text-5xl font-serif text-emerald-950 mt-2">
              Explore Creators
            </h1>
            <p className="text-slate-500 mt-3 max-w-2xl">
              Discover curated perfume collections handpicked by fragrance
              enthusiasts and influencers.
            </p>
          </div>

          {influencers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {influencers.map((inf: any) => (
                <Link
                  key={inf._id}
                  href={`/${inf.username}`}
                  className="group block bg-white border border-emerald-50 rounded-2xl overflow-hidden hover:shadow-lg hover:border-emerald-200 transition-all"
                >
                  <div className="relative h-32 bg-gradient-to-br from-emerald-100 to-emerald-50">
                    {inf.banner_image_url && (
                      <Image
                        src={inf.banner_image_url}
                        alt={`${inf.display_name}'s banner`}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="px-5 pb-5 -mt-8 relative">
                    <div className="relative w-16 h-16 rounded-full border-4 border-white shadow-md overflow-hidden bg-emerald-100 mb-3">
                      {inf.profile_image_url ? (
                        <Image
                          src={inf.profile_image_url}
                          alt={inf.display_name}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xl font-serif text-emerald-700">
                          {inf.display_name?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-emerald-950 group-hover:text-emerald-700 transition-colors">
                      {inf.display_name}
                    </h3>
                    <p className="text-xs text-emerald-600 font-bold uppercase tracking-widest">
                      @{inf.username}
                    </p>
                    {inf.bio && (
                      <p className="text-sm text-slate-500 mt-2 line-clamp-2">
                        {inf.bio}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-slate-400 italic">
                No creators yet. Check back soon!
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
