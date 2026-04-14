import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop by Category | Decume",
  description:
    "Browse perfume decants by category. Shop for men, for women, under ₹999, best sellers and more at Decume.",
  alternates: { canonical: "https://decume.in/categories" },
};

export default function CategoriesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
