import { getMysteryTiers } from "@/components/home/offers/mysteryGiftShared";

export type HomeOffer = {
  _id?: string;
  id?: string;
  name?: string;
  type?: string;
  is_active?: boolean;
  sort_order?: number;
  starts_at?: string | null;
  ends_at?: string | null;
  display?: Record<string, string | undefined>;
  config?: Record<string, unknown>;
};

export function offerId(offer: HomeOffer): string {
  return String(offer._id || offer.id || offer.type || "");
}

function offerProductIds(offer: HomeOffer): string[] {
  const config = offer.config || {};
  if (offer.type === "daily_deal") {
    return ((config.product_ids as string[]) || []).filter(Boolean);
  }
  if (offer.type === "free_decant") {
    return ((config.eligible_product_ids as string[]) || []).filter(Boolean);
  }
  return [];
}

export function isOfferVisibleInHomeRewards(offer: HomeOffer): boolean {
  if (!offer?.is_active || !offer.type?.trim()) return false;

  switch (offer.type) {
    case "mystery_gift":
      return getMysteryTiers(offer).length > 0;
    case "daily_deal":
      return offerProductIds(offer).length > 0;
    default:
      return true;
  }
}

export function filterHomeRewardsOffers(offers: HomeOffer[]): HomeOffer[] {
  const visible = (offers || []).filter(isOfferVisibleInHomeRewards);
  return visible.sort((a, b) => {
    const aOrder = Number(a.sort_order ?? 0);
    const bOrder = Number(b.sort_order ?? 0);
    if (aOrder !== bOrder) return aOrder - bOrder;
    return String(a.name || "").localeCompare(String(b.name || ""));
  });
}

export function homeRewardsGridClass(count: number): string {
  if (count <= 1) return "mx-auto max-w-4xl";
  if (count === 2) return "grid grid-cols-1 items-stretch gap-4 md:gap-6 lg:grid-cols-2";
  return "grid grid-cols-1 items-stretch gap-4 md:gap-6 lg:grid-cols-2 xl:grid-cols-3";
}

export function offerTypeLabel(type: string | undefined): string {
  if (!type) return "Offer";
  return type
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
