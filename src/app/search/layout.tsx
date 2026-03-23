import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Scent Finder — Search Perfume Decants by Notes, Brand & Mood",
  description:
    "Find your perfect perfume decant. Search by scent notes, brands, fragrance families, and moods. Authentic trial sizes with pan-India delivery.",
  alternates: { canonical: "https://decume.in/search" },
};

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
