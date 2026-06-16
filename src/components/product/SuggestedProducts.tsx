import FeaturedProducts from "@/components/home/FeaturedProducts";
import SectionHeader from "@/components/home/SectionHeader";

interface SuggestedProductsProps {
  products: any[];
  fragranceFamily?: string;
  brand?: string;
}

export default function SuggestedProducts({
  products,
  fragranceFamily,
  brand,
}: SuggestedProductsProps) {
  if (!products?.length) return null;

  const family = fragranceFamily?.trim();
  const brandName = brand?.trim();

  const title = family
    ? `More ${family} to explore`
    : brandName
      ? `More from ${brandName}`
      : "You may also like";

  const href = family
    ? `/products?${new URLSearchParams({ fragrance_family: family }).toString()}`
    : brandName
      ? `/products?${new URLSearchParams({ brand: brandName }).toString()}`
      : "/products";

  return (
    <section className="border-t border-emerald-100 bg-white py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Curated for you"
          title={title}
          href={href}
          linkLabel="View all"
        />
        <div className="mt-8">
          <FeaturedProducts products={products} compact />
        </div>
      </div>
    </section>
  );
}
