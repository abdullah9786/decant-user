import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductDetailClient from "../ProductDetailClient";
import {
  getBottles,
  getProduct,
  getReviewSummary,
  pickDefaultVariant,
  sanitizeDescription,
  seoInput,
} from "../productData";
import {
  buildProductBreadcrumbJsonLd,
  buildProductJsonLd,
  buildProductSeoCopy,
  buildSealedBottleCanonicalUrl,
  getProductFormat,
  type MatchedVariant,
} from "@/lib/product/productSeo";

export const revalidate = 86400;
export const dynamicParams = true;

/**
 * Dedicated landing page for the sealed-bottle format of a product that also
 * sells decants. The primary PDP (`/products/[id]`) defaults its title to
 * decant (the more common intent) once a product offers both, which used to
 * leave sealed-bottle search intent with no crisply-titled page at all. This
 * route exists purely to give that intent its own indexable URL — see
 * `productSeo.ts`'s `format.hasDecant` priority for the other half of the fix.
 */
function resolvePackVariant(product: any): MatchedVariant | null {
  const packVariants = (product.variants ?? []).filter((v: any) => v.is_pack);
  const picked = pickDefaultVariant(packVariants, 0);
  if (!picked) return null;
  return {
    size_ml: picked.size_ml,
    price: picked.price,
    is_pack: true,
    stock: picked.stock,
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) return { title: "Product Not Found | Decume" };

  const format = getProductFormat(product.variants);
  if (product.product_type === "set" || !format.hasPack) {
    return { title: "Product Not Found | Decume" };
  }

  const slug = product.slug || product._id || product.id;
  const matchedVariant = resolvePackVariant(product);
  const seo = buildProductSeoCopy(seoInput(product, matchedVariant));
  const canonicalUrl = buildSealedBottleCanonicalUrl(slug);

  return {
    title: seo.title,
    description: seo.description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: seo.title,
      description: seo.description,
      url: canonicalUrl,
      type: "website",
      ...(product.image_url && {
        images: [{ url: product.image_url, alt: seo.imageAlt }],
      }),
    },
    twitter: {
      card: "summary_large_image",
      title: seo.title,
      description: seo.description,
      ...(product.image_url && { images: [product.image_url] }),
    },
  };
}

export default async function SealedBottlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();

  const format = getProductFormat(product.variants);
  // Sets don't go through this flow at all, and a product with no pack
  // variant has nothing to show here. A pack-only product's own base PDP
  // *already is* the sealed-bottle page (see productSeo.ts's `hasPack`
  // branch), so a distinct page here would just be duplicate content —
  // 404 rather than redirect, since this specific sub-resource genuinely
  // doesn't exist for these products (nothing links or sitemaps it either).
  if (product.product_type === "set" || !format.hasPack || !format.hasDecant) {
    notFound();
  }

  const bottles = await getBottles();
  const slug = product.slug || product._id || product.id;
  const productId = String(product._id || product.id);
  const reviewSummary = await getReviewSummary(productId);

  const matchedVariant = resolvePackVariant(product);
  const seo = buildProductSeoCopy(seoInput(product, matchedVariant));
  const canonicalUrl = buildSealedBottleCanonicalUrl(slug);
  const descriptionHtml = sanitizeDescription(product.description);

  const productJsonLd = buildProductJsonLd({
    name: product.name,
    brand: product.brand,
    description: product.description,
    imageUrl: product.image_url,
    slug,
    stockMl: product.stock_ml,
    variants: product.variants,
    matchedVariant,
    jsonLdName: seo.jsonLdName,
    canonicalUrlOverride: canonicalUrl,
    reviewSummary:
      reviewSummary.review_count > 0
        ? {
            average_rating: reviewSummary.average_rating,
            review_count: reviewSummary.review_count,
          }
        : undefined,
  });

  const breadcrumbJsonLd = buildProductBreadcrumbJsonLd({
    productName: `${product.name} (Sealed Bottle)`,
    canonicalUrl,
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <ProductDetailClient
        product={product}
        bottles={bottles}
        reviewSummary={reviewSummary}
        descriptionHtml={descriptionHtml}
        initialIsPack
        decantUrl={`/products/${slug}`}
      />
    </>
  );
}
