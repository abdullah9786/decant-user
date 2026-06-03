"use client";

import ProductCard from "@/components/ui/ProductCard";

export default function FeaturedProducts({
  products,
  priceMode,
  compact = false,
}: {
  products: any[];
  priceMode?: 'default' | 'pack';
  compact?: boolean;
}) {
  return (
    <div
      className={`grid grid-cols-2 lg:grid-cols-4 ${
        compact
          ? 'gap-2 md:gap-4 -mx-4 px-2 md:-mx-7 md:px-4'
          : 'gap-3 md:gap-8'
      }`}
    >
      {products.map((product) => (
        <ProductCard key={product._id || product.id} {...product} priceMode={priceMode} />
      ))}
    </div>
  );
}
