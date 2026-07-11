import { DEFAULT_ACCENT, formatINR, type MysteryTier } from "@/lib/mysteryGift";

export function getMysteryTiers(offer: any): MysteryTier[] {
  return [...(offer?.config?.tiers || [])]
    .filter((t: MysteryTier) => Number(t?.min_subtotal) > 0)
    .sort((a, b) => Number(a.min_subtotal) - Number(b.min_subtotal));
}

export function mysteryGiftAccent(offer: any, tiers: MysteryTier[]): string {
  return (
    offer?.display?.box_color ||
    tiers[tiers.length - 1]?.accent_color ||
    DEFAULT_ACCENT
  );
}

export function mysteryGiftTitle(offer: any): string {
  return offer?.display?.title_gift || "Unlock a Mystery Gift";
}

export function mysteryGiftHook(offer: any, tiers: MysteryTier[]): string {
  const taglines = tiers.map((t) => t.tagline?.trim()).filter(Boolean) as string[];
  if (taglines.length === 1) return taglines[0];
  if (taglines.length > 1) {
    return taglines.slice(0, 2).join(" · ");
  }
  const lowest = tiers[0];
  if (lowest?.name && lowest.min_subtotal) {
    return `Spend from ${formatINR(Number(lowest.min_subtotal))} to unlock ${lowest.name} — a free surprise decant in your parcel.`;
  }
  return "Spend more on your order — a hand-picked mystery decant ships free in your parcel.";
}
