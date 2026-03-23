import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop by Brand — Designer & Niche Perfume Houses",
  description:
    "Browse perfume decants by brand. Explore authentic fragrances from top designer and niche houses, available in trial sizes across India.",
  alternates: { canonical: "https://decume.in/brands" },
};

export default function BrandsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
