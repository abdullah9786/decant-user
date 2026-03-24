import type { Metadata } from "next";
import CreatorsGrid from "./CreatorsGrid";

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
          <div className="mb-10">
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

          <CreatorsGrid influencers={influencers} />
        </div>
      </section>
    </div>
  );
}
