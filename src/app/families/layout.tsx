import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fragrance Families — Woody, Floral, Oriental & More",
  description:
    "Discover perfume decants by fragrance family. Explore woody, floral, oriental, fresh, and more olfactory categories at Decume.",
  alternates: { canonical: "https://decume.in/families" },
};

export default function FamiliesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
