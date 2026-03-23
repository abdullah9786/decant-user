"use client";

import ProductCard from "@/components/ui/ProductCard";

export default function FeaturedProducts({ products }: { products: any[] }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-8">
      {products.map((product) => (
        <ProductCard key={product._id || product.id} {...product} />
      ))}
    </div>
  );
}
