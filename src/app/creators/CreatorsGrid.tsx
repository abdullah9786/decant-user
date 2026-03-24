"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, Sparkles, ArrowUpRight } from "lucide-react";

interface Influencer {
  _id: string;
  username: string;
  display_name: string;
  bio?: string;
  profile_image_url?: string;
  banner_image_url?: string;
  section_count?: number;
}

export default function CreatorsGrid({
  influencers,
}: {
  influencers: Influencer[];
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return influencers;
    const q = query.toLowerCase();
    return influencers.filter(
      (inf) =>
        inf.display_name?.toLowerCase().includes(q) ||
        inf.username?.toLowerCase().includes(q) ||
        inf.bio?.toLowerCase().includes(q)
    );
  }, [query, influencers]);

  return (
    <>
      {/* Search */}
      <div className="relative max-w-md mb-10">
        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search creators..."
          className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 transition-all shadow-sm"
        />
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((inf) => (
            <Link
              key={inf._id}
              href={`/${inf.username}`}
              className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-slate-100 hover:border-emerald-200 transition-all duration-300"
            >
              {/* Banner */}
              <div className="relative h-36 overflow-hidden">
                {inf.banner_image_url ? (
                  <Image
                    src={inf.banner_image_url}
                    alt={`${inf.display_name}'s banner`}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-200 via-emerald-100 to-teal-50" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

                {/* Visit arrow */}
                <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <ArrowUpRight size={14} className="text-white" />
                </div>
              </div>

              {/* Avatar */}
              <div className="px-5 -mt-10 relative z-10">
                <div className="relative w-20 h-20 rounded-full border-[3px] border-white shadow-lg overflow-hidden bg-emerald-50 ring-4 ring-emerald-50/50">
                  {inf.profile_image_url ? (
                    <Image
                      src={inf.profile_image_url}
                      alt={inf.display_name}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-100 to-emerald-200">
                      <span className="text-2xl font-serif font-bold text-emerald-700">
                        {inf.display_name?.charAt(0)?.toUpperCase() || "?"}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="px-5 pt-3 pb-5">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors truncate">
                    {inf.display_name}
                  </h3>
                  <Sparkles
                    size={14}
                    className="text-emerald-500 flex-shrink-0"
                  />
                </div>
                <p className="text-xs text-emerald-600/80 font-semibold tracking-wide mt-0.5">
                  @{inf.username}
                </p>
                {inf.bio && (
                  <p className="text-sm text-slate-500 mt-2.5 line-clamp-2 leading-relaxed">
                    {inf.bio}
                  </p>
                )}

                {/* CTA */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                    View Collection
                  </span>
                  <div className="w-7 h-7 rounded-full bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-600 transition-colors duration-300">
                    <ArrowUpRight
                      size={13}
                      className="text-emerald-600 group-hover:text-white transition-colors duration-300"
                    />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          {query.trim() ? (
            <div>
              <Search size={40} className="mx-auto text-slate-200 mb-4" />
              <p className="text-slate-400">
                No creators found for &ldquo;{query}&rdquo;
              </p>
              <button
                onClick={() => setQuery("")}
                className="mt-3 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
              >
                Clear search
              </button>
            </div>
          ) : (
            <p className="text-slate-400 italic">
              No creators yet. Check back soon!
            </p>
          )}
        </div>
      )}
    </>
  );
}
