import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import ProductCard from "@/components/ui/ProductCard";
import StorefrontReferral from "./StorefrontReferral";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

async function getStorefront(username: string) {
  try {
    const res = await fetch(`${API_URL}/influencers/storefront/${username}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  const data = await getStorefront(username);
  if (!data) return { title: "Not Found" };

  const { profile } = data;
  return {
    title: `${profile.display_name} — Curated Decants`,
    description:
      profile.bio ||
      `Shop ${profile.display_name}'s curated perfume decant collection on Decume.`,
    alternates: { canonical: `https://decume.in/${username}` },
    openGraph: {
      title: `${profile.display_name} — Curated Decants on Decume`,
      description:
        profile.bio ||
        `Discover ${profile.display_name}'s top fragrance picks.`,
      url: `https://decume.in/${username}`,
      ...(profile.banner_image_url && {
        images: [{ url: profile.banner_image_url }],
      }),
    },
  };
}

export default async function StorefrontPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const data = await getStorefront(username);

  if (!data) notFound();

  const { profile, sections } = data;

  return (
    <>
      <StorefrontReferral
        influencerId={profile._id}
        username={profile.username}
      />

      <div className="bg-transparent min-h-screen">
        {/* Banner + Profile Header */}
        <section className="relative">
          {profile.banner_image_url ? (
            <div className="relative w-full h-48 md:h-64 lg:h-80">
              <Image
                src={profile.banner_image_url}
                alt={`${profile.display_name}'s banner`}
                fill
                sizes="100vw"
                priority
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            </div>
          ) : (
            <div className="w-full h-48 md:h-64 lg:h-80 bg-gradient-to-br from-emerald-900 to-emerald-950" />
          )}

          {/* Avatar overlapping banner */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative -mt-14 md:-mt-18 z-10">
            <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white shadow-xl overflow-hidden bg-emerald-100 mx-auto md:mx-0">
              {profile.profile_image_url ? (
                <Image
                  src={profile.profile_image_url}
                  alt={profile.display_name}
                  fill
                  sizes="128px"
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl font-serif text-emerald-700">
                  {profile.display_name?.charAt(0)?.toUpperCase() || "?"}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Creator Info Block */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-b from-emerald-950 to-emerald-900 text-white rounded-2xl px-6 md:px-10 py-6 md:py-8">
            <div className="text-center md:text-left">
              <h1 className="text-2xl md:text-3xl font-serif">
                {profile.display_name}
              </h1>
              <p className="text-xs uppercase tracking-[0.3em] text-emerald-300 font-bold mt-1.5">
                @{profile.username}
              </p>
              {profile.bio && (
                <p className="mt-3 text-sm text-emerald-100/80 max-w-2xl leading-relaxed md:pr-8">
                  {profile.bio}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Sections */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 space-y-14">
          {sections.length > 0 ? (
            sections.map((section: any) => (
              <section key={section._id}>
                <h2 className="text-2xl md:text-3xl font-serif text-emerald-950 mb-6">
                  {section.title}
                </h2>
                {section.products.length > 0 ? (
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-8">
                    {section.products.map((product: any) => (
                      <ProductCard
                        key={product._id || product.id}
                        {...product}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 italic">
                    No products in this section yet.
                  </p>
                )}
              </section>
            ))
          ) : (
            <div className="text-center py-20">
              <p className="text-slate-400 italic text-sm">
                This creator hasn&apos;t added any collections yet.
              </p>
              <Link
                href="/products"
                className="inline-block mt-6 text-xs font-bold uppercase tracking-widest text-emerald-700 border-b border-emerald-700"
              >
                Browse all products
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
