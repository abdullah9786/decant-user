import { Suspense } from "react";
import { notFound } from "next/navigation";
import BuilderClient from "./BuilderClient";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

async function getGiftBox(id: string) {
  try {
    const res = await fetch(`${API_URL}/gift-boxes/${id}`, {
      next: { revalidate: 120 },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function getProducts() {
  try {
    const res = await fetch(`${API_URL}/products`, {
      next: { revalidate: 120 },
    });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export default async function GiftBoxBuilderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [box, products] = await Promise.all([getGiftBox(id), getProducts()]);

  if (!box) return notFound();

  return (
    <Suspense
      fallback={
        <div className="py-32 text-center text-gray-300 font-serif italic">
          Loading...
        </div>
      }
    >
      <BuilderClient box={box} allProducts={products} />
    </Suspense>
  );
}
