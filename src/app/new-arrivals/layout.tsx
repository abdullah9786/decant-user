import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "New Arrivals — Latest Perfume Decants",
  description:
    "Shop the latest perfume decants added to our collection. Fresh drops from designer and niche houses, available in trial sizes.",
  alternates: { canonical: "https://decume.in/new-arrivals" },
};

export default function NewArrivalsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
